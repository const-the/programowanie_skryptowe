// js/theme.js
/**
 * Theme module (Dark / Light mode).
 *
 * - The page starts dark (<body class="dark"> in index.html), so the default
 *   look appears immediately, before any JavaScript runs.
 * - A saved preference from localStorage is applied on load.
 * - The #theme-toggle button switches the "dark" class on <body> and saves the choice.
 */

const STORAGE_KEY = "theme";
const DARK_CLASS = "dark";

function readSavedTheme() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    // Storage can be blocked (e.g. strict privacy settings)
    return null;
  }
}

function saveTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Storage blocked: the theme still works, it just won't be remembered
  }
}

function updateButton(button, isDark) {
  button.textContent = isDark ? "Dark" : "Light";
  button.setAttribute(
    "aria-label",
    isDark ? "Switch to light theme" : "Switch to dark theme"
  );
}

export function initTheme() {
  const saved = readSavedTheme();

  if (saved === "light") {
    document.body.classList.remove(DARK_CLASS);
  } else if (saved === "dark") {
    document.body.classList.add(DARK_CLASS);
  }

  const button = document.querySelector("#theme-toggle");
  if (!button) return;

  updateButton(button, document.body.classList.contains(DARK_CLASS));

  button.addEventListener("click", () => {
    // toggle() returns true when the class was added
    const isDark = document.body.classList.toggle(DARK_CLASS);
    saveTheme(isDark ? "dark" : "light");
    updateButton(button, isDark);
  });
}
