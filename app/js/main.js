import "../css/style.css";

// Global variables
let weapons = [];
let currentWeaponIndex = 0;
let correctGuesses = [];
let wrongGuesses = [];

// Fetch weapons from the API and initialize the game
async function fetchWeapons() {
  try {
    const response = await fetch(
      "https://eldenring.fanapis.com/api/weapons?limit=250"
    );
    const data = await response.json();

    // Filter only valid weapons that have "scalesWith" data
    const validWeapons = data.data.filter(
      (weapon) => weapon.scalesWith && weapon.scalesWith.length > 0
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

// Utility function: Randomly pick N items from the array
function getRandomWeapons(data, n) {
  const shuffled = data.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n).map((weapon) => ({
    name: weapon.name || "Unknown Weapon",
    description: weapon.description || "No description available.",
    image: weapon.image || "https://via.placeholder.com/300",
    scalesWith: weapon.scalesWith.map((scaling) => scaling.name), // Extract only scaling names
  }));
}

// Display the current weapon
function displayWeapon() {
  if (currentWeaponIndex >= weapons.length) {
    showResults(); // End the game when all weapons have been presented
    return;
  }

  const weapon = weapons[currentWeaponIndex];

  // Update DOM elements with weapon details
  document.getElementById("weapon-name").innerText = weapon.name;
  document.getElementById("weapon-description").innerText = weapon.description;
  document.getElementById("weapon-image").src = weapon.image;
  document.getElementById("weapon-image").alt = weapon.name;

  // Clear previous feedback
  document.getElementById("feedback").innerText = "";
}

// Handle user's guess
function makeGuess(choice) {
  const weapon = weapons[currentWeaponIndex];
  const correctScaling = weapon.scalesWith;

  // Check user's guess
  if (correctScaling.includes(choice)) {
    correctGuesses.push(weapon.name);
    document.getElementById("feedback").innerText = "✅ Correct! Good job!";
  } else {
    wrongGuesses.push(weapon.name);
    document.getElementById(
      "feedback"
    ).innerText = `❌ Wrong! Correct answers: ${correctScaling.join(", ")}`;
  }

  // Proceed to the next weapon after 1 second
  setTimeout(() => {
    currentWeaponIndex++; // Increment the index
    displayWeapon(); // Display the next weapon
  }, 1000);
}

// Display the final results
function showResults() {
  const total = correctGuesses.length + wrongGuesses.length;
  const percentage = ((correctGuesses.length / total) * 100).toFixed(2);

  const resultsHTML = `
        <h2>Game Over!</h2>
        <p>Correct: ${correctGuesses.length} / ${total} (${percentage}%)</p>
        <p>Wrong: ${wrongGuesses.length}</p>
    `;

  document.getElementById("results").innerHTML = resultsHTML;

  // Hide the game container
  document.getElementById("game-container").style.display = "none";
}

// Attach event listeners to buttons
document.querySelectorAll(".guess-button").forEach((button) => {
  button.addEventListener("click", () => {
    makeGuess(button.innerText);
  });
});

// Start the game
fetchWeapons();
