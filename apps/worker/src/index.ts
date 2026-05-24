import "dotenv/config";

const intervalMs = Number(process.env.WORKER_INTERVAL_MS ?? 10000);

setInterval(() => {
  console.log(
    JSON.stringify({
      worker: "campaign-ai-worker",
      status: "heartbeat",
      timestamp: new Date().toISOString(),
    }),
  );
}, intervalMs);

console.log(`Worker started. Interval: ${intervalMs}ms`);
