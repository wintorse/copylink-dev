export type ToastOptions = {
  durationMs?: number;
  /**
   * Customize the toast content. The provided element has the base styling applied.
   * This allows consumers (e.g., userscript) to add buttons/links next to the message.
   */
  renderContent?: (container: HTMLElement, message: string) => void;
};

const CLASSES = {
  wrapper: "copylink-dev-toast-wrapper",
  visible: "visible",
  message: "copylink-dev-toast",
};

const toastStyle = `
  :host {
    all: initial;
  }
  .${CLASSES.wrapper} {
    position: fixed;
    bottom: 24px;
    left: 24px;
    z-index: 2147483647;
    pointer-events: none;
    display: flex;
    align-items: center;
  }
  .${CLASSES.message} {
    font-family: inherit;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    border-radius: 8px;
    padding: 10px 16px;
    opacity: 0;
    transform: translate3d(0, 24px, 0);
    transition: transform 0.3s ease, opacity 0.3s ease;
    display: inline-flex;
    gap: 8px;
    align-items: center;
  }
  .${CLASSES.wrapper}.${CLASSES.visible} .${CLASSES.message} {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
`;

export const showToastCore = (
  message: string,
  document: Document,
  options?: ToastOptions,
) => {
  const wrapper = document.createElement("div");
  wrapper.className = CLASSES.wrapper;
  const shadow = wrapper.attachShadow({ mode: "open" });
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
  document.body.appendChild(wrapper);

  requestAnimationFrame(() => {
    wrapper.classList.add(CLASSES.visible);
  });

  const duration = options?.durationMs ?? 3000;
  setTimeout(() => {
    wrapper.classList.remove(CLASSES.visible);
    setTimeout(() => {
      style.remove();
      wrapper.remove();
    }, 200);
  }, duration);
};
