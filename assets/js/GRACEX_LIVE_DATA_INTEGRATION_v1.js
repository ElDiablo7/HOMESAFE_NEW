/*!
 * GRACE-X Live Data Integration v1
 * Drop-in JS helper for: Football (X-Auth-Token) + Racing (HTTP Basic)
 *
 * ✅ No keys hard-coded. Uses localStorage for private/local testing.
 * ✅ LIVE / SIMULATED / OFFLINE modes with safe fallback (never crash).
 * ✅ Simple wrappers you can call from Sports module or Forge.
 *
 * How to use (once this file is loaded on the page):
 *   // Football
 *   GraceXLiveData.setMode("FOOTBALL", "LIVE");
 *   GraceXLiveData.setToken("FOOTBALL", "<your token>"); // token stored in localStorage
 *
 *   // Racing (The Racing API - Basic auth)
 *   GraceXLiveData.setMode("RACING", "LIVE");
 *   GraceXLiveData.setBasic("RACING", "<username>", "<password>"); // stored in localStorage
 *
 *   // Optional: set base URLs if your providers require it
 *   GraceXLiveData.setBaseUrl("FOOTBALL", "https://YOUR_FOOTBALL_API_BASE");
 *   GraceXLiveData.setBaseUrl("RACING",   "https://YOUR_RACING_API_BASE");
 *
 *   // Fetch examples:
 *   const fb = await GraceXLiveData.football.get("/v1/fixtures?date=2025-12-19");
 *   const rc = await GraceXLiveData.racing.get("/v1/racecards/free");
 *
 * SECURITY NOTE:
 * - localStorage is OK for your private builds.
 * - for real users, move secrets behind a server proxy (Phase 2).
 *
 * © Zac Crockett — GRACE-X AI™
 */

