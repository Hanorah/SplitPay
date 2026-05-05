import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";
import { Split } from "../types";
import { scheduleDueDateNotification, scheduleSplitReminderNotification } from "./notifications";
import { recordTransaction } from "./transactions";

let localSplits: Split[] = [];
const localListeners = new Set<(splits: Split[]) => void>();

const emitLocalSplits = () => {
  const ordered = [...localSplits].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  localListeners.forEach((listener) => listener(ordered));
};

const upsertLocalSplit = (split: Split) => {
  const idx = localSplits.findIndex((s) => s.id === split.id);
  if (idx >= 0) {
    const next = [...localSplits];
    next[idx] = split;
    localSplits = next;
  } else {
    localSplits = [split, ...localSplits];
  }
  emitLocalSplits();
};

const toSplit = (id: string, data: Record<string, unknown>): Split => ({
  id,
  title: String(data.title || ""),
  totalAmount: Number(data.totalAmount || 0),
  creatorId: String(data.creatorId || ""),
  status: (data.status as Split["status"]) || "collecting",
  participants: Array.isArray(data.participants) ? (data.participants as Split["participants"]) : [],
  createdAt: String(data.createdAt || ""),
});

const buildParticipants = (payload: {
  creatorId: string;
  participants: { name: string; amount: number }[];
}) =>
  payload.participants.map((p, i) => ({
    userId: i === 0 ? payload.creatorId : `guest-${i}-${Date.now()}`,
    name: p.name,
    amount: p.amount,
    status: (i === 0 ? "paid" : "pending") as "paid" | "pending",
  }));

export const subscribeMySplits = (
  userId: string,
  onNext: (splits: Split[]) => void,
  onError: (message: string) => void
) => {
  const pushLocal = () => {
    const visible = [...localSplits]
      .filter((s) => s.creatorId === userId || s.participants.some((p) => p.userId === userId))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    onNext(visible);
  };
  pushLocal();
  localListeners.add(pushLocal);

  let remoteUnsubscribe = () => {};
  if (isFirebaseConfigured) {
    try {
      const ref = collection(db, "splits");
      const q = query(ref, where("participantIds", "array-contains", userId), orderBy("createdAt", "desc"));
      remoteUnsubscribe = onSnapshot(
        q,
        (snap) => {
          snap.docs.forEach((d) => upsertLocalSplit(toSplit(d.id, d.data())));
        },
        () => onError("Showing locally saved splits.")
      );
    } catch {
      onError("Showing locally saved splits.");
    }
  }

  return () => {
    localListeners.delete(pushLocal);
    remoteUnsubscribe();
  };
};

export const createSplit = async (payload: {
  title: string;
  totalAmount: number;
  creatorId: string;
  participants: { name: string; amount: number }[];
}): Promise<Split> => {
  const split: Split = {
    id: `split-${Date.now()}`,
    title: payload.title,
    totalAmount: payload.totalAmount,
    creatorId: payload.creatorId,
    status: "collecting",
    participants: buildParticipants(payload),
    createdAt: new Date().toISOString(),
  };

  upsertLocalSplit(split);

  void recordTransaction({
    userId: payload.creatorId,
    type: "split_receive",
    amount: payload.totalAmount,
    status: "success",
    title: `Split created: ${payload.title}`,
    subtitle: `${payload.participants.length} participants`,
  });

  if (isFirebaseConfigured) {
    void (async () => {
      try {
        const participantIds = split.participants.map((p) => p.userId);
        await addDoc(collection(db, "splits"), {
          title: split.title,
          totalAmount: split.totalAmount,
          creatorId: split.creatorId,
          status: "collecting",
          participants: split.participants,
          participantIds,
          createdAt: serverTimestamp(),
        });
      } catch {}
    })();
  }

  return split;
};

export const getSplitById = async (splitId: string): Promise<Split | null> => {
  const local = localSplits.find((s) => s.id === splitId);
  if (local) return local;
  if (!isFirebaseConfigured) return null;
  try {
    const snap = await getDoc(doc(db, "splits", splitId));
    if (!snap.exists()) return null;
    const mapped = toSplit(snap.id, snap.data() as Record<string, unknown>);
    upsertLocalSplit(mapped);
    return mapped;
  } catch {
    return null;
  }
};

export const markSplitParticipantPaid = async (split: Split, userId: string) => {
  const participants = split.participants.map((p) =>
    p.userId === userId ? { ...p, status: "paid" as const, paidAt: new Date().toISOString() } : p
  );
  const status = participants.every((p) => p.status === "paid") ? "completed" : "collecting";

  upsertLocalSplit({ ...split, participants, status });

  if (isFirebaseConfigured && !split.id.startsWith("split-")) {
    void (async () => {
      try {
        await updateDoc(doc(db, "splits", split.id), { participants, status });
      } catch {}
    })();
  }

  await recordTransaction({
    userId,
    type: "split_payment",
    amount: -Math.abs(split.participants.find((p) => p.userId === userId)?.amount || 0),
    status: "success",
    title: `Split settled: ${split.title}`,
    subtitle: "Marked as paid",
  });
};

export const sendSplitReminder = async (split: Split, userId: string) => {
  const person = split.participants.find((p) => p.userId === userId);
  await scheduleSplitReminderNotification(
    "SplitPay reminder sent",
    person ? `Reminder sent to ${person.name} for ${split.title}.` : `Reminder sent for ${split.title}.`
  );
  await recordTransaction({
    userId: split.creatorId,
    type: "split_receive",
    amount: 0,
    status: "success",
    title: `Reminder sent for ${split.title}`,
    subtitle: person ? `Reminder sent to ${person.name}` : "Reminder sent",
  });
  await scheduleDueDateNotification(
    "Split follow-up",
    `Reminder follow-up for ${split.title} is scheduled.`,
    new Date(Date.now() + 24 * 60 * 60 * 1000)
  );
};

export const markSplitSettled = async (split: Split, userId: string) => {
  await markSplitParticipantPaid(split, userId);
};
