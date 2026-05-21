const LIFE_EXPECTANCY_YEARS = 78;

// ── embedded city → IANA timezone map ──────────────────────────
// Covers ~120 major cities. If user's city isn't here, falls back
// to browser-local timezone. Add more here if needed.
const CITIES = [
  // India
  ["Mumbai, India", "Asia/Kolkata"], ["New Delhi, India", "Asia/Kolkata"],
  ["Bangalore, India", "Asia/Kolkata"], ["Hyderabad, India", "Asia/Kolkata"],
  ["Chennai, India", "Asia/Kolkata"], ["Kolkata, India", "Asia/Kolkata"],
  ["Pune, India", "Asia/Kolkata"], ["Ahmedabad, India", "Asia/Kolkata"],
  ["Jaipur, India", "Asia/Kolkata"], ["Lucknow, India", "Asia/Kolkata"],
  ["Kanpur, India", "Asia/Kolkata"], ["Nagpur, India", "Asia/Kolkata"],
  ["Surat, India", "Asia/Kolkata"], ["Indore, India", "Asia/Kolkata"],
  ["Bhopal, India", "Asia/Kolkata"], ["Coimbatore, India", "Asia/Kolkata"],
  ["Chandigarh, India", "Asia/Kolkata"], ["Kochi, India", "Asia/Kolkata"],
  ["Goa, India", "Asia/Kolkata"], ["Mangalore, India", "Asia/Kolkata"],
  ["Mysore, India", "Asia/Kolkata"], ["Visakhapatnam, India", "Asia/Kolkata"],
  ["Vadodara, India", "Asia/Kolkata"], ["Thiruvananthapuram, India", "Asia/Kolkata"],
  // UAE / Gulf
  ["Dubai, UAE", "Asia/Dubai"], ["Abu Dhabi, UAE", "Asia/Dubai"],
  ["Sharjah, UAE", "Asia/Dubai"], ["Ajman, UAE", "Asia/Dubai"],
  ["Doha, Qatar", "Asia/Qatar"], ["Riyadh, Saudi Arabia", "Asia/Riyadh"],
  ["Jeddah, Saudi Arabia", "Asia/Riyadh"], ["Mecca, Saudi Arabia", "Asia/Riyadh"],
  ["Kuwait City, Kuwait", "Asia/Kuwait"], ["Manama, Bahrain", "Asia/Bahrain"],
  ["Muscat, Oman", "Asia/Muscat"],
  // Pakistan / SL / BD / Nepal
  ["Karachi, Pakistan", "Asia/Karachi"], ["Lahore, Pakistan", "Asia/Karachi"],
  ["Islamabad, Pakistan", "Asia/Karachi"], ["Dhaka, Bangladesh", "Asia/Dhaka"],
  ["Chittagong, Bangladesh", "Asia/Dhaka"], ["Colombo, Sri Lanka", "Asia/Colombo"],
  ["Kathmandu, Nepal", "Asia/Kathmandu"],
  // Asia broader
  ["Tokyo, Japan", "Asia/Tokyo"], ["Osaka, Japan", "Asia/Tokyo"],
  ["Seoul, South Korea", "Asia/Seoul"], ["Beijing, China", "Asia/Shanghai"],
  ["Shanghai, China", "Asia/Shanghai"], ["Hong Kong", "Asia/Hong_Kong"],
  ["Singapore", "Asia/Singapore"], ["Bangkok, Thailand", "Asia/Bangkok"],
  ["Kuala Lumpur, Malaysia", "Asia/Kuala_Lumpur"], ["Jakarta, Indonesia", "Asia/Jakarta"],
  ["Manila, Philippines", "Asia/Manila"], ["Ho Chi Minh City, Vietnam", "Asia/Ho_Chi_Minh"],
  ["Hanoi, Vietnam", "Asia/Ho_Chi_Minh"], ["Taipei, Taiwan", "Asia/Taipei"],
  // Middle East
  ["Tehran, Iran", "Asia/Tehran"], ["Baghdad, Iraq", "Asia/Baghdad"],
  ["Beirut, Lebanon", "Asia/Beirut"], ["Amman, Jordan", "Asia/Amman"],
  ["Jerusalem, Israel", "Asia/Jerusalem"], ["Tel Aviv, Israel", "Asia/Jerusalem"],
  ["Istanbul, Turkey", "Europe/Istanbul"], ["Ankara, Turkey", "Europe/Istanbul"],
  ["Cairo, Egypt", "Africa/Cairo"],
  // Africa
  ["Lagos, Nigeria", "Africa/Lagos"], ["Nairobi, Kenya", "Africa/Nairobi"],
  ["Johannesburg, South Africa", "Africa/Johannesburg"],
  ["Cape Town, South Africa", "Africa/Johannesburg"],
  ["Casablanca, Morocco", "Africa/Casablanca"], ["Algiers, Algeria", "Africa/Algiers"],
  ["Addis Ababa, Ethiopia", "Africa/Addis_Ababa"], ["Accra, Ghana", "Africa/Accra"],
  // Europe
  ["London, UK", "Europe/London"], ["Manchester, UK", "Europe/London"],
  ["Edinburgh, UK", "Europe/London"], ["Dublin, Ireland", "Europe/Dublin"],
  ["Paris, France", "Europe/Paris"], ["Berlin, Germany", "Europe/Berlin"],
  ["Munich, Germany", "Europe/Berlin"], ["Frankfurt, Germany", "Europe/Berlin"],
  ["Hamburg, Germany", "Europe/Berlin"], ["Amsterdam, Netherlands", "Europe/Amsterdam"],
  ["Brussels, Belgium", "Europe/Brussels"], ["Madrid, Spain", "Europe/Madrid"],
  ["Barcelona, Spain", "Europe/Madrid"], ["Lisbon, Portugal", "Europe/Lisbon"],
  ["Rome, Italy", "Europe/Rome"], ["Milan, Italy", "Europe/Rome"],
  ["Athens, Greece", "Europe/Athens"], ["Stockholm, Sweden", "Europe/Stockholm"],
  ["Oslo, Norway", "Europe/Oslo"], ["Copenhagen, Denmark", "Europe/Copenhagen"],
  ["Helsinki, Finland", "Europe/Helsinki"], ["Warsaw, Poland", "Europe/Warsaw"],
  ["Prague, Czech Republic", "Europe/Prague"], ["Vienna, Austria", "Europe/Vienna"],
  ["Zurich, Switzerland", "Europe/Zurich"], ["Geneva, Switzerland", "Europe/Zurich"],
  ["Budapest, Hungary", "Europe/Budapest"], ["Bucharest, Romania", "Europe/Bucharest"],
  ["Moscow, Russia", "Europe/Moscow"], ["Kyiv, Ukraine", "Europe/Kyiv"],
  // North America
  ["New York, USA", "America/New_York"], ["Los Angeles, USA", "America/Los_Angeles"],
  ["San Francisco, USA", "America/Los_Angeles"], ["Chicago, USA", "America/Chicago"],
  ["Houston, USA", "America/Chicago"], ["Boston, USA", "America/New_York"],
  ["Washington, USA", "America/New_York"], ["Miami, USA", "America/New_York"],
  ["Seattle, USA", "America/Los_Angeles"], ["Atlanta, USA", "America/New_York"],
  ["Denver, USA", "America/Denver"], ["Phoenix, USA", "America/Phoenix"],
  ["Dallas, USA", "America/Chicago"], ["Toronto, Canada", "America/Toronto"],
  ["Vancouver, Canada", "America/Vancouver"], ["Montreal, Canada", "America/Toronto"],
  ["Mexico City, Mexico", "America/Mexico_City"],
  // South America
  ["São Paulo, Brazil", "America/Sao_Paulo"], ["Rio de Janeiro, Brazil", "America/Sao_Paulo"],
  ["Buenos Aires, Argentina", "America/Argentina/Buenos_Aires"],
  ["Lima, Peru", "America/Lima"], ["Santiago, Chile", "America/Santiago"],
  ["Bogotá, Colombia", "America/Bogota"], ["Caracas, Venezuela", "America/Caracas"],
  // Oceania
  ["Sydney, Australia", "Australia/Sydney"], ["Melbourne, Australia", "Australia/Melbourne"],
  ["Brisbane, Australia", "Australia/Brisbane"], ["Perth, Australia", "Australia/Perth"],
  ["Auckland, New Zealand", "Pacific/Auckland"],
  ["Wellington, New Zealand", "Pacific/Auckland"],
];

