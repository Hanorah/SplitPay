import * as Network from "expo-network";

type QueuedAction = {
  id: string;
  run: () => Promise<void>;
};

const queue: QueuedAction[] = [];

const isConnected = async (): Promise<boolean> => {
  try {
    const network = await Network.getNetworkStateAsync();
    return Boolean(network.isConnected);
  } catch {
    return true;
  }
};

export const enqueueOfflineAction = async (run: () => Promise<void>) => {
  const connected = await isConnected();
  if (connected) {
    try {
      await run();
    } catch {
      queue.push({ id: `q-${Date.now()}-${Math.random()}`, run });
    }
    return;
  }
  queue.push({ id: `q-${Date.now()}-${Math.random()}`, run });
};

export const flushOfflineQueue = async () => {
  const connected = await isConnected();
  if (!connected || queue.length === 0) return;

  while (queue.length > 0) {
    const next = queue.shift();
    if (!next) break;
    try {
      await next.run();
    } catch {
      queue.unshift(next);
      break;
    }
  }
};

export const getOfflineQueueCount = () => queue.length;
