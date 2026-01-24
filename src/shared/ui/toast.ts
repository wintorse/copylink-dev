export type ToastDeps = {
  document: Document;
  getCssHref: () => string;
};

export const showToastCore = (message: string, deps: ToastDeps) => {
  const { document, getCssHref } = deps;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = getCssHref();
  document.head.appendChild(link);

  link.onload = () => {
    const toast = document.createElement("div");
    toast.textContent = message;
    toast.className = "copylink-dev-toast";

    toast.style.opacity = "0";
    toast.style.transform = "translate3d(0, 24px, 0)";

    document.body.appendChild(toast);

    toast.offsetHeight;

    setTimeout(() => {
      toast.style.transform = "translate3d(0, 0, 0)";
      toast.style.opacity = "1";
    }, 10);

    setTimeout(() => {
      toast.style.transform = "translate3d(0, 12px, 0)";
      toast.style.opacity = "0";
      setTimeout(() => {
        toast.remove();
      }, 310);
    }, 3000);
  };
};
