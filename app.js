const input = document.getElementById("svg-input");
const preview = document.getElementById("svg-preview");
const status = document.getElementById("status");
const loadSampleBtn = document.getElementById("load-sample");
const debugLog = document.getElementById("debug-log");
const clearBtn = document.getElementById("clear-input");
const scaleControl = document.getElementById("preview-scale");
const scaleLabel = document.getElementById("preview-scale-label");
const STORAGE_KEY = "svg-live-preview-input";

const sample = `<svg width="240" height="240" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0%" x2="100%" y1="0%" y2="100%">
      <stop offset="0%" stop-color="#3b82f6" />
      <stop offset="100%" stop-color="#22d3ee" />
    </linearGradient>
  </defs>
  <rect x="8" y="8" width="104" height="104" rx="18" fill="url(#g)" />
  <circle cx="60" cy="60" r="34" fill="white" opacity="0.9" />
  <path d="M60 32 L78 76 H42 Z" fill="#0f172a" opacity="0.8" />
</svg>`;

function logDebug(message) {
  if (!debugLog) return;
  const stamp = new Date().toLocaleTimeString("zh-TW", { hour12: false });
  const existing = debugLog.textContent === "等待輸入…" ? "" : debugLog.textContent;
  debugLog.textContent = `[${stamp}] ${message}\n${existing}`.trim();
}

function setStatus(message, tone = "info") {
  if (!status) return;
  status.textContent = message;
  status.dataset.tone = tone;
}

function renderSvg() {
  const raw = input?.value.trim() ?? "";

  if (!raw) {
    preview?.replaceChildren();
    setStatus("貼上 SVG 後開始預覽。", "info");
    logDebug("輸入為空，清除預覽。");
    return;
  }

  try {
    if (typeof DOMParser === "undefined") {
      throw new Error("此瀏覽器不支援 DOMParser");
    }

    const doc = new DOMParser().parseFromString(raw, "image/svg+xml");
    const parseError = doc.querySelector("parsererror");

    if (parseError) {
      throw new Error(parseError.textContent || "解析失敗");
    }

    const svg = doc.documentElement;
    if (svg.nodeName.toLowerCase() !== "svg") {
      throw new Error("根節點不是 <svg>");
    }

    const imported = document.importNode(svg, true);
    imported.classList.add("preview-svg");
    preview?.replaceChildren(imported);
    setStatus("預覽已更新。", "success");
    logDebug("成功渲染輸入的 SVG。");
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(STORAGE_KEY, raw);
    }
  } catch (err) {
    preview?.replaceChildren();
    setStatus(`無法渲染：${err.message}`, "error");
    logDebug(`渲染失敗：${err.message}`);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  if (!input) return;

  const saved = typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEY) : "";
  input.value = (saved && saved.trim()) || input.value.trim() || sample;
  setStatus(saved ? "已載入上次輸入內容。" : "已載入範例，編輯後立即預覽。", "info");
  logDebug(saved ? "初始化完成，已載入快取內容。" : "初始化完成，已填入預設範例。");
  renderSvg();
  input.addEventListener("input", renderSvg);

  loadSampleBtn?.addEventListener("click", () => {
    input.value = sample;
    logDebug("載入預設範例。");
    renderSvg();
  });

  clearBtn?.addEventListener("click", () => {
    input.value = "";
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
    logDebug("清除輸入並移除快取。");
    renderSvg();
  });

  const updateScale = (value) => {
    const numeric = Number(value);
    const clamped = Number.isFinite(numeric) ? Math.min(140, Math.max(50, numeric)) : 100;
    document.documentElement.style.setProperty("--preview-scale", (clamped / 100).toString());
    if (scaleLabel) {
      scaleLabel.textContent = `${clamped}%`;
    }
  };

  if (scaleControl) {
    updateScale(scaleControl.value || "100");
    scaleControl.addEventListener("input", (event) => {
      updateScale(event.target.value);
    });
  }

  window.addEventListener("error", (event) => {
    logDebug(`腳本錯誤：${event.message}`);
    setStatus("腳本發生錯誤，請查看除錯訊息。", "error");
  });

  window.addEventListener("unhandledrejection", (event) => {
    logDebug(`未處理的 promise 拒絕：${event.reason}`);
    setStatus("腳本發生錯誤，請查看除錯訊息。", "error");
  });
});