(function () {
  "use strict";

  // ---------------------------
  // Storage keys + helpers
  // ---------------------------
  const KEY_PREFIX = "GRACEX_"; // e.g. GRACEX_FOOTBALL_MODE

  function lsGet(k, fallback = "") {
    try { return localStorage.getItem(k) ?? fallback; } catch (_) { return fallback; }
  }
  function lsSet(k, v) {
    try { localStorage.setItem(k, String(v)); } catch (_) {}
  }

  function normMode(v) {
    const m = String(v || "SIMULATED").toUpperCase().trim();
    if (m === "LIVE" || m === "SIMULATED" || m === "OFFLINE") return m;
    return "SIMULATED";
  }

  function getMode(name) {
    return normMode(lsGet(`${KEY_PREFIX}${name}_MODE`, "SIMULATED"));
  }

  function setMode(name, mode) {
    lsSet(`${KEY_PREFIX}${name}_MODE`, normMode(mode));
  }

  function getBaseUrl(name) {
    // Keep your defaults safe; you can override per provider.
    const stored = lsGet(`${KEY_PREFIX}${name}_BASE_URL`, "").trim();
    if (stored) return stored.replace(/\/+$/, "");
    // If you don't set baseUrl, we still work with full URLs passed to .get()
    return "";
  }

  function setBaseUrl(name, baseUrl) {
    lsSet(`${KEY_PREFIX}${name}_BASE_URL`, String(baseUrl || "").trim());
  }

  // ---------------------------
  // Safe request wrapper
  // ---------------------------
  async function fetchJSON(url, opts = {}, timeoutMs = 12000) {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, { ...opts, signal: controller.signal });
      const text = await res.text();
      let json = null;
      try { json = text ? JSON.parse(text) : null; } catch (_) {}

      if (!res.ok) {
        return { ok: false, status: res.status, error: json || text || `HTTP ${res.status}` };
      }
      return { ok: true, status: res.status, data: json };
    } catch (err) {
      const msg = (err && err.name === "AbortError") ? `Timeout after ${timeoutMs}ms` : String(err?.message || err);
      return { ok: false, status: 0, error: msg };
    } finally {
      clearTimeout(t);
    }
  }

  // ---------------------------
  // Football client (X-Auth-Token)
  // ---------------------------
  function getToken(name) {
    return lsGet(`${KEY_PREFIX}${name}_API_KEY`, "").trim();
  }
  function setToken(name, token) {
    // Store token; do NOT hard-code into JS files.
    lsSet(`${KEY_PREFIX}${name}_API_KEY`, String(token || "").trim());
  }

  function makeFootballClient() {
    const NAME = "FOOTBALL";

    async function get(pathOrUrl, { timeoutMs = 12000, headers = {} } = {}) {
      const mode = getMode(NAME);
      if (mode === "OFFLINE") return { state: "OFFLINE", ok: true, data: null };
      if (mode === "SIMULATED") return { state: "SIMULATED", ok: true, data: mockFootball(pathOrUrl) };

      const token = getToken(NAME);
      if (!token) return { state: "SIMULATED", ok: true, data: mockFootball(pathOrUrl), note: "No token set" };

      const base = getBaseUrl(NAME);
      const url = (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://"))
        ? pathOrUrl
        : (base ? `${base}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}` : pathOrUrl);

      const r = await fetchJSON(url, {
        method: "GET",
        headers: {
          "X-Auth-Token": token,
          ...headers
        }
      }, timeoutMs);

      if (!r.ok) return { state: "SIMULATED", ok: false, data: mockFootball(pathOrUrl), note: r.error };
      return { state: "LIVE", ok: true, data: r.data };
    }

    return { get };
  }

  // ---------------------------
  // Racing client (HTTP Basic)
  // ---------------------------
  function getBasicUser(name) {
    return lsGet(`${KEY_PREFIX}${name}_USER`, "").trim();
  }
  function getBasicPass(name) {
    return lsGet(`${KEY_PREFIX}${name}_PASS`, "").trim();
  }
  function setBasic(name, user, pass) {
    lsSet(`${KEY_PREFIX}${name}_USER`, String(user || "").trim());
    lsSet(`${KEY_PREFIX}${name}_PASS`, String(pass || "").trim());
  }

  function b64Basic(user, pass) {
    // btoa is Latin1; this makes it safer for UTF-8 creds.
    const str = `${user}:${pass}`;
    const utf8 = new TextEncoder().encode(str);
    let bin = "";
    utf8.forEach((b) => bin += String.fromCharCode(b));
    return btoa(bin);
  }

  function makeRacingClient() {
    const NAME = "RACING";

    async function get(pathOrUrl, { timeoutMs = 12000, headers = {} } = {}) {
      const mode = getMode(NAME);
      if (mode === "OFFLINE") return { state: "OFFLINE", ok: true, data: null };
      if (mode === "SIMULATED") return { state: "SIMULATED", ok: true, data: mockRacing(pathOrUrl) };

      const user = getBasicUser(NAME);
      const pass = getBasicPass(NAME);
      if (!user || !pass) {
        return { state: "SIMULATED", ok: true, data: mockRacing(pathOrUrl), note: "No username/password set" };
      }

      const base = getBaseUrl(NAME);
      const url = (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://"))
        ? pathOrUrl
        : (base ? `${base}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}` : pathOrUrl);

      const auth = `Basic ${b64Basic(user, pass)}`;

      const r = await fetchJSON(url, {
        method: "GET",
        headers: {
          "Authorization": auth,
          ...headers
        }
      }, timeoutMs);

      if (!r.ok) return { state: "SIMULATED", ok: false, data: mockRacing(pathOrUrl), note: r.error };
      return { state: "LIVE", ok: true, data: r.data };
    }

    return { get };
  }

  // ---------------------------
  // SIMULATED (safe stubs)
  // Replace these later with cached JSON if you want.
  // ---------------------------
  function mockFootball(path) {
    return {
      simulated: true,
      source: "mockFootball",
      request: path,
      now: new Date().toISOString(),
      note: "Replace with cached fixtures/results when ready."
    };
  }

  function mockRacing(path) {
    return {
      simulated: true,
      source: "mockRacing",
      request: path,
      now: new Date().toISOString(),
      note: "Replace with cached racecards/results when ready."
    };
  }

  // ---------------------------
  // Public API
  // ---------------------------
  const api = {
    // Mode + base URLs
    getMode,
    setMode,
    getBaseUrl,
    setBaseUrl,

    // Secrets (localStorage)
    setToken: (name, token) => setToken(String(name || "").toUpperCase(), token),
    setBasic: (name, user, pass) => setBasic(String(name || "").toUpperCase(), user, pass),

    // Clients
    football: makeFootballClient(),
    racing: makeRacingClient(),

    // Health snapshot
    status: () => ({
      FOOTBALL: { mode: getMode("FOOTBALL"), baseUrl: getBaseUrl("FOOTBALL"), hasToken: !!getToken("FOOTBALL") },
      RACING: { mode: getMode("RACING"), baseUrl: getBaseUrl("RACING"), hasUser: !!getBasicUser("RACING"), hasPass: !!getBasicPass("RACING") }
    })
  };

  // Expose globally
  window.GraceXLiveData = api;
})();
