// notifications.ts — Alertes d'expiration de carte
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function scheduleExpirationAlert(
  cardId: string,
  cardName: string,
  expiresAt: string,
  daysBefore: number = 30
): Promise<string | null> {
  try {
    const expDate = new Date(expiresAt);
    const alertDate = new Date(expDate);
    alertDate.setDate(alertDate.getDate() - daysBefore);

    if (alertDate <= new Date()) return null;

    // Annuler l'ancienne notif pour cette carte
    await cancelExpirationAlert(cardId);

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Carte bientôt expirée 🗓",
        body: `Votre carte "${cardName}" expire dans ${daysBefore} jours.`,
        data: { cardId },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: alertDate,
      },
    });

    return id;
  } catch (e) {
    console.error("scheduleExpirationAlert error:", e);
    return null;
  }
}

export async function cancelExpirationAlert(cardId: string): Promise<void> {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notif of scheduled) {
      if (notif.content.data?.cardId === cardId) {
        await Notifications.cancelScheduledNotificationAsync(notif.identifier);
      }
    }
  } catch {}
}

export async function cancelAllExpirationAlerts(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
