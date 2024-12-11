const apiUrl = "https://eldenring.fanapis.com/api/weapons";
const maxWeapons = 25;

let weapons = [];
let currentWeaponIndex = 0;
let correctAnswers = [];
let incorrectAnswers = [];

async function fetchWeapons() {
  const response = await fetch(apiUrl);
  const data = await response.json();
  const allWeapons = data.data;

  while (weapons.length < maxWeapons) {
    const randomWeapon =
      allWeapons[Math.floor(Math.random() * allWeapons.length)];
    if (!weapons.some((weapon) => weapon.name === randomWeapon.name)) {
      weapons.push(randomWeapon);
    }
  }

  displayWeapon();
}

function displayWeapon() {
  const weapon = weapons[currentWeaponIndex];
  const weaponNameEl = document.getElementById("weapon-name");
  const choicesContainer = document.getElementById("choices-container");
  const nextButton = document.getElementById("next-button");

  weaponNameEl.textContent = weapon.name;
  choicesContainer.innerHTML = "";

  const choices = [
    weapon.attack,
    weapon.defense,
    weapon.weight,
    weapon.dexterity,
  ];
  choices.sort(() => Math.random() - 0.5);

  choices.forEach((choice) => {
    const button = document.createElement("button");
    button.textContent = choice;
    button.className = "bg-gray-700 px-4 py-2 rounded hover:bg-gray-500";
    button.addEventListener("click", () => {
      if (choice === weapon.attack) {
        correctAnswers.push(weapon);
      } else {
        incorrectAnswers.push(weapon);
      }
      nextButton.classList.remove("hidden");
    });
    choicesContainer.appendChild(button);
  });
}

document.getElementById("next-button").addEventListener("click", () => {
  currentWeaponIndex++;
  if (currentWeaponIndex < weapons.length) {
    displayWeapon();
    document.getElementById("next-button").classList.add("hidden");
  } else {
    displayResults();
  }
});

function displayResults() {
  const resultsContainer = document.getElementById("results");
  const scoreEl = document.getElementById("score");

  const total = weapons.length;
  const correct = correctAnswers.length;
  const percentage = ((correct / total) * 100).toFixed(2);

  scoreEl.textContent = `Score: ${correct}/${total} (${percentage}%)`;
  resultsContainer.classList.remove("hidden");
}

document.getElementById("view-results").addEventListener("click", () => {
  const detailedResults = document.getElementById("detailed-results");
  const correctList = document.getElementById("correct-list");
  const incorrectList = document.getElementById("incorrect-list");

  correctList.innerHTML = correctAnswers
    .map((weapon) => `<li>${weapon.name}</li>`)
    .join("");
  incorrectList.innerHTML = incorrectAnswers
    .map((weapon) => `<li>${weapon.name}</li>`)
    .join("");

  detailedResults.classList.remove("hidden");
});

fetchWeapons();
