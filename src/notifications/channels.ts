import notifee, { AndroidImportance } from "@notifee/react-native";

/**
 * Android notification channels (req #3). Channel id must match what the
 * backend sends in the FCM data payload (`data.channelId`), else it falls
 * back to DEFAULT_CHANNEL_ID.
 */
export const CHANNELS = [
  { id: "orders", name: "Pesanan", importance: AndroidImportance.HIGH },
  { id: "approvals", name: "Persetujuan", importance: AndroidImportance.HIGH },
  { id: "general", name: "Umum", importance: AndroidImportance.DEFAULT },
] as const;

export const DEFAULT_CHANNEL_ID = "general";

/** Create all channels. Idempotent — safe to call on every boot. */
export async function ensureChannels(): Promise<void> {
  await Promise.all(
    CHANNELS.map((c) =>
      notifee.createChannel({
        id: c.id,
        name: c.name,
        importance: c.importance,
      })
    )
  );
}