// ── storage shim ──
const storage = {
  async get(keys) {
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.sync) {
      return chrome.storage.sync.get(keys);
    }
    const result = {};
    const list = Array.isArray(keys) ? keys : [keys];
    for (const key of list) {
      const v = localStorage.getItem(key);
      if (v !== null) {
        try { result[key] = JSON.parse(v); } catch { result[key] = v; }
      }
    }
    return result;
  },
  async set(items) {
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.sync) {
      return chrome.storage.sync.set(items);
    }
    for (const [k, v] of Object.entries(items)) {
      localStorage.setItem(k, JSON.stringify(v));
    }
  }
};

const $ = (id) => document.getElementById(id);
const fmt = (n) => Math.floor(n).toLocaleString("en-US");
const pad = (n, w) => String(n).padStart(w, "0");
const browserTz = () => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

let birth = null;
let birthMs = 0;
let staticInterval = null;
let tickerRaf = null;

function calendarDiff(from, to) {
  let years = to.getFullYear() - from.getFullYear();
  let months = to.getMonth() - from.getMonth();
  let days = to.getDate() - from.getDate();
  if (days < 0) {
    months--;
    const prev = new Date(to.getFullYear(), to.getMonth(), 0);
    days += prev.getDate();
  }
  if (months < 0) { years--; months += 12; }
  return { years, months, days };
}

