// js/theme.js
/**
 * Theme module (Dark / Light mode).
 *
 * - The page starts dark (<body class="dark"> in index.html), so the default
 *   look appears immediately, before any JavaScript runs.
 * - A saved preference from localStorage is applied on load.
 * - The #theme-toggle button switches the "dark" class on <body> and saves the choice.
 */
"use strict"
const ITEM_NAME = "theme";
const CLASS_NAME = "light";

function get(){
  try{
    return localStorage.getItem(ITEM_NAME);
  }
  catch{
    return null;
  }
}

function set(text = ""){
  try{
    localStorage.setItem(ITEM_NAME,text);
  }
  catch{}
}

function change_theme() {
  const is_light = document.body.classList.toggle(CLASS_NAME);
  set(is_light? "light" : "dark");
  change_button();
  change_logo();
}

function change_button() {
  if(get() === "dark"){
    document.querySelector("#theme-toggle").textContent = "DARK";
  }
  else if(get() === "light"){
    document.querySelector("#theme-toggle").textContent = "LIGHT";
  }
}

function change_logo() {
  if(get() === "dark"){
    document.querySelector(".navbar-logo").src = "assets/logo_darkmode.svg"
    document.querySelector(".pfp").src = "assets/logo_darkmode.svg"
  }
  else if(get() === "light"){
    document.querySelector(".navbar-logo").src = "assets/logo.svg"
    document.querySelector(".pfp").src = "assets/logo.svg"
  }
}


<<<<<<< HEAD
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
=======
export function initTheme() {

  const theme_button = document.querySelector(".theme-toggle");
  
  if(get() === "dark"){
    document.body.classList.remove(CLASS_NAME);
    change_button();
  }

  theme_button.addEventListener("click",change_theme);
  // TODO: Zaimplementuj obsługę motywu i trwałość w localStorage
  
>>>>>>> lab2-remake
}
