export type ToastOptions = {
  durationMs?: number;
  /**
   * Customize the toast content. The provided element has the base styling applied.
   * This allows consumers (e.g., userscript) to add buttons/links next to the message.
   */
  renderContent?: (container: HTMLElement, message: string) => void;
  /**
   * Optional external CSS for reuse (e.g., extension bundle). When omitted, only minimal inline animation styles apply.
   */
  getCssHref?: () => string;
};

const CLASSES = {
  visible: "visible",
  message: "copylink-dev-toast",
};

const toastStyle = `
  .${CLASSES.message} {
    opacity: 0;
    transform: translate3d(0, 24px, 0);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }
  :host(.${CLASSES.visible}) .${CLASSES.message} {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
`;

export const showToastCore = async (
  message: string,
  document: Document,
  options?: ToastOptions,
) => {
  const host = document.createElement("div");
  const shadow = host.attachShadow({ mode: "open" });
  // Optionally load external CSS (e.g., extension bundle) before animating
  const externalCss = options?.getCssHref
    ? (() => {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = options.getCssHref();
        shadow.appendChild(link);
        return link;
      })()
    : undefined;
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

  // Ensure animation triggers after styles are ready (handles first paint with external CSS)
  const waitForStyleLoad = (link?: HTMLLinkElement) =>
    new Promise<void>((resolve) => {
      if (!link) {
        return resolve();
      }
      if (link.sheet) {
        return resolve();
      }
      link.addEventListener("load", () => resolve(), { once: true });
      link.addEventListener("error", () => resolve(), { once: true });
    });

  await waitForStyleLoad(externalCss);
  // Force layout so the initial hidden state is committed before transition starts.
  void toast.getBoundingClientRect();
  // Defer class toggle by two frames to avoid missing fade-in on first paint.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      host.classList.add(CLASSES.visible);
    });
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
