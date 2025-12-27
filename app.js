const input = document.getElementById("svg-input");
const preview = document.getElementById("svg-preview");
const status = document.getElementById("status");

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

function renderSvg() {
  const raw = input.value.trim();

  if (!raw) {
    preview.replaceChildren();
    status.textContent = "貼上 SVG 後開始預覽。";
    return;
  }

  try {
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
    preview.replaceChildren(imported);
    status.textContent = "預覽已更新。";
  } catch (err) {
    preview.replaceChildren();
    status.textContent = `無法渲染：${err.message}`;
  }
}

window.addEventListener("DOMContentLoaded", () => {
  input.value = sample;
  renderSvg();
  input.addEventListener("input", renderSvg);
});
