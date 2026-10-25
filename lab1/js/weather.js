// js/weather.js
/**
 * Moduł danych meteorologicznych (IMGW REST API).
 * 
 * Endpoint API: https://danepubliczne.imgw.pl/api/data/synop/station/{stacja}
 * Domyślna stacja: 'krakow' (lub np. 'warszawa', 'wroclaw', 'gdansk')
 * 
 * Kluczowe pola w zwracanym obiekcie JSON:
 * - data.stacja              (np. "Kraków")
 * - data.temperatura         (np. "12.4")
 * - data.cisnienie           (np. "1024.2")
 * - data.predkosc_wiatru     (np. "3")
 * - data.wilgotnosc_wzgledna (np. "78.5")
 * 
 * Odpowiedzialność:
 * - Asynchroniczne pobranie danych dla wybranej stacji (fetch, async/await, weryfikacja response.ok)
 * - Obsługa stanu ładowania (loading state) oraz prezentacja błędów sieciowych w UI (bez blokującego alert())
 * - Bezpieczne wyrenderowanie danych pogodowych w dedykowanym kafelku DOM (Zero-XSS)
 */

export async function initWeather(city = "krakow") {
  // TODO: Zaimplementuj asynchroniczne pobieranie danych z IMGW (fetch, await) i render
}
