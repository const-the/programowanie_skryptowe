// js/links.js
/**
 * Moduł dynamicznego rejestru odnośników w panelu bocznym (<aside id="links">).
 *
 * Odpowiedzialność:
 * - Obsługa formularza dodawania odnośnika (zdarzenie 'submit', preventDefault)
 * - Walidacja danych (minimalna długość nazwy, weryfikacja poprawności URL za pomocą sanitizeUrl)
 * - Dynamiczne renderowanie listy wpisów w DOM (Zero-XSS: createElement, textContent, append, rel="noopener noreferrer")
 * - Obsługa usuwania elementów za pomocą delegacji zdarzeń (Event Delegation z użyciem e.target.closest)
 * - Zapewnienie trwałości rejestru linków w localStorage (JSON.parse / JSON.stringify)
 */

/**
 * Pomocnicza funkcja weryfikująca i sanityzująca adres URL wprowadzony przez użytkownika:
 * - Wymaga podania pełnego adresu z bezpiecznym protokołem (http: lub https:)
 * - Odrzuca adresy niepoprawne składniowo oraz niebezpieczne pseudoprotokoły (javascript:, data:)
 * - Zwraca znormalizowany, bezpieczny ciąg URL (href) lub null w przypadku nieprawidłowego adresu
 * @param {string} urlString
 * @returns {string|null}
 */
function sanitizeUrl(urlString) {
  // .trim() usuwa białe znaki (spacje, tabulatory, nowe linie) z początku i końca tekstu
  const trimmed = urlString.trim();
  if (!trimmed) return null;

  try {
    // Krok 1 (Weryfikacja składni): Natywny parser new URL() wymaga absolutnego adresu ze schematem.
    // Jeśli ciąg nie posiada protokołu (np. "onet.pl") lub zawiera błędy składniowe,
    // konstruktor rzuca wyjątek TypeError: Invalid URL, który bezpiecznie przechwytujemy w bloku catch.
    const parsed = new URL(trimmed);

    // Krok 2 (Biała lista protokołów / AppSec): Parser new URL() akceptuje każdy poprawny schemat URI,
    // w tym niebezpieczne dla bezpieczeństwa DOM wektory XSS (np. "javascript:alert(1)", "data:text/html,...").
    // Dlatego bezwzględnie weryfikujemy białą listę: dopuszczamy wyłącznie protokoły "http:" oraz "https:".
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.href;
    }

    return null;
  } catch {
    // Przechwycenie błędu składniowego rzuconego przez new URL()
    return null;
  }
}

/* ---------- Storage ---------- */

const STORAGE_KEY = "links-registry";
const MIN_NAME_LENGTH = 3;
const MAX_NAME_LENGTH = 60;

function createId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function isValidEntry(entry) {
  return (
    entry !== null &&
    typeof entry === "object" &&
    typeof entry.id === "string" &&
    typeof entry.name === "string" &&
    typeof entry.url === "string"
  );
}

/**
 * Returns the saved list, or null when nothing usable is saved yet.
 * localStorage can be edited by hand in DevTools, so every stored URL
 * goes through sanitizeUrl() again before it reaches the page.
 */
function loadLinks() {
  let raw;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
  if (raw === null) return null;

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;

    return parsed
      .filter(isValidEntry)
      .map((entry) => ({ ...entry, url: sanitizeUrl(entry.url) }))
      .filter((entry) => entry.url !== null);
  } catch {
    // Corrupted JSON: fall back to the default links
    return null;
  }
}

function saveLinks(links) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
  } catch {
    // Storage blocked: the list works for this visit but won't be remembered
  }
}

// On the first visit, the links written in index.html become the starting list
function readLinksFromHtml(list) {
  return Array.from(list.querySelectorAll("a"))
    .map((anchor) => ({
      id: createId(),
      name: anchor.textContent.trim(),
      url: sanitizeUrl(anchor.getAttribute("href") ?? ""),
    }))
    .filter((entry) => entry.name && entry.url !== null);
}

