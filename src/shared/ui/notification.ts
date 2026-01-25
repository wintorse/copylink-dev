export type NotificationConfig = {
  id: string;
  title: string;
  message: string;
  iconPath: string;
  autoClearMs?: number;
};

export const buildNotificationConfig = (
  message: string,
  options?: Partial<NotificationConfig>,
): NotificationConfig => ({
  id: options?.id ?? "copylink.dev-notification",
  title: options?.title ?? "copylink.dev",
  message,
  iconPath: options?.iconPath ?? "images/icon-128.png",
  autoClearMs: options?.autoClearMs ?? 3000,
});
