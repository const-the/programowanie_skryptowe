// js/calendar.js
/**
 * Calendar card module.
 *
 * Shows today's date in Polish inside #calendar-box, e.g.:
 *   Piątek
 *   23
 *   października 2026
 *
 * Intl.DateTimeFormat handles the grammar: when a day number is present,
 * Polish months use the genitive form ("października", not "październik").
 */

function capitalize(text) {
  return text.charAt(0).toLocaleUpperCase("pl-PL") + text.slice(1);
<<<<<<< HEAD
}

function createPart(className, text) {
  const span = document.createElement("span");
  span.className = className;
  span.textContent = text;
  return span;
}

export function initCalendar() {
  const slot = document.querySelector("#calendar-box .widget-body");
  if (!slot) return;

  const now = new Date();

  const parts = new Intl.DateTimeFormat("pl-PL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).formatToParts(now);

  const getPart = (type) => parts.find((part) => part.type === type)?.value ?? "";

  // <time> gives the date a machine-readable form (YYYY-MM-DD, local time)
  const card = document.createElement("time");
  card.className = "calendar-card";
  card.lang = "pl"; // the page is in English, this card is in Polish
  card.dateTime = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");

  card.append(
    createPart("calendar-weekday", capitalize(getPart("weekday"))),
    createPart("calendar-day", getPart("day")),
    createPart("calendar-month", `${getPart("month")} ${getPart("year")}`)
  );

  slot.replaceChildren(card);
=======
>>>>>>> lab2-remake
}

function createPart(className, text) {
  const span = document.createElement("span");
  span.className = className;
  span.textContent = text;
  return span;
}

export function initCalendar() {
  const slot = document.querySelector("#calendar-box .widget-body");
  if (!slot) return;

  const now = new Date();

  const parts = new Intl.DateTimeFormat("pl-PL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).formatToParts(now);

  const getPart = (type) => parts.find((part) => part.type === type)?.value ?? "";

  const card = document.createElement("time");
  card.className = "calendar-card";
  card.lang = "pl";
  card.dateTime = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");

  card.append(
    createPart("calendar-weekday", capitalize(getPart("weekday"))),
    createPart("calendar-day", getPart("day")),
    createPart("calendar-month", `${getPart("month")} ${getPart("year")}`)
  );

  slot.replaceChildren(card);
}