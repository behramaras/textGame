const inputEl = document.getElementById("input");
const outputEl = document.getElementById("output");
const themeToggleEl = document.getElementById("theme-toggle");
const weatherTextEl = document.getElementById("weather-text");

const SUN_ICON =
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
const MOON_ICON =
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>';

let playerName = null;
let awaitingName = true;
let gameEnded = false;
let currentRoom = "start";

const commandHistory = [];
let historyIndex = -1;

const rooms = {
  start: {
    description: "You are in a dark room. There is a door to the north.",
    exits: { north: "hallway" },
  },
  hallway: {
    description:
      "You are in a long hallway. There is a door to the south and another one to the east, and a terrifying pantry to the west..",
    exits: { south: "start", east: "treasureRoom", west: "kitchen" },
  },
  treasureRoom: {
    description:
      "You've found the treasure room! There's a massive chest in the center. Congratulations!, You're rich mate!",
    exits: { west: "hallway" },
  },
  kitchen: {
    description:
      "You've entered a dusty kitchen. The air is stale. You see a rusty knife on a wooden block. The only way out is back to the east. Hey there's something shaking and squealing....do you dare to look down?",
    exits: { east: "hallway", down: "butchersBasement" },
  },
  butchersBasement: {
    description:
      "You walk down the creaking stairs into a cold, damp basement. A single bulb reveals hooks hanging from the ceiling. The door slams shut behind you. You are trapped. <span class='game-over'>GAME OVER.</span>",
    exits: {},
  },
};

function scrollToBottom() {
  const terminal = document.getElementById("terminal");
  const output = document.getElementById("output");
  terminal.scrollTop = terminal.scrollHeight;
  output.scrollTop = output.scrollHeight;
  requestAnimationFrame(() => {
    terminal.scrollTop = terminal.scrollHeight;
  });
}

/**
 * Appends formatted lines to the terminal output area.
 * @param {string} text - The text content to display.
 * @param {Function} [callback] - Optional callback after typing completes.
 */
function appendOutput(text, callback) {
  const container = document.createElement("div");
  const prompt = document.createElement("span");
  prompt.className = "prompt";
  prompt.textContent = "$>";
  const content = document.createElement("span");
  container.appendChild(prompt);
  container.appendChild(document.createTextNode(" "));
  container.appendChild(content);
  outputEl.appendChild(container);

  let i = 0;
  const chars = [];
  const temp = document.createElement("div");
  temp.innerHTML = text;
  const fullText = temp.innerHTML;

  function typeNext() {
    if (i < fullText.length) {
      content.innerHTML = fullText.substring(0, i + 1);
      i++;
      scrollToBottom();
      setTimeout(typeNext, 18);
    } else {
      scrollToBottom();
      if (callback) callback();
    }
  }
  typeNext();
}

/**
 * Completes name entry and displays welcome messages.
 * @param {string} name - The player's chosen name.
 */
function setPlayerName(name) {
  playerName = name.charAt(0).toUpperCase() + name.slice(1);
  awaitingName = false;
  appendOutput(
    `Welcome to Behram's Interactive Fiction, <span class="highlight">${playerName}</span>! The commands are: <span class="cmd">look up</span>, <span class="cmd">look down</span>, <span class="cmd">north</span>, <span class="cmd">south</span>, <span class="cmd">east</span>, <span class="cmd">west</span>, and <span class="cmd">help</span>. If you forget the commands, just type <span class="cmd">help</span>!`,
    () => {
      appendOutput(
        `So hero: <span class="highlight">${playerName}</span>! Can you find the treasure before you get chopped up by the zombie butcher?`,
        () => {
          appendOutput("Quick tip...always look up first!");
        }
      );
    }
  );
}

/**
 * Prints the initial copyright screen and name prompt.
 */
function printWelcomeScreen() {
  outputEl.innerHTML = `
    <div class="welcome-header">
      <hr class="welcome-divider">
      <p class="welcome-title">BEHRAM'S INTERACTIVE FICTION ENGINE v1.0</p>
      <p class="welcome-subtitle">Copyright &copy; 2026 Behram Interactive</p>
      <hr class="welcome-divider">
    </div>
    <hr class="output-divider">`;
  appendOutput("What is your name?");
}

/**
 * Resets the game state and redraws the welcome screen.
 */
function restartGame() {
  currentRoom = "start";
  playerName = null;
  awaitingName = true;
  gameEnded = false;
  inputEl.disabled = false;
  outputEl.innerHTML = "";
  printWelcomeScreen();
  scrollToBottom();
}

/**
 * Applies win or lose end-game messaging after entering a terminal room.
 * @param {string} previousRoom - The room the player was in before moving.
 */
function applyEndGameState(previousRoom) {
  if (currentRoom === previousRoom) {
    return;
  }

  if (currentRoom === "treasureRoom") {
    gameEnded = true;
    appendOutput(
      "<span class='game-over'>VICTORY!</span> You found the treasure and escaped rich!",
      () => {
        appendOutput("Type '<span class='game-over'>restart</span>' to play again.");
      }
    );
  } else if (currentRoom === "butchersBasement") {
    gameEnded = true;
    appendOutput("Type '<span class='game-over'>restart</span>' to play again.");
  }
}

