import { linksApi } from "./api.js";
import { onLoginSuccess, onLogoutSuccess } from "./auth.js";
 
const MIN_NAME_LENGTH = 3;
const MAX_NAME_LENGTH = 100; // zgodnie z max_length w schemacie LinkCreate
 
/**
 * Weryfikuje i normalizuje adres URL (biała lista protokołów http/https).
 * Używana przy walidacji formularza oraz ponownie przy renderowaniu danych z serwera
 * (obrona w głąb: nie ufamy ślepo nawet własnemu API).
 * @param {string} urlString
 * @returns {string|null}
 */
function sanitizeUrl(urlString) {
  const trimmed = String(urlString ?? "").trim();
  if (!trimmed) return null;
 
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.href;
    }
    return null;
  } catch {
    return null;
  }
}
 
/* ---------- Rendering (Zero-XSS: no innerHTML) ---------- */
 
function createLinkItem(link) {
  const item = document.createElement("li");
  item.dataset.id = String(link.id);
 
  const anchor = document.createElement("a");
  anchor.href = link.url;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  anchor.textContent = link.title;
 
  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "link-delete";
  deleteButton.textContent = "Delete";
  deleteButton.setAttribute("aria-label", `Delete ${link.title}`);
 
  item.append(anchor, deleteButton);
  return item;
}
 
function renderLinks(list, emptyMessage, links) {
  const safeLinks = links
    .map((link) => ({ ...link, url: sanitizeUrl(link.url) }))
    .filter((link) => link.url !== null);
 
  list.replaceChildren(...safeLinks.map(createLinkItem));
  emptyMessage.hidden = safeLinks.length > 0;
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
 
  if (links.some((link) => sanitizeUrl(link.url) === url)) {
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
 
/* ---------- Status message (API errors, loading) ---------- */
 
/**
 * Komunikat o stanie komunikacji z API. Tworzony dynamicznie,
 * więc nie wymaga zmian w index.html.
 */
function ensureStatusElement(panel, form) {
  let status = panel.querySelector("#links-status");
  if (!status) {
    status = document.createElement("p");
    status.id = "links-status";
    status.className = "field-error";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    status.hidden = true;
    panel.insertBefore(status, form);
  }
  return status;
}
 
function showStatus(statusEl, message) {
  statusEl.textContent = message;
  statusEl.hidden = false;
}
 
function clearStatus(statusEl) {
  statusEl.textContent = "";
  statusEl.hidden = true;
}
 
function errorMessage(err, fallback) {
  return err instanceof Error && err.message ? err.message : fallback;
}
 
/* ---------- Init ---------- */
 
export function initLinks() {
  const panel = document.querySelector("#links");
  const form = document.querySelector("#link-form");
  const list = document.querySelector("#links-list");
  const emptyMessage = document.querySelector("#links-empty");
  const nameInput = document.querySelector("#link-name");
  const urlInput = document.querySelector("#link-url");
  const nameError = document.querySelector("#link-name-error");
  const urlError = document.querySelector("#link-url-error");
 
  if (!panel || !form || !list || !emptyMessage || !nameInput || !urlInput || !nameError || !urlError) {
    return;
  }
 
  const submitButton = form.querySelector('button[type="submit"]');
  const statusEl = ensureStatusElement(panel, form);
 
  // Stan modułu: wyłącznie dane z serwera bieżącej sesji
  let links = [];
 
  // Licznik sesji: chroni przed sytuacją, w której odpowiedź z serwera dociera
  // już po wylogowaniu i prywatne dane trafiłyby z powrotem do DOM
  let session = 0;
 
  // Stan początkowy: panel ukryty, lista pusta (także gdy w HTML zostały statyczne linki)
  panel.classList.add("hidden");
  list.replaceChildren();
  emptyMessage.hidden = true;
 
  /* ----- Reakcja na zmianę tożsamości (auth.js) ----- */
 
  onLoginSuccess(async () => {
    const current = ++session;
 
    panel.classList.remove("hidden");
    clearStatus(statusEl);
    showStatus(statusEl, "Loading your links…");
 
    try {
      const data = await linksApi.getAll();
      if (current !== session) return; // użytkownik zdążył się wylogować
 
      links = Array.isArray(data) ? data : [];
      clearStatus(statusEl);
      renderLinks(list, emptyMessage, links);
    } catch (err) {
      if (current !== session) return;
      links = [];
      renderLinks(list, emptyMessage, links);
      emptyMessage.hidden = true;
      showStatus(statusEl, errorMessage(err, "Couldn't load your links from the server."));
    }
  });
 
  onLogoutSuccess(() => {
    session++;
    links = [];
 
    // Fizyczne usunięcie prywatnych danych z drzewa DOM
    list.replaceChildren();
    emptyMessage.hidden = true;
    form.reset();
    clearError(nameInput, nameError);
    clearError(urlInput, urlError);
    clearStatus(statusEl);
 
    panel.classList.add("hidden");
  });
 
  /* ----- Formularz dodawania ----- */
 
  // Remove the error as soon as the user starts fixing the field
  nameInput.addEventListener("input", () => clearError(nameInput, nameError));
  urlInput.addEventListener("input", () => clearError(urlInput, urlError));
 
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearStatus(statusEl);
 
    const title = nameInput.value.trim();
    const nameMessage = validateName(title);
    const { error: urlMessage, url } = validateUrl(urlInput.value, links);
 
    if (nameMessage) showError(nameInput, nameError, nameMessage);
    else clearError(nameInput, nameError);
 
    if (urlMessage) showError(urlInput, urlError, urlMessage);
    else clearError(urlInput, urlError);
 
    if (nameMessage || urlMessage) {
      (nameMessage ? nameInput : urlInput).focus();
      return;
    }
 
    const current = session;
    if (submitButton) submitButton.disabled = true;
 
    try {
      // owner_id NIE jest wysyłany – serwer bierze go z tokena sesji
      const created = await linksApi.create({ title, url });
      if (current !== session) return;
 
      links = [...links, created];
      renderLinks(list, emptyMessage, links);
 
      form.reset();
      clearError(nameInput, nameError);
      clearError(urlInput, urlError);
      nameInput.focus();
    } catch (err) {
      if (current !== session) return;
      showStatus(statusEl, errorMessage(err, "Couldn't save the link. Try again."));
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
 
  /* ----- Usuwanie (Event Delegation) ----- */
 
  list.addEventListener("click", async (event) => {
    const button = event.target.closest(".link-delete");
    if (!button || !list.contains(button)) return;
 
    const id = Number(button.closest("li")?.dataset.id);
    if (!Number.isInteger(id)) return;
 
    const current = session;
    clearStatus(statusEl);
    button.disabled = true;
 
    try {
      await linksApi.delete(id);
      if (current !== session) return;
 
      links = links.filter((link) => link.id !== id);
      renderLinks(list, emptyMessage, links);
    } catch (err) {
      if (current !== session) return;
      button.disabled = false;
      showStatus(statusEl, errorMessage(err, "Couldn't delete the link. Try again."));
    }
  });
}
