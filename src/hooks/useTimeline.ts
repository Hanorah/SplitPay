import { useMemo } from "react";
import { useTransactions } from "./useTransactions";
import { TimelineItem } from "../types";

export function useTimeline() {
  const { transactions, isLoading, error, refresh } = useTransactions();

  const items = useMemo<TimelineItem[]>(() => {
    return transactions.map((t) => ({
      id: t.id,
      title: t.title,
      subtitle: t.subtitle,
      amount: t.amount,
      kind: t.type.startsWith("vendor") ? "vendor" : t.type.startsWith("split") ? "split" : "wallet",
      status: t.status,
      createdAt: t.createdAt,
    }));
  }, [transactions]);

  return { items, isLoading, error, refresh };
}
