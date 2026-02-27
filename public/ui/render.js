export function initRenderer(rootSelector = '#app') {
  const root = typeof rootSelector === 'string' ? document.querySelector(rootSelector) : rootSelector;
  if (!root) {
    throw new Error('Unable to find app root');
  }

  const render = (html, afterRender) => {
    root.innerHTML = html;
    if (typeof afterRender === 'function') {
      afterRender(root);
    }
  };

  return { root, render };
}
