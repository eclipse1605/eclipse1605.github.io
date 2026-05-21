(() => {
  const container = document.getElementById("notebook-viewer");
  if (!container) {
    return;
  }

  const src = container.getAttribute("data-src");
  if (!src) {
    container.textContent = "Notebook source not provided.";
    return;
  }

  const escapeHtml = (value) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const renderOutput = (output) => {
    if (!output) return "";
    if (output.output_type === "stream") {
      return `<pre class="nb-output">${escapeHtml(output.text || "")}</pre>`;
    }
    if (output.output_type === "error") {
      const traceback = (output.traceback || []).join("\n");
      return `<pre class="nb-output nb-error">${escapeHtml(traceback)}</pre>`;
    }
    if (output.output_type === "execute_result" || output.output_type === "display_data") {
      const data = output.data || {};
      if (data["text/html"]) {
        return `<div class="nb-output">${data["text/html"]}</div>`;
      }
      if (data["text/markdown"] && window.marked) {
        return `<div class="nb-output">${marked.parse(data["text/markdown"])} </div>`;
      }
      if (data["image/png"]) {
        return `<img class="nb-image" alt="Notebook output" src="data:image/png;base64,${data["image/png"]}">`;
      }
      if (data["text/plain"]) {
        return `<pre class="nb-output">${escapeHtml(data["text/plain"].join ? data["text/plain"].join("") : data["text/plain"])} </pre>`;
      }
    }
    return "";
  };

  const renderMath = (element) => {
    if (window.renderMathInElement) {
      renderMathInElement(element, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false },
          { left: "\\(", right: "\\)", display: false },
          { left: "\\[", right: "\\]", display: true }
        ],
        throwOnError: false,
        ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code"]
      });
    }
  };

  const renderCell = (cell) => {
    if (cell.cell_type === "markdown") {
      const source = (cell.source || []).join("");
      const html = window.marked ? marked.parse(source) : escapeHtml(source);
      return `<div class="nb-cell nb-markdown">${html}</div>`;
    }
    if (cell.cell_type === "code") {
      const source = escapeHtml((cell.source || []).join(""));
      const outputs = (cell.outputs || []).map(renderOutput).join("");
      return `
        <div class="nb-cell nb-code">
          <pre class="nb-source"><code>${source}</code></pre>
          ${outputs}
        </div>
      `;
    }
    return "";
  };

  fetch(src)
    .then((res) => {
      if (!res.ok) {
        throw new Error("Failed to load notebook.");
      }
      return res.json();
    })
    .then((data) => {
      const cells = data.cells || [];
      if (!cells.length) {
        container.textContent = "Notebook is empty.";
        return;
      }
      container.innerHTML = cells.map(renderCell).join("");
      renderMath(container);
    })
    .catch((err) => {
      container.textContent = err.message || "Failed to render notebook.";
    });
})();
