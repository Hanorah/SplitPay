import { useEffect, useState } from "react";
import { subscribeTransactions } from "../services/transactions";
import { useAuthStore } from "../store/authStore";
import { Transaction } from "../types";

export function useTransactions() {
  const user = useAuthStore((s) => s.user);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    if (!user?.uid) {
      setTransactions([]);
      setIsLoading(false);
      return;
    }

    const unsub = subscribeTransactions(
      user.uid,
      (items) => {
        setTransactions(items);
        setError("");
        setIsLoading(false);
      },
      (message) => {
        setError(message);
        setIsLoading(false);
      }
    );
    return unsub;
  }, [user?.uid, refreshTick]);

  const refresh = () => setRefreshTick((t) => t + 1);

  return { transactions, isLoading, error, refresh };
}
