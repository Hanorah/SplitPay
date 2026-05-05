import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";
import { Transaction } from "../types";

let localTransactions: Transaction[] = [];

const localTxListeners = new Set<(items: Transaction[]) => void>();

const emit = () => {
  localTxListeners.forEach((listener) => listener(localTransactions));
};

const upsertLocal = (tx: Transaction) => {
  const idx = localTransactions.findIndex((t) => t.id === tx.id);
  if (idx >= 0) {
    const next = [...localTransactions];
    next[idx] = tx;
    localTransactions = next;
  } else {
    localTransactions = [tx, ...localTransactions];
  }
  emit();
};

const mapTransaction = (id: string, data: Record<string, unknown>): Transaction => ({
  id,
  userId: String(data.userId || ""),
  type: (data.type as Transaction["type"]) || "deposit",
  amount: Number(data.amount || 0),
  status: (data.status as Transaction["status"]) || "success",
  title: String(data.title || ""),
  subtitle: String(data.subtitle || ""),
  createdAt: String(data.createdAt || ""),
});

export const subscribeTransactions = (
  userId: string,
  onNext: (items: Transaction[]) => void,
  onError: (message: string) => void
) => {
  const pushLocal = () => {
    const filtered = [...localTransactions]
      .filter((t) => t.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    onNext(filtered);
  };
  pushLocal();
  localTxListeners.add(pushLocal);

  let remoteUnsub = () => {};
  if (isFirebaseConfigured) {
    try {
      const q = query(collection(db, "transactions"), where("userId", "==", userId), orderBy("createdAt", "desc"));
      remoteUnsub = onSnapshot(
        q,
        (snap) => {
          snap.docs.forEach((d) => upsertLocal(mapTransaction(d.id, d.data())));
        },
        () => onError("Showing locally saved transactions.")
      );
    } catch {
      onError("Showing locally saved transactions.");
    }
  }

  return () => {
    localTxListeners.delete(pushLocal);
    remoteUnsub();
  };
};

export const recordTransaction = async (payload: Omit<Transaction, "id" | "createdAt">) => {
  const tx: Transaction = {
    ...payload,
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
  };
  upsertLocal(tx);

  if (isFirebaseConfigured) {
    void (async () => {
      try {
        await addDoc(collection(db, "transactions"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      } catch {}
    })();
  }
};
