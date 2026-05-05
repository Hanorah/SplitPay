import { useEffect } from "react";
import { flushOfflineQueue } from "../services/offlineQueue";

export function useOfflineSync() {
  useEffect(() => {
    void flushOfflineQueue();
    const timer = setInterval(() => {
      void flushOfflineQueue();
    }, 12000);
    return () => clearInterval(timer);
  }, []);
}
