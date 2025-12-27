const input = document.getElementById("svg-input");
const preview = document.getElementById("svg-preview");
const status = document.getElementById("status");
const loadSampleBtn = document.getElementById("load-sample");
const debugLog = document.getElementById("debug-log");

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
  } catch (err) {
    preview?.replaceChildren();
    setStatus(`無法渲染：${err.message}`, "error");
    logDebug(`渲染失敗：${err.message}`);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  if (!input) return;

  input.value = input.value.trim() || sample;
  setStatus("已載入範例，編輯後立即預覽。", "info");
  logDebug("初始化完成，已填入預設範例。");
  renderSvg();
  input.addEventListener("input", renderSvg);

  loadSampleBtn?.addEventListener("click", () => {
    input.value = sample;
    logDebug("載入預設範例。");
    renderSvg();
  });

  window.addEventListener("error", (event) => {
    logDebug(`腳本錯誤：${event.message}`);
    setStatus("腳本發生錯誤，請查看除錯訊息。", "error");
  });

  window.addEventListener("unhandledrejection", (event) => {
    logDebug(`未處理的 promise 拒絕：${event.reason}`);
    setStatus("腳本發生錯誤，請查看除錯訊息。", "error");
  });
});
