const PAGE_SIZE = 30;
const SEARCH_DELAY = 220;
const DATA_URL = "https://script.google.com/macros/s/AKfycbycy1G0jkCT3sS_H7r-jPy9C35QsC6-aUsoywkcGVP43XuezEfkSP3QmLYFjZ-eOo4Uvw/exec?opt=q";
const FIELD_LABELS = {
  id: "ลำดับ",
  ssb_code: "SSB Code",
  nhs_code: "NHS Code",
  name: "ชื่อรายการทดสอบ",
  group: "กลุ่มงาน",
  ssb_status: "สถานะ",
  outsite: "หน่วยงาน / สถานที่ส่งตรวจ",
  sample_type: "ชนิดและปริมาณสิ่งส่งตรวจ",
  nh_turnaround_time: "ระยะเวลารายงานผล"
};

const input = document.querySelector("#search-input");
const clearButton = document.querySelector("#clear-search");
const list = document.querySelector("#results-list");
const summary = document.querySelector("#result-summary");
const loadingSkeleton = document.querySelector("#loading-skeleton");
const emptyState = document.querySelector("#empty-state");
const emptyTitle = document.querySelector("#empty-title");
const emptyCopy = document.querySelector("#empty-copy");
const pagination = document.querySelector("#pagination");
const previousButton = document.querySelector("#previous-page");
const nextButton = document.querySelector("#next-page");
const retryButton = document.querySelector("#retry-load");
const pageNumbers = document.querySelector("#page-numbers");
const results = document.querySelector(".results");

let records = [];
let matches = [];
let currentPage = 1;
let debounceTimer;

function normalize(value) {
  return String(value ?? "").normalize("NFKC").toLocaleLowerCase("th").trim();
}

function formatValue(key, value) {
  if (value === true) return "ใช่";
  if (value === false) return "ไม่ใช่";
  return value === null || value === undefined || value === "" ? "—" : String(value);
}

function addField(grid, key, value) {
  const field = document.createElement("div");
  field.className = "field";

  const label = document.createElement("span");
  label.className = "field__label";
  label.textContent = FIELD_LABELS[key] || key;

  const content = document.createElement("span");
  content.className = `field__value${key === "id" || key.endsWith("_code") ? " field__value--code" : ""}`;
  content.textContent = formatValue(key, value);
  field.append(label, content);
  grid.append(field);
}

function makeCard(record) {
  const card = document.createElement("article");
  card.className = "result-card";

  const head = document.createElement("div");
  head.className = "result-card__head";
  const name = document.createElement("h3");
  name.className = "result-card__name";
  name.textContent = formatValue("name", record.name);
  const badges = document.createElement("div");
  badges.className = "result-card__badges";

  for (const [value, isStatus] of [[record.group, false], [record.ssb_status, true]]) {
    if (value === null || value === undefined || value === "") continue;
    const badge = document.createElement("span");
    const active = isStatus && normalize(value) === "active";
    badge.className = `badge${isStatus ? active ? " badge--active" : " badge--inactive" : ""}`;
    badge.textContent = String(value);
    badges.append(badge);
  }
  head.append(name, badges);

  const grid = document.createElement("div");
  grid.className = "field-grid";
  for (const [key, value] of Object.entries(record)) {
    if (!["id", "isBroadcast", "outsite", "ssb_status", "group"].includes(key)) addField(grid, key, value);
  }
  card.append(head, grid);
  return card;
}

