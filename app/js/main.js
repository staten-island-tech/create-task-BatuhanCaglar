import "../css/style.css";

// Global variables
let weapons = [];
let currentWeaponIndex = 0;
let correctGuesses = [];
let wrongGuesses = [];
let canAnswer = true; // Prevent spamming answers
let timeoutId = null; // Track timer for enabling answers

// Scaling priority mapping
const scalingPriority = {
  E: 1,
  D: 2,
  C: 3,
  B: 4,
  A: 5,
  S: 6, // "S" represents the highest scaling
};

// Fetch weapons from the API and initialize the game
async function fetchWeapons() {
  try {
    const response = await fetch(
      "https://eldenring.fanapis.com/api/weapons?limit=250"
    );
    const data = await response.json();

    // Filter valid weapons (only those with "scalesWith" data and valid scaling letters)
    const validWeapons = data.data.filter(
      (weapon) =>
        weapon.scalesWith &&
        weapon.scalesWith.length > 0 &&
        weapon.scalesWith.some((scaling) =>
          ["A", "B", "C", "D", "E", "S"].includes(scaling.scaling)
        )
    );

    weapons = getRandomWeapons(validWeapons, 25);

    displayWeapon(); // Start the game by displaying the first weapon
  } catch (error) {
    console.error("Error fetching weapons:", error);
    alert(
      "Failed to load weapon data. Please check your internet connection and try again."
    );
  }
}

// Utility function: Randomly pick N items from the array
function getRandomWeapons(data, n) {
  const shuffled = data.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n).map((weapon) => ({
    name: weapon.name || "Unknown Weapon",
    description: weapon.description || "No description available.",
    image: weapon.image || "https://via.placeholder.com/300",
    scalesWith: processScalingData(weapon.scalesWith), // Process scaling data
  }));
}

// Process and sort scaling data by priority
function processScalingData(scalesWith) {
  return scalesWith
    .map((scaling) =>
      scalingPriority[scaling.scaling]
        ? {
            name: normalizeScalingName(scaling.name),
            priority: scalingPriority[scaling.scaling],
          }
        : null
    ) // Filter out invalid scaling
    .filter(Boolean) // Remove null values
    .sort((a, b) => b.priority - a.priority) // Sort by priority (descending)
    .map((scaling) => scaling.name); // Return names only
}

// Normalize scaling names for consistency
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

// Display the current weapon
function displayWeapon() {
  if (currentWeaponIndex >= weapons.length) {
    showResults(); // End the game when all weapons are used
    return;
  }

  const weapon = weapons[currentWeaponIndex];

  // Log scaling data to the console
  console.log(`Scaling data for ${weapon.name}:`, weapon.scalesWith);

  // Update the DOM elements with weapon details
  document.getElementById("weapon-name").innerText = weapon.name;
  document.getElementById("weapon-description").innerText = weapon.description;
  document.getElementById("weapon-image").src = weapon.image;
  document.getElementById("weapon-image").alt = weapon.name;

  // Clear feedback for the new weapon
  document.getElementById("feedback").innerText = "";

  // Prevent answering immediately
  canAnswer = false;

  // Clear any existing timeout to avoid issues
  if (timeoutId) clearTimeout(timeoutId);

  // Enable answering after a delay
  timeoutId = setTimeout(() => {
    canAnswer = true;
  }, 1000); // 1.5-second delay
}

// Handle user's guess
function makeGuess(choice) {
  if (!canAnswer) {
    document.getElementById("feedback").innerText = "Wait for the next weapon!";
    return; // Prevent spamming
  }

  const weapon = weapons[currentWeaponIndex];
  const correctScaling = weapon.scalesWith.map((s) => s.toLowerCase());
  const normalizedChoice = choice.toLowerCase();

  // Log user's choice and correct answers
  console.log(`User's choice: ${choice}`);
  console.log(`Correct answers: ${correctScaling.join(", ")}`);

  // Check if the choice is correct
  if (correctScaling.includes(normalizedChoice)) {
    correctGuesses.push(weapon.name);
    document.getElementById("feedback").innerText = "Correct!";
  } else {
    wrongGuesses.push(weapon.name);
    document.getElementById("feedback").innerText = "Wrong!";
  }

  // Move to the next weapon after a short delay
  canAnswer = false;
  setTimeout(() => {
    currentWeaponIndex++;
    displayWeapon();
  }, 700);
}

// Display the final results
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

  document.getElementById("results").innerHTML = resultsHTML;

  // Hide the game container
  document.getElementById("game-container").style.display = "none";

  // Attach event listener to retry button
  document.getElementById("retry-button").addEventListener("click", retakeQuiz);
}

// Retake the quiz
function retakeQuiz() {
  // Reset variables
  currentWeaponIndex = 0;
  correctGuesses = [];
  wrongGuesses = [];

  // Clear results and show the game container again
  document.getElementById("results").innerHTML = "";
  document.getElementById("game-container").style.display = "block";

  fetchWeapons(); // Reload weapons for a fresh game
}

// Attach event listeners to buttons
document.querySelectorAll(".guess-button").forEach((button) => {
  button.addEventListener("click", () => {
    makeGuess(button.innerText); // Pass button text (e.g., "Strength") as the guess
  });
});

// Start the game
fetchWeapons();
