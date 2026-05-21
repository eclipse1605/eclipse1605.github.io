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

  const normalizeText = (value) => (Array.isArray(value) ? value.join("") : String(value || ""));

  const protectMath = (source) => {
    const math = [];
    let protectedSource = "";
    let index = 0;

    const isEscaped = (position) => {
      let slashCount = 0;
      for (let cursor = position - 1; cursor >= 0 && source[cursor] === "\\"; cursor -= 1) {
        slashCount += 1;
      }
      return slashCount % 2 === 1;
    };

    const store = (value) => {
      const token = `@@NOTEBOOKMATH${math.length}@@`;
      math.push(value);
      return token;
    };

    while (index < source.length) {
      const escaped = isEscaped(index);
      const displayDelimiter = !escaped && source.startsWith("$$", index) ? "$$" : null;
      const bracketDelimiter = !escaped && source.startsWith("\\[", index) ? "\\[" : null;
      const parenDelimiter = !escaped && source.startsWith("\\(", index) ? "\\(" : null;
      const inlineDelimiter =
        !escaped && source[index] === "$" && !source.startsWith("$$", index) ? "$" : null;
      const left = displayDelimiter || bracketDelimiter || parenDelimiter || inlineDelimiter;

      if (!left) {
        protectedSource += source[index];
        index += 1;
        continue;
      }

      const right = left === "\\[" ? "\\]" : left === "\\(" ? "\\)" : left;
      let cursor = index + left.length;
      let end = -1;

      while (cursor < source.length) {
        if (source[cursor] === "\\") {
          cursor += 2;
          continue;
        }
        if (source.startsWith(right, cursor)) {
          end = cursor;
          break;
        }
        cursor += 1;
      }

      if (end === -1) {
        protectedSource += source[index];
        index += 1;
        continue;
      }

      const value = source.slice(index, end + right.length);
      protectedSource += store(value);
      index = end + right.length;
    }

    return { protectedSource, math };
  };

  const restoreMath = (html, math) =>
    math.reduce(
      (result, value, index) =>
        result.replaceAll(`@@NOTEBOOKMATH${index}@@`, escapeHtml(value)),
      html
    );

  const renderMarkdown = (source) => {
    const { protectedSource, math } = protectMath(normalizeText(source));
    const html = window.marked ? marked.parse(protectedSource) : escapeHtml(protectedSource);
    return restoreMath(html, math);
  };

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
      if (data["text/markdown"]) {
        return `<div class="nb-output">${renderMarkdown(data["text/markdown"])} </div>`;
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
        strict: "ignore",
        processEscapes: true,
        ignoredClasses: ["katex"],
        ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code"]
      });
    }
  };

  // Wait for a global condition then run callback (bounded retries)
  const waitForGlobal = (testFn, cb, attempts = 20, interval = 150) => {
    let tries = 0;
    const id = setInterval(() => {
      try {
        if (testFn()) {
          clearInterval(id);
          cb();
          return;
        }
      } catch (e) {
        // ignore
      }
      if (++tries >= attempts) clearInterval(id);
    }, interval);
  };

  const renderCell = (cell) => {
    if (cell.cell_type === "markdown") {
      const source = (cell.source || []).join("");
      const html = renderMarkdown(source);
      return `<div class="nb-cell nb-markdown">${html}</div>`;
    }
    if (cell.cell_type === "code") {
      const source = escapeHtml((cell.source || []).join(""));
      const outputs = (cell.outputs || []).map(renderOutput).join("");
      return `
        <div class="nb-cell nb-code">
          <pre class="nb-source"><code class="language-python">${source}</code></pre>
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
      // Highlight injected code when hljs becomes available
      waitForGlobal(() => window.hljs, () => {
        try {
          container.querySelectorAll("pre.nb-source code").forEach((block) => {
            hljs.highlightElement(block);
          });
        } catch (e) {}
      }, 40, 150);

      // Render math in injected content when KaTeX auto-render is ready
      waitForGlobal(() => window.renderMathInElement, () => {
        try {
          renderMath(container);
        } catch (e) {}
      }, 40, 150);
    })
    .catch((err) => {
      container.textContent = err.message || "Failed to render notebook.";
    });
})();
