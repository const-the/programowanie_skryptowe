// js/theme.js
/**
 * Moduł motywu (Dark / Light Mode).
 * 
 * Odpowiedzialność:
 * - Reakcja na kliknięcie kontrolki motywu w interfejsie
 * - Przełączanie klasy motywu (np. 'dark') na elemencie <body>
 * - Trwały zapis i odczyt preferencji użytkownika w localStorage
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


export function initTheme() {

  const theme_button = document.querySelector(".theme-toggle");
  
  if(get() === "dark"){
    document.body.classList.remove(CLASS_NAME);
    change_button();
  }

  theme_button.addEventListener("click",change_theme);
  // TODO: Zaimplementuj obsługę motywu i trwałość w localStorage
  
}
