const QUEUE_KEY = "notif:pending_uids";
const PROCESSING_KEY = "notif:processing_uids";
const TTL_SECONDS = 600;
import { redis } from "../../Utils/redis.js";
function isValidUid(uid) {
  return typeof uid === "string" && uid.length >= 20;
}

export async function enqueueNotification(uid) {
  try {
    if (!isValidUid(uid)) {
      console.warn("Queue: invalid UID:", uid);
      return { ok: false, code: "INVALID_UID" };
    }

    const added = await redis.sAdd(QUEUE_KEY, uid);

    console.log(
      added === 1
        ? `Queue: added ${uid}`
        : `Queue: duplicate ${uid}`
    );

    await redis.expire(QUEUE_KEY, TTL_SECONDS);

    return { ok: true };
  } catch (err) {
    console.error("Queue: enqueue error:", err?.message || err);
    return { ok: false, code: "REDIS_DOWN" };
  }
}

export async function lockQueueAndGetUids() {
  try {
    try {
      await redis.rename(QUEUE_KEY, PROCESSING_KEY);
      await redis.expire(PROCESSING_KEY, TTL_SECONDS);
      console.log("Queue: locked");
    } catch (err) {
      if (String(err.message).includes("no such key")) {
        console.log("Queue: empty or already locked");
        return [];
      }
      throw err;
    }

    const uids = await redis.sMembers(PROCESSING_KEY);

    console.log(`Queue: fetched ${uids.length}`);

    return Array.isArray(uids) ? uids : [];
  } catch (err) {
    console.error("Queue: lock error:", err?.message || err);
    return [];
  }
}

export async function clearProcessingQueue() {
  try {
    const count = await redis.sCard(PROCESSING_KEY);
    await redis.del(PROCESSING_KEY);

    console.log(`Queue: cleared ${count}`);
  } catch (err) {
    console.error("Queue: clear error:", err?.message || err);
  }
}