// ── city / timezone helpers ─────────────────────────────────────
function findCity(query) {
  if (!query) return null;
  const q = query.trim().toLowerCase();
  if (!q) return null;

  // exact full-label match
  let hit = CITIES.find(([name]) => name.toLowerCase() === q);
  if (hit) return { name: hit[0], tz: hit[1] };

  // city-only exact match (before comma)
  hit = CITIES.find(([name]) => name.split(",")[0].trim().toLowerCase() === q);
  if (hit) return { name: hit[0], tz: hit[1] };

  // prefix match on city portion
  hit = CITIES.find(([name]) => name.split(",")[0].trim().toLowerCase().startsWith(q));
  if (hit) return { name: hit[0], tz: hit[1] };

  // substring anywhere in full label
  hit = CITIES.find(([name]) => name.toLowerCase().includes(q));
  return hit ? { name: hit[0], tz: hit[1] } : null;
}

function describeTz(tz, atDate) {
  try {
    const long = new Intl.DateTimeFormat("en-US", {
      timeZone: tz, timeZoneName: "longOffset"
    }).formatToParts(atDate).find(p => p.type === "timeZoneName").value;
    const offset = long.replace("GMT", "") || "+00:00";
    const short = new Intl.DateTimeFormat("en-US", {
      timeZone: tz, timeZoneName: "short"
    }).formatToParts(atDate).find(p => p.type === "timeZoneName").value;
    const abbrevPart = (short.length <= 5 && !short.includes(":")) ? ` ${short}` : "";
    return { offset, abbrev: short, label: `${tz} · GMT${offset}${abbrevPart}` };
  } catch {
    return null;
  }
}

function buildBirthdayISO(date, time, tz) {
  // wall-clock approach: parse the date+time as if it were UTC, ask Intl what
  // tz's offset is at that moment, then reconstruct with that offset.
  const proxy = new Date(`${date}T${time}:00Z`);
  if (isNaN(proxy.getTime())) return null;
  const info = describeTz(tz, proxy);
  if (!info) return null;
  const stamped = new Date(`${date}T${time}:00${info.offset}`);
  return isNaN(stamped.getTime()) ? null : stamped.toISOString();
}

// ── dashboard render ────────────────────────────────────────────
function paintStatic() {
  const now = new Date();
  const diff = calendarDiff(birth, now);

  $("years").textContent = diff.years;
  $("months").textContent = diff.months;
  $("days").textContent = diff.days;

  const elapsedMs = now - birthMs;
  const totalSec = elapsedMs / 1000;
  const totalDays = elapsedMs / 86_400_000;
  const totalHours = elapsedMs / 3_600_000;
  const totalMin = elapsedMs / 60_000;

  $("total-days").textContent = fmt(totalDays);
  $("total-hours").textContent = fmt(totalHours);
  $("total-minutes").textContent = fmt(totalMin);

  $("heartbeats").textContent = "~" + fmt(totalSec * (80 / 60));
  $("sunrises").textContent = "~" + fmt(totalDays);
  $("meals").textContent = "~" + fmt(totalDays * 3);
  $("sleep-days").textContent = "~" + fmt(totalDays / 3);

  const lifeMs = LIFE_EXPECTANCY_YEARS * 365.25 * 86_400_000;
  const remainingMs = Math.max(0, lifeMs - elapsedMs);
  const daysLeft = remainingMs / 86_400_000;
  const pct = Math.min(100, (elapsedMs / lifeMs) * 100);

  $("days-left").textContent = fmt(daysLeft);
  $("pct-lived").textContent = pct.toFixed(1) + "%";
  requestAnimationFrame(() => {
    $("progress-fill").style.width = pct.toFixed(2) + "%";
  });
}

function tick() {
  const now = Date.now();
  const elapsed = (now - birthMs) / 1000;
  const whole = Math.floor(elapsed);
  const frac = Math.floor((elapsed - whole) * 1000);
  $("sec-int").textContent = whole.toLocaleString("en-US");
  $("sec-frac").textContent = pad(frac, 3);

  const d = new Date(now);
  const sod = d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
  $("sec-today").textContent = sod.toLocaleString("en-US");

  tickerRaf = requestAnimationFrame(tick);
}

