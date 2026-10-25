// js/weather.js
/**
 * Weather module (IMGW REST API).
 *
 * Endpoint: https://danepubliczne.imgw.pl/api/data/synop/station/{station}
 * Fields used: stacja, temperatura, cisnienie, predkosc_wiatru,
 *              wilgotnosc_wzgledna, data_pomiaru, godzina_pomiaru
 *
 * States shown in #weather-box: loading -> data, or loading -> error + retry button.
 */

const API_URL = "https://danepubliczne.imgw.pl/api/data/synop/station/";
const TIMEOUT_MS = 8000;

function createEl(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}

// IMGW sends numbers as strings and sometimes null (e.g. a station without a barometer)
function formatValue(value, unit) {
  if (value === null || value === undefined || value === "") return "no data";
  const number = Number(value);
  if (!Number.isFinite(number)) return "no data";
  return `${number.toLocaleString("en-US", { maximumFractionDigits: 1 })}${unit}`;
}

function renderLoading(slot) {
  slot.setAttribute("aria-busy", "true");
  slot.replaceChildren(createEl("p", "weather-loading", "Loading weather data…"));
}

function renderError(slot, city) {
  slot.setAttribute("aria-busy", "false");

  const message = createEl(
    "p",
    "weather-error",
    "Couldn't load weather data. Check your connection and try again."
  );

  const retry = createEl("button", "weather-retry", "Try again");
  retry.type = "button";
  retry.addEventListener("click", () => loadWeather(slot, city));

  slot.replaceChildren(message, retry);
}

function createDetail(label, value) {
  const row = document.createElement("div");
  row.append(createEl("dt", "", label), createEl("dd", "", value));
  return row;
}

function renderWeather(slot, data) {
  slot.setAttribute("aria-busy", "false");

  const station = createEl("h3", "weather-station", data.stacja);
  const temperature = createEl("p", "weather-temp", formatValue(data.temperatura, "°C"));

  const details = createEl("dl", "weather-details");
  details.append(
    createDetail("Pressure", formatValue(data.cisnienie, " hPa")),
    createDetail("Wind", formatValue(data.predkosc_wiatru, " m/s")),
    createDetail("Humidity", formatValue(data.wilgotnosc_wzgledna, "%"))
  );

  const footer = [];
  if (data.data_pomiaru && data.godzina_pomiaru) {
    footer.push(
      createEl(
        "p",
        "weather-meta",
        `Measured ${data.data_pomiaru}, ${String(data.godzina_pomiaru).padStart(2, "0")}:00`
      )
    );
  }
  footer.push(createEl("p", "weather-meta", "Source: IMGW-PIB"));

  slot.replaceChildren(station, temperature, details, ...footer);
}

async function loadWeather(slot, city) {
  renderLoading(slot);

  try {
    const response = await fetch(API_URL + encodeURIComponent(city), {
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    // response.json() parses JSON and throws on invalid data, so it stays inside try
    const data = await response.json();

    if (!data || typeof data !== "object" || typeof data.stacja !== "string") {
      throw new Error("Unexpected response format");
    }

    renderWeather(slot, data);
  } catch {
    // Network error, timeout, HTTP error or bad JSON: show a message in the page
    renderError(slot, city);
  }
}

export async function initWeather(city = "krakow") {
  const slot = document.querySelector("#weather-box .widget-body");
  if (!slot) return;

  await loadWeather(slot, city);
}
