(function (root, factory) {
  const api = factory();

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  root.AsusRouterHelpers = api;
  root.AsusRouterHelpers = api;
}(typeof globalThis !== "undefined" ? globalThis : this, function () {
  function escapeHtml(value = "") {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function truncateText(value, maxLength = 18) {
    const text = String(value ?? "");
    if (text.length <= maxLength) return escapeHtml(text);

    const safeText = escapeHtml(text);
    return `<span class="clients-truncated-text" title="${safeText}">${safeText}</span>`;
  }

  return {
    escapeHtml,
    truncateText,
  };
}));
