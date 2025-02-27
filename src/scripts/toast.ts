/**
 * Displays a toast message on the bottom left of the screen.
 *
 * @param {string} message
 */
export function showToast(message: string) {
  // load CSS file for toast
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = chrome.runtime.getURL("../styles/toast.css");
  document.head.appendChild(link);

  // Wait for the CSS to load
  link.onload = () => {
    const toast = document.createElement("div");
    toast.textContent = message;
    toast.className = "copylink-dev-toast";

    // Set initial styles
    toast.style.opacity = "0";
    toast.style.transform = "translate3d(0, 24px, 0)";

    document.body.appendChild(toast);

    // Force reflow
    toast.offsetHeight;

    // slide in and fade in
    setTimeout(() => {
      toast.style.transform = "translate3d(0, 0, 0)";
      toast.style.opacity = "1";
    }, 10);

    // slide out and fade out
    setTimeout(() => {
      toast.style.transform = "translate3d(0, 12px, 0)";
      toast.style.opacity = "0";
      setTimeout(() => {
        toast.remove();
      }, 310);
    }, 3000);
  };
}
