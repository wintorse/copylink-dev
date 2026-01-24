export type ToastOptions = {
  durationMs?: number;
  /**
   * Customize the toast content. The provided element has the base styling applied.
   * This allows consumers (e.g., userscript) to add buttons/links next to the message.
   */
  renderContent?: (container: HTMLElement, message: string) => void;
  /**
   * Optional external CSS for reuse (e.g., extension bundle). When omitted, inline styles are used.
   */
  getCssHref?: () => string;
};

const CLASSES = {
  visible: "visible",
  message: "copylink-dev-toast",
};

const toastStyle = `
  :host {
    all: initial;
    position: fixed;
    bottom: 24px;
    left: 24px;
    z-index: 3000;
    pointer-events: none;
    display: flex;
    align-items: center;
  }
  .${CLASSES.message} {
    position: relative;
    padding: 14px 16px;
    max-height: calc(100% - 48px);
    max-width: 568px;
    min-height: 20px;
    border-radius: 4px;
    background-color: rgb(30, 30, 30);
    box-shadow: 0 4px 8px 3px rgba(60, 64, 67, 0.15);
    font-family: 'Google Sans', Roboto, Arial, sans-serif;
    font-size: 14px;
    font-weight: 400;
    text-align: left;
    color: #f2f2f2;
    opacity: 0;
    transform: translate3d(0, 24px, 0);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    display: inline-flex;
    gap: 8px;
    align-items: center;
  }
  :host(.${CLASSES.visible}) .${CLASSES.message} {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
`;

export const showToastCore = (
  message: string,
  document: Document,
  options?: ToastOptions,
) => {
  const host = document.createElement("div");
  const shadow = host.attachShadow({ mode: "open" });
  if (options?.getCssHref) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = options.getCssHref();
    shadow.appendChild(link);
  }
  const style = document.createElement("style");
  style.textContent = toastStyle;
  const toast = document.createElement("div");
  toast.className = CLASSES.message;
  if (options?.renderContent) {
    options.renderContent(toast, message);
  } else {
    toast.textContent = message;
  }
  shadow.appendChild(style);
  shadow.appendChild(toast);
  document.body.appendChild(host);

  requestAnimationFrame(() => {
    host.classList.add(CLASSES.visible);
  });

  const duration = options?.durationMs ?? 3000;
  setTimeout(() => {
    host.classList.remove(CLASSES.visible);
    setTimeout(() => {
      style.remove();
      host.remove();
    }, 200);
  }, duration);
};
