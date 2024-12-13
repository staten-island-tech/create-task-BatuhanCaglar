import "../css/style.css";

let weapons = [];
let currentWeapon = null;
let correctAnswers = [];
let incorrectAnswers = [];
let seenWeapons = new Set();

// Fetch weapons from the API
async function fetchWeapons() {
  try {
    const response = await fetch(
      "https://eldenring.fanapis.com/api/weapons?limit=25"
    );
    const data = await response.json();

    // Filter weapons to ensure they have valid scaling data
    weapons = data.data.filter(
      (weapon) =>
        !seenWeapons.has(weapon.id) &&
        weapon.scalesWith &&
        weapon.scalesWith.length > 0
    );

    shuffleArray(weapons); // Shuffle to randomize weapon order
  } catch (error) {
    console.error("Error fetching weapons:", error);
    alert("Failed to load weapons. Please try again later.");
  }
}

// Shuffle array (Fisher-Yates algorithm)
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Display the next weapon
function displayWeapon() {
  if (weapons.length === 0) {
    endQuiz();
    return;
  }

  currentWeapon = weapons.pop();
  seenWeapons.add(currentWeapon.id);

  // Display weapon details
  const weaponName = document.getElementById("weapon-name");
  const weaponImage = document.getElementById("weapon-image");
  const weaponDescription = document.getElementById("weapon-description");
  const weaponScalesWith = document.getElementById("weapon-scaleswith");

  weaponName.textContent = currentWeapon.name;
  weaponImage.src = currentWeapon.image || "placeholder.png"; // Placeholder if no image
  weaponDescription.textContent =
    currentWeapon.description || "No description available.";
  weaponScalesWith.innerHTML = currentWeapon.scalesWith
    .map((scale) => `<li>${scale.name}: ${scale.scaling}</li>`)
    .join("");

  const progress = document.getElementById("progress");
  progress.textContent = `Weapons Remaining: ${weapons.length}`;
}

// Handle user's choice
function handleChoice(event) {
  if (!event.target.classList.contains("option-btn")) return;

  const selectedStat = event.target.dataset.stat;

  // Get valid stats from the weapon's scalesWith
  const validStats = currentWeapon.scalesWith.map((scale) =>
    scale.name.toLowerCase()
  );

  if (validStats.includes(selectedStat)) {
    correctAnswers.push(currentWeapon.name);
  } else {
    incorrectAnswers.push(currentWeapon.name);
  }

  displayWeapon();
}

// End the quiz
function endQuiz() {
  const quizContainer = document.getElementById("quiz-container");
  const resultsContainer = document.getElementById("results-container");
  const score = document.getElementById("score");
  const correctList = document.getElementById("correct-list");
  const incorrectList = document.getElementById("incorrect-list");

  quizContainer.classList.add("hidden");
  resultsContainer.classList.remove("hidden");

  const total = correctAnswers.length + incorrectAnswers.length;
  score.textContent = `Score: ${correctAnswers.length}/${total} (${(
    (correctAnswers.length / total) *
    100
  ).toFixed(2)}%)`;

  correctList.innerHTML = correctAnswers
    .map((name) => `<li>${name}</li>`)
    .join("");
  incorrectList.innerHTML = incorrectAnswers
    .map((name) => `<li>${name}</li>`)
    .join("");
}

// Restart the quiz
function restartQuiz() {
  correctAnswers = [];
  incorrectAnswers = [];
  seenWeapons.clear();

  document.getElementById("quiz-container").classList.remove("hidden");
  document.getElementById("results-container").classList.add("hidden");

  initializeQuiz();
}

// Initialize the quiz
async function initializeQuiz() {
  await fetchWeapons();
  if (weapons.length > 0) {
    displayWeapon();
  } else {
    alert("No weapons found. Please try again later.");
  }
}

// Event listeners
document.getElementById("options").addEventListener("click", handleChoice);
document.getElementById("restart-btn").addEventListener("click", restartQuiz);

// Start the quiz
initializeQuiz();