/**
 * Processes a user command and updates the game state.
 * @param {string} command - The raw command string from input.
 */
function handleCommand(command) {
  const lowerCommand = command.toLowerCase().trim();

  if (lowerCommand === "restart") {
    outputEl.innerHTML += `<div><span class="prompt">$></span> <span>${command}</span></div>`;
    scrollToBottom();
    setTimeout(scrollToBottom, 10);
    restartGame();
    return;
  }

  if (gameEnded) {
    outputEl.innerHTML += `<div><span class="prompt">$></span> <span>${command}</span></div>`;
    appendOutput("Type '<span class='game-over'>restart</span>' to play again.");
    scrollToBottom();
    setTimeout(scrollToBottom, 10);
    return;
  }

  let output = "";
  const previousRoom = currentRoom;

  switch (lowerCommand) {
    case "look up":
      output = rooms[currentRoom].description;
      break;

    case "north":
      if (rooms[currentRoom].exits.north) {
        currentRoom = rooms[currentRoom].exits.north;
        output = rooms[currentRoom].description;
      } else {
        output = "You can't go that way.";
      }
      break;

    case "south":
      if (rooms[currentRoom].exits.south) {
        currentRoom = rooms[currentRoom].exits.south;
        output = rooms[currentRoom].description;
      } else {
        output = "You can't go that way.";
      }
      break;

    case "east":
      if (rooms[currentRoom].exits.east) {
        currentRoom = rooms[currentRoom].exits.east;
        output = rooms[currentRoom].description;
      } else {
        output = "You can't go that way.";
      }
      break;

    case "west":
      if (rooms[currentRoom].exits.west) {
        currentRoom = rooms[currentRoom].exits.west;
        output = rooms[currentRoom].description;
      } else {
        output = "You can't go that way.";
      }
      break;

    case "look down":
      if (rooms[currentRoom].exits.down) {
        currentRoom = rooms[currentRoom].exits.down;
        output = rooms[currentRoom].description;
      } else {
        output = "You can't go anywhere down from here.";
      }
      break;

    case "help":
      output = `Available commands: <span class="cmd">look up</span>, <span class="cmd">look down</span>, <span class="cmd">north</span>, <span class="cmd">south</span>, <span class="cmd">east</span>, <span class="cmd">west</span>, <span class="cmd">help</span>, <span class="cmd">restart</span>`;
      break;

    default:
      output = `Unknown command: "<span class="highlight">${command}</span>". Try one of these: <span class="cmd">look up</span>, <span class="cmd">look down</span>, <span class="cmd">north</span>, <span class="cmd">south</span>, <span class="cmd">east</span>, <span class="cmd">west</span>`;
      break;
  }

  const userInputDiv = document.createElement("div");
  userInputDiv.innerHTML = `<span class="prompt">$></span> <span>${command}</span>`;
  outputEl.appendChild(userInputDiv);
  scrollToBottom();
  appendOutput(output, () => applyEndGameState(previousRoom));
}

/**
 * Handles keyboard input from the command line.
 * @param {KeyboardEvent} event - The keydown event from the input element.
 */
function handleInputKeydown(event) {
  if (event.key === "ArrowUp") {
    event.preventDefault();
    if (commandHistory.length > 0 && historyIndex < commandHistory.length - 1) {
      historyIndex++;
      inputEl.value = commandHistory[historyIndex];
    }
    return;
  }

  if (event.key === "ArrowDown") {
    event.preventDefault();
    if (historyIndex > 0) {
      historyIndex--;
      inputEl.value = commandHistory[historyIndex];
    } else {
      historyIndex = -1;
      inputEl.value = "";
    }
    return;
  }

  if (event.key !== "Enter") {
    return;
  }

  const command = inputEl.value;

  if (!command.trim()) {
    appendOutput("Please enter a command.");
    inputEl.value = "";
    return;
  }

  if (command.trim()) {
    commandHistory.unshift(command.trim());
    historyIndex = -1;
  }

  if (awaitingName) {
    outputEl.innerHTML += `<div><span class="prompt">$></span> <span>${command}</span></div>`;
    scrollToBottom();
    setPlayerName(command.trim());
    inputEl.value = "";
    return;
  }

  handleCommand(command);
  inputEl.value = "";
  scrollToBottom();
}

/**
 * Applies the saved theme preference or defaults to dark mode.
 */
function applyTheme() {
  const savedTheme = localStorage.getItem("textgame-theme");
  if (savedTheme === "light") {
    document.documentElement.classList.add("light-mode");
    themeToggleEl.innerHTML = MOON_ICON;
  } else {
    themeToggleEl.innerHTML = SUN_ICON;
  }
}

/**
 * Toggles between dark and light themes and persists the choice.
 */