function showDashboard(birthdayIso) {
  birth = new Date(birthdayIso);
  birthMs = birth.getTime();

  $("dashboard").hidden = false;
  $("settings").hidden = true;
  $("edit-link").hidden = false;

  paintStatic();
  if (staticInterval) clearInterval(staticInterval);
  staticInterval = setInterval(paintStatic, 60_000);
  if (tickerRaf) cancelAnimationFrame(tickerRaf);
  tickerRaf = requestAnimationFrame(tick);
}

// ── settings panel ──────────────────────────────────────────────
function updateTzCaption() {
  const place = $("dob-place").value;
  const date = $("dob-date").value;
  const time = $("dob-time").value;
  const probe = (date && time)
    ? new Date(`${date}T${time}:00Z`)
    : new Date();

  const cap = $("tz-caption");
  cap.classList.remove("detected", "fallback");

  if (!place || !place.trim()) {
    const tz = browserTz();
    const info = describeTz(tz, probe);
    cap.textContent = info ? `default · ${info.label}` : "";
    cap.classList.add("fallback");
    return;
  }

  const match = findCity(place);
  if (match) {
    const info = describeTz(match.tz, probe);
    cap.textContent = info ? info.label : match.tz;
    cap.classList.add("detected");
  } else {
    const tz = browserTz();
    const info = describeTz(tz, probe);
    cap.textContent = info ? `unknown city · using ${info.label}` : "unknown city";
    cap.classList.add("fallback");
  }
}

function showSettings(saved) {
  $("dashboard").hidden = true;
  $("settings").hidden = false;
  $("edit-link").hidden = true;
  $("settings-error").hidden = true;

  // populate place datalist once
  const dl = $("place-list");
  if (!dl.children.length) {
    for (const [name] of CITIES) {
      const opt = document.createElement("option");
      opt.value = name;
      dl.appendChild(opt);
    }
  }

  if (saved && saved.birthday) {
    // re-render the local wall-clock in the saved timezone (so the inputs
    // show the same date/time the user originally entered, not their current
    // browser-local interpretation of the UTC stored value)
    const tz = saved.timezone || browserTz();
    const d = new Date(saved.birthday);
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hour12: false
    }).formatToParts(d);
    const p = Object.fromEntries(parts.filter(x => x.type !== "literal").map(x => [x.type, x.value]));
    $("dob-date").value = `${p.year}-${p.month}-${p.day}`;
    $("dob-time").value = `${p.hour === "24" ? "00" : p.hour}:${p.minute}`;
    $("dob-place").value = saved.place || "";
    $("settings-cancel").hidden = false;
  } else {
    $("dob-date").value = "";
    $("dob-time").value = "";
    $("dob-place").value = "";
    $("settings-cancel").hidden = true;
  }

  const today = new Date();
  $("dob-date").max = `${today.getFullYear()}-${pad(today.getMonth() + 1, 2)}-${pad(today.getDate(), 2)}`;

  updateTzCaption();
  setTimeout(() => $("dob-date").focus(), 50);
}

function showError(msg) {
  const el = $("settings-error");
  el.textContent = msg;
  el.hidden = false;
}

async function init() {
  $("settings-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const date = $("dob-date").value;
    const time = $("dob-time").value;
    const placeRaw = $("dob-place").value.trim();

    if (!date || !time) {
      showError("date and time are both required.");
      return;
    }

    const match = placeRaw ? findCity(placeRaw) : null;
    const tz = match ? match.tz : browserTz();
    const placeLabel = match ? match.name : placeRaw;

    const iso = buildBirthdayISO(date, time, tz);
    if (!iso) {
      showError("couldn't build a valid date from those inputs.");
      return;
    }
    if (new Date(iso) > new Date()) {
      showError("birthday must be in the past.");
      return;
    }

    await storage.set({ birthday: iso, timezone: tz, place: placeLabel });
    showDashboard(iso);
  });

  $("settings-cancel").addEventListener("click", async () => {
    const data = await storage.get(["birthday"]);
    if (data.birthday) showDashboard(data.birthday);
  });

  $("edit-link").addEventListener("click", async () => {
    const data = await storage.get(["birthday", "timezone", "place"]);
    showSettings(data);
  });

  $("dob-place").addEventListener("input", updateTzCaption);
  $("dob-date").addEventListener("change", updateTzCaption);
  $("dob-time").addEventListener("change", updateTzCaption);

  const data = await storage.get(["birthday", "timezone", "place"]);
  if (data.birthday) {
    showDashboard(data.birthday);
  } else {
    showSettings(null);
  }
}

init();
