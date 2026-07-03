import {
  subscribeTokenWithBackend,
  subscribeTopic,
  unsubscribeTokenWithBackend,
  unsubscribeTopic,
} from "@/services/push.services";
import { useAuthStore } from "@/stores/auth.store";

/** Topics every authenticated sales user gets. TODO: confirm taxonomy + add
 *  role/region topics from the user object once backend defines them. */
export const DEFAULT_TOPICS = ["sales"];

/** Shared defaults + the per-user topic from login (e.g. "SLS0016"). */
export function currentTopics(): string[] {
  const topic = useAuthStore.getState().user?.topic;
  return topic ? [...DEFAULT_TOPICS, topic] : DEFAULT_TOPICS;
}

/** Subscribe every topic both locally (device FCM) and on the backend. */
export async function subscribeAllTopics(topics = currentTopics()): Promise<void> {
  await Promise.all(
    topics.flatMap((t) => [
      subscribeTopic(t), // local device FCM subscription
      subscribeTokenWithBackend(t).catch(() => {}), // backend mapping
    ])
  );
}

/** Unsubscribe every topic both locally and on the backend. Call BEFORE the
 *  auth store clears — the backend service reads the token from the store. */
export async function unsubscribeAllTopics(topics = currentTopics()): Promise<void> {
  await Promise.all(
    topics.flatMap((t) => [
      unsubscribeTopic(t), // local device FCM unsubscription
      unsubscribeTokenWithBackend(t).catch(() => {}), // backend mapping
    ])
  );
}
