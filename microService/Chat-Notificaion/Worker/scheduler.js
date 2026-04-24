import { processNotifications } from "./notification.worker.js";

const INTERVAL_MS = 10 * 60 * 1000;

let running = false;
let intervalRef = null;

export function startNotificationScheduler() {
  if (intervalRef) {
    console.warn("Scheduler: already running");
    return;
  }

  console.log(`Scheduler: started (interval ${INTERVAL_MS / 1000}s)`);

  intervalRef = setInterval(async () => {
    if (running) {
      console.warn("Scheduler: previous run still in progress, skipping");
      return;
    }

    running = true;
    const startTime = Date.now();

    console.log("Scheduler: triggering worker");

    try {
      await processNotifications();
    } catch (err) {
      console.error("Scheduler: worker error:", err?.message || err);
    } finally {
      const duration = Date.now() - startTime;
      console.log(`Scheduler: completed in ${duration}ms`);
      running = false;
    }
  }, INTERVAL_MS);
}

export function stopNotificationScheduler() {
  if (intervalRef) {
    clearInterval(intervalRef);
    intervalRef = null;
    console.log("Scheduler: stopped");
  }
}