/* ---------- Rendering (Zero-XSS: no innerHTML) ---------- */

function createLinkItem(link) {
  const item = document.createElement("li");
  item.dataset.id = link.id;

  const anchor = document.createElement("a");
  anchor.href = link.url;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  anchor.textContent = link.name;

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "link-delete";
  deleteButton.textContent = "Delete";
  deleteButton.setAttribute("aria-label", `Delete ${link.name}`);

  item.append(anchor, deleteButton);
  return item;
}

function renderLinks(list, emptyMessage, links) {
  list.replaceChildren(...links.map(createLinkItem));
  emptyMessage.hidden = links.length > 0;
}

/* ---------- Validation ---------- */

function validateName(name) {
  // Spaces don't count toward the minimum length
  if (name.replace(/\s/g, "").length < MIN_NAME_LENGTH) {
    return `Name must have at least ${MIN_NAME_LENGTH} characters (spaces don't count).`;
  }
  if (name.length > MAX_NAME_LENGTH) {
    return `Name can have at most ${MAX_NAME_LENGTH} characters.`;
  }
  return null;
}

function validateUrl(value, links) {
  if (!value.trim()) {
    return { error: "Enter a URL.", url: null };
  }

  const url = sanitizeUrl(value);
  if (url === null) {
    return {
      error: "Enter a full web address starting with http:// or https://.",
      url: null,
    };
  }

  if (links.some((link) => link.url === url)) {
    return { error: "This link is already on the list.", url: null };
  }

  return { error: null, url };
}

function showError(input, errorEl, message) {
  input.setAttribute("aria-invalid", "true");
  errorEl.textContent = message;
  errorEl.hidden = false;
}

function clearError(input, errorEl) {
  input.removeAttribute("aria-invalid");
  errorEl.textContent = "";
  errorEl.hidden = true;
}

/* ---------- Init ---------- */

export function initLinks() {
  const form = document.querySelector("#link-form");
  const list = document.querySelector("#links-list");
  const emptyMessage = document.querySelector("#links-empty");
  const nameInput = document.querySelector("#link-name");
  const urlInput = document.querySelector("#link-url");
  const nameError = document.querySelector("#link-name-error");
  const urlError = document.querySelector("#link-url-error");

  if (!form || !list || !emptyMessage || !nameInput || !urlInput || !nameError || !urlError) {
    return;
  }

  let links = loadLinks() ?? readLinksFromHtml(list);
  renderLinks(list, emptyMessage, links);

  // Remove the error as soon as the user starts fixing the field
  nameInput.addEventListener("input", () => clearError(nameInput, nameError));
  urlInput.addEventListener("input", () => clearError(urlInput, urlError));

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = nameInput.value.trim();
    const nameMessage = validateName(name);
    const { error: urlMessage, url } = validateUrl(urlInput.value, links);

    if (nameMessage) showError(nameInput, nameError, nameMessage);
    else clearError(nameInput, nameError);

    if (urlMessage) showError(urlInput, urlError, urlMessage);
    else clearError(urlInput, urlError);

    if (nameMessage || urlMessage) {
      (nameMessage ? nameInput : urlInput).focus();
      return;
    }

    links = [...links, { id: createId(), name, url }];
    saveLinks(links);
    renderLinks(list, emptyMessage, links);

    form.reset();
    clearError(nameInput, nameError);
    clearError(urlInput, urlError);
    nameInput.focus();
  });

  // Event delegation: one listener on the list handles every Delete button,
  // including buttons created later
  list.addEventListener("click", (event) => {
    const button = event.target.closest(".link-delete");
    if (!button || !list.contains(button)) return;

    const id = button.closest("li")?.dataset.id;
    links = links.filter((link) => link.id !== id);
    saveLinks(links);
    renderLinks(list, emptyMessage, links);
  });
<<<<<<< HEAD
}
=======
}
>>>>>>> lab2-remake
