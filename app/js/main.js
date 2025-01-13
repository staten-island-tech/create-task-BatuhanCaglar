import "../css/style.css";

let weapons = [];
let currentWeaponIndex = 0;
let correctGuesses = [];
let wrongGuesses = [];
let canAnswer = true; 
let timeoutId = null;

const scalingPriority = {
  E: 1,
  D: 2,
  C: 3,
  B: 4,
  A: 5,
  S: 6, 
};

async function fetchWeapons() {
  try {
    const response = await fetch(
      "https://eldenring.fanapis.com/api/weapons?limit=250"
    );
    const data = await response.json();

    const validWeapons = data.data.filter(
      (weapon) =>
        weapon.scalesWith &&
        weapon.scalesWith.length > 0 &&
        weapon.scalesWith.some((scaling) =>
          ["A", "B", "C", "D", "E", "S"].includes(scaling.scaling)
        )
    );

    weapons = getRandomWeapons(validWeapons, 25);
    displayWeapon();
  } catch (error) {
    console.error("Error fetching weapons:", error);
    alert(
      "Failed to load weapon data. Please check your internet connection and try again."
    );
  }
}

function getRandomWeapons(data, n) {
  const shuffled = data.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n).map((weapon) => ({
    name: weapon.name || "Unknown Weapon",
    description: weapon.description || "No description available.",
    image: weapon.image || "https://via.placeholder.com/300",
    scalesWith: processScalingData(weapon.scalesWith),
  }));
}

function processScalingData(scalesWith) {
  return scalesWith
    .map((scaling) =>
      scalingPriority[scaling.scaling]
        ? {
            name: normalizeScalingName(scaling.name),
            priority: scalingPriority[scaling.scaling],
          }
        : null
    )
    .filter(Boolean)
    .sort((a, b) => b.priority - a.priority)
    .map((scaling) => scaling.name);
}

function normalizeScalingName(name) {
  const mapping = {
    Str: "Strength",
    Dex: "Dexterity",
    Int: "Intelligence",
    Fai: "Faith",
    Arc: "Arcane",
  };
  return mapping[name] || name;
}

function displayWeapon() {
  if (currentWeaponIndex >= weapons.length) {
    showResults();
    return;
  }

  const weapon = weapons[currentWeaponIndex];
  console.log(`Scaling data for ${weapon.name}:`, weapon.scalesWith);

  document.getElementById("weapon-name").innerText = weapon.name;
  document.getElementById("weapon-description").innerText = weapon.description;
  document.getElementById("weapon-image").src = weapon.image;
  document.getElementById("weapon-image").alt = weapon.name;

  document.getElementById("feedback").innerText = "";

  canAnswer = false;

  if (timeoutId) clearTimeout(timeoutId);

  timeoutId = setTimeout(() => {
    canAnswer = true;
  }, 1000);
}

function processAnswers(answers, correctScaling) {
  document.getElementById("feedback").innerHTML = "";

  for (let i = 0; i < answers.length; i++) {
    const answer = answers[i].toLowerCase();

    if (correctScaling.includes(answer)) {
      correctGuesses.push(weapons[currentWeaponIndex].name);
      document.getElementById("feedback").innerHTML += `<p>Answer ${i + 1}: Correct!</p>`;
    } else {
      wrongGuesses.push(weapons[currentWeaponIndex].name);
      document.getElementById("feedback").innerHTML += `<p>Answer ${i + 1}: Wrong!</p>`;
    }
  }

  console.log("Processed answers:", {
    correctGuesses,
    wrongGuesses,
  });
}

function makeGuess(choice) {
  if (!canAnswer) {
    document.getElementById("feedback").innerText = "Wait for the next weapon!";
    return;
  }

  const weapon = weapons[currentWeaponIndex];
  const correctScaling = weapon.scalesWith.map((s) => s.toLowerCase());

  processAnswers([choice], correctScaling);

  canAnswer = false;
  setTimeout(() => {
    currentWeaponIndex++;
    displayWeapon();
  }, 700);
}

function showResults() {
  const total = correctGuesses.length + wrongGuesses.length;
  const percentage = ((correctGuesses.length / total) * 100).toFixed(2);

  const resultsHTML = `
      <h2>Game Over!</h2>
      <p>Correct: ${correctGuesses.length} / ${total} (${percentage}%)</p>
      <p>Wrong: ${wrongGuesses.length}</p>
      <h3>Correct Answers:</h3>
      <ul>${correctGuesses.map((name) => `<li>${name}</li>`).join("")}</ul>
      <h3>Wrong Answers:</h3>
      <ul>${wrongGuesses.map((name) => `<li>${name}</li>`).join("")}</ul>
      <button id="retry-button">Retake Quiz</button>
  `;

  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = resultsHTML;
  resultsDiv.style.display = "block";

  document.getElementById("game-container").style.display = "none";

  document.getElementById("retry-button").addEventListener("click", retakeQuiz);
}

function retakeQuiz() {
  currentWeaponIndex = 0;
  correctGuesses = [];
  wrongGuesses = [];

  document.getElementById("results").innerHTML = "";
  document.getElementById("game-container").style.display = "block";

  fetchWeapons();
}

document.querySelectorAll(".guess-button").forEach((button) => {
  button.addEventListener("click", () => {
    makeGuess(button.innerText);
  });
});

fetchWeapons();
