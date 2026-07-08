window.TCMapKit = (() => {
  const state = {
    bootstrap: null
  };

  async function jsonFetch(url, options) {
    const resp = await fetch(url, options);
    const text = await resp.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }
    if (!resp.ok) {
      const error = new Error((data && data.message) || `Request failed: ${resp.status}`);
      error.status = resp.status;
      error.data = data;
      throw error;
    }
    return data;
  }

  async function bootstrap() {
    if (state.bootstrap) return state.bootstrap;
    state.bootstrap = await jsonFetch('/api/tencent/bootstrap');
    return state.bootstrap;
  }

  function escapeHtml(text) {
    return String(text)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function queryString(params = {}) {
    const url = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        url.set(key, String(value));
      }
    });
    return url.toString();
  }

  function request(url, options) {
    return jsonFetch(url, options);
  }

  return { bootstrap, request, queryString, escapeHtml };
})();