function toggleTheme() {
  const isLight = document.documentElement.classList.toggle("light-mode");
  localStorage.setItem("textgame-theme", isLight ? "light" : "dark");
  themeToggleEl.innerHTML = isLight ? MOON_ICON : SUN_ICON;
}

/**
 * Maps an Open-Meteo WMO weather code to a readable condition string.
 * @param {number} code - The WMO weather interpretation code.
 * @returns {string} A human-readable weather condition.
 */
function weatherCodeToCondition(code) {
  if (code === 0) return "Clear";
  if (code <= 3) return "Cloudy";
  if (code <= 48) return "Foggy";
  if (code <= 67) return "Rainy";
  if (code <= 77) return "Snowy";
  if (code <= 82) return "Showers";
  if (code <= 99) return "Stormy";
  return "Unknown";
}

/**
 * Updates the weather widget with city, temperature, and condition text.
 * @param {string} city - The city name for the current location.
 * @param {number} temp - Temperature in degrees Celsius.
 * @param {string} condition - The weather condition description.
 */
function updateWeatherWidget(city, temp, condition) {
  weatherTextEl.textContent = `${city} · ${Math.round(temp)}°C · ${condition}`;
}

/** Default fallback coordinates for London when geolocation is unavailable. */
const LONDON_LAT = 51.5;
const LONDON_LON = -0.12;

/**
 * Fetches the city name for coordinates using Nominatim reverse geocoding.
 * @param {number} latitude - Latitude in decimal degrees.
 * @param {number} longitude - Longitude in decimal degrees.
 * @returns {Promise<string>} The resolved city name, or "Unknown" on failure.
 */
function fetchCityName(latitude, longitude) {
  const url =
    `https://nominatim.openstreetmap.org/reverse?lat=${latitude}` +
    `&lon=${longitude}&format=json`;

  return fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `Nominatim request failed: HTTP ${response.status} ${response.statusText} (${url})`
        );
      }
      return response.json();
    })
    .then((data) => {
      const address = data.address || {};
      return (
        address.city ||
        address.town ||
        address.village ||
        address.municipality ||
        address.county ||
        "Unknown"
      );
    })
    .catch((error) => {
      console.error(
        "[Weather Widget] Nominatim reverse geocoding failed:",
        error.message
      );
      return "Unknown";
    });
}

/**
 * Fetches current weather from Open-Meteo for the given coordinates.
 * @param {number} latitude - Latitude in decimal degrees.
 * @param {number} longitude - Longitude in decimal degrees.
 * @param {string} [sourceLabel] - Optional label for console logging (e.g. "London fallback").
 */
function fetchWeather(latitude, longitude, sourceLabel) {
  weatherTextEl.textContent = "Loading weather...";

  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}` +
    `&longitude=${longitude}&current=temperature_2m,weather_code`;

  Promise.all([
    fetch(url).then((response) => {
      if (!response.ok) {
        throw new Error(
          `Open-Meteo request failed: HTTP ${response.status} ${response.statusText} (${url})`
        );
      }
      return response.json();
    }),
    fetchCityName(latitude, longitude),
  ])
    .then(([data, cityName]) => {
      if (
        !data.current ||
        data.current.temperature_2m == null ||
        data.current.weather_code == null
      ) {
        throw new Error(
          `Open-Meteo response missing current weather data: ${JSON.stringify(data)}`
        );
      }

      const temp = data.current.temperature_2m;
      const condition = weatherCodeToCondition(data.current.weather_code);
      updateWeatherWidget(cityName, temp, condition);

      if (sourceLabel) {
        console.info(`[Weather Widget] Loaded weather using ${sourceLabel}.`);
      }
    })
    .catch((error) => {
      console.error("[Weather Widget] Open-Meteo fetch failed:", error.message);
      weatherTextEl.textContent = "Weather unavailable";
    });
}

/**
 * Falls back to London weather when geolocation is denied or unavailable.
 * @param {GeolocationPositionError|string} error - The geolocation error or reason string.
 */
function fallbackToLondonWeather(error) {
  const reason =
    typeof error === "string"
      ? error
      : `code ${error.code}: ${error.message}`;

  console.error(
    `[Weather Widget] Geolocation failed (${reason}). Falling back to London (${LONDON_LAT}, ${LONDON_LON}).`
  );
  fetchWeather(LONDON_LAT, LONDON_LON, "London fallback");
}

/**
 * Fetches current weather from Open-Meteo using browser geolocation.
 */
function initWeather() {
  weatherTextEl.textContent = "Loading weather...";

  if (!navigator.geolocation) {
    fallbackToLondonWeather("Geolocation API not supported in this browser");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      fetchWeather(latitude, longitude);
    },
    (error) => {
      fallbackToLondonWeather(error);
    },
    { timeout: 10000, maximumAge: 300000 }
  );
}

/**
 * Initializes the game display and event listeners.
 */
function initGame() {
  printWelcomeScreen();

  inputEl.addEventListener("keydown", handleInputKeydown);
  themeToggleEl.addEventListener("click", toggleTheme);

  applyTheme();
  initWeather();
}

initGame();