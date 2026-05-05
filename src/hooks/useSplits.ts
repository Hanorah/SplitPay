import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import {
  createSplit,
  getSplitById,
  markSplitSettled,
  markSplitParticipantPaid,
  sendSplitReminder,
  subscribeMySplits,
} from "../services/splits";
import { Split } from "../types";

export function useSplits() {
  const user = useAuthStore((s) => s.user);
  const [splits, setSplits] = useState<Split[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    if (!user?.uid) {
      setSplits([]);
      setIsLoading(false);
      return;
    }
    const unsub = subscribeMySplits(
      user.uid,
      (items) => {
        setSplits(items);
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

  const addSplit = async (payload: {
    title: string;
    totalAmount: number;
    participants: { name: string; amount: number }[];
  }): Promise<Split> => {
    if (!user?.uid) throw new Error("You must be logged in");
    return createSplit({ ...payload, creatorId: user.uid });
  };

  const findSplit = async (splitId: string) => getSplitById(splitId);

  const markPaid = async (split: Split, participantUserId: string) =>
    markSplitParticipantPaid(split, participantUserId);

  const remind = async (split: Split, participantUserId: string) => sendSplitReminder(split, participantUserId);
  const settleCash = async (split: Split, participantUserId: string) =>
    markSplitSettled(split, participantUserId);

  const refresh = () => setRefreshTick((t) => t + 1);

  return { splits, isLoading, error, addSplit, findSplit, markPaid, remind, settleCash, refresh };
}