function renderPage(page = 1) {
  const pageCount = Math.ceil(matches.length / PAGE_SIZE);
  currentPage = Math.min(Math.max(page, 1), pageCount);
  const start = (currentPage - 1) * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, matches.length);
  const fragment = document.createDocumentFragment();
  for (let i = start; i < end; i += 1) fragment.append(makeCard(matches[i]));
  list.replaceChildren();
  list.append(fragment);
  summary.textContent = `แสดง ${start + 1}–${end} จาก ${matches.length.toLocaleString("th-TH")} รายการ`;
  pagination.hidden = matches.length === 0;
  previousButton.disabled = currentPage === 1;
  nextButton.disabled = currentPage === pageCount;
  pageNumbers.replaceChildren();

  const visiblePages = [...new Set([1, currentPage - 1, currentPage, currentPage + 1, pageCount])]
    .filter(number => number >= 1 && number <= pageCount)
    .sort((a, b) => a - b);
  let lastPage = 0;
  for (const number of visiblePages) {
    if (number - lastPage > 1) {
      const ellipsis = document.createElement("span");
      ellipsis.className = "pagination__ellipsis";
      ellipsis.textContent = "…";
      pageNumbers.append(ellipsis);
    }
    const button = document.createElement("button");
    button.className = "pagination__number";
    button.type = "button";
    button.textContent = String(number);
    button.setAttribute("aria-label", `ไปหน้าที่ ${number}`);
    if (number === currentPage) button.setAttribute("aria-current", "page");
    button.addEventListener("click", () => renderPage(number));
    pageNumbers.append(button);
    lastPage = number;
  }
}

function showEmpty(title, copy) {
  emptyTitle.textContent = title;
  emptyCopy.textContent = copy;
  emptyState.hidden = false;
}

function runSearch() {
  const query = normalize(input.value);
  clearButton.hidden = query.length === 0;
  list.replaceChildren();
  pagination.hidden = true;
  currentPage = 1;

  if (!query) {
    matches = records;
    emptyState.hidden = matches.length > 0;
    if (!matches.length) showEmpty("ยังไม่มีรายการทดสอบ", "ไม่พบข้อมูลในรายการขณะนี้");
    else renderPage();
    return;
  }

  const terms = query.split(/\s+/).filter(Boolean);
  matches = records.filter(record => {
    const text = normalize(record.name);
    return terms.every(term => text.includes(term));
  });

  emptyState.hidden = matches.length > 0;
  if (!matches.length) showEmpty("ไม่พบรายการทดสอบ", "ลองตรวจคำสะกดหรือพิมพ์ชื่อรายการอื่น");
  else renderPage();
}

function loadData() {
  loadingSkeleton.hidden = false;
  emptyState.hidden = true;
  results.setAttribute("aria-busy", "true");
  retryButton.hidden = true;
  fetch(DATA_URL, { cache: "no-cache" })
    .then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then(payload => {
      if (!Array.isArray(payload.data)) throw new Error("Invalid data format");
      records = payload.data;
      loadingSkeleton.hidden = true;
      results.setAttribute("aria-busy", "false");
      runSearch();
    })
    .catch(() => {
      loadingSkeleton.hidden = true;
      results.setAttribute("aria-busy", "false");
      summary.textContent = "โหลดข้อมูลไม่สำเร็จ";
      showEmpty("ไม่สามารถโหลดรายการทดสอบได้", "ตรวจสอบการเชื่อมต่อ แล้วกดลองโหลดอีกครั้ง");
      retryButton.hidden = false;
    });
}

input.addEventListener("input", () => {
  window.clearTimeout(debounceTimer);
  if (!records.length) return;
  summary.textContent = "กำลังค้นหาชื่อรายการ…";
  debounceTimer = window.setTimeout(runSearch, SEARCH_DELAY);
});

clearButton.addEventListener("click", () => {
  input.value = "";
  runSearch();
  input.focus();
});

previousButton.addEventListener("click", () => renderPage(currentPage - 1));
nextButton.addEventListener("click", () => renderPage(currentPage + 1));
retryButton.addEventListener("click", loadData);

const pressableSelector = ".clear-button, .pagination__step, .pagination__number";
function clearPointerPress() {
  document.querySelectorAll("[data-pointer-pressed]").forEach(button => button.removeAttribute("data-pointer-pressed"));
}

document.addEventListener("pointerdown", event => {
  if (!event.isPrimary || event.button !== 0 || !(event.target instanceof Element)) return;
  const button = event.target.closest(pressableSelector);
  if (!button || button.disabled || button.getAttribute("aria-current") === "page") return;
  button.setAttribute("data-pointer-pressed", "true");
});

const releasePointerPress = event => {
  if (event.isPrimary) clearPointerPress();
};
document.addEventListener("pointerup", releasePointerPress);
document.addEventListener("pointercancel", releasePointerPress);
window.addEventListener("blur", clearPointerPress);

loadData();
