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
import { Group } from "../types";
import { scheduleContributionNotification, scheduleDueDateNotification } from "./notifications";
import { recordTransaction } from "./transactions";

let localGroups: Group[] = [];
const localGroupListeners = new Set<(groups: Group[]) => void>();

const emitLocalGroups = () => {
  const ordered = [...localGroups].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  localGroupListeners.forEach((listener) => listener(ordered));
};

const upsertLocalGroup = (group: Group) => {
  const idx = localGroups.findIndex((g) => g.id === group.id);
  if (idx >= 0) {
    const next = [...localGroups];
    next[idx] = group;
    localGroups = next;
  } else {
    localGroups = [group, ...localGroups];
  }
  emitLocalGroups();
};

const mapGroup = (id: string, data: Record<string, unknown>): Group => ({
  id,
  name: String(data.name || ""),
  description: String(data.description || ""),
  creatorId: String(data.creatorId || ""),
  contributionAmount: Number(data.contributionAmount || 0),
  frequency: (data.frequency as Group["frequency"]) || "weekly",
  status: (data.status as Group["status"]) || "active",
  memberIds: Array.isArray(data.memberIds) ? (data.memberIds as string[]) : [],
  nextPayoutDate: String(data.nextPayoutDate || ""),
  createdAt: String(data.createdAt || ""),
  contributions: Array.isArray(data.contributions) ? (data.contributions as Group["contributions"]) : [],
  payouts: Array.isArray(data.payouts) ? (data.payouts as Group["payouts"]) : [],
});

export const subscribeMyGroups = (
  userId: string,
  onNext: (groups: Group[]) => void,
  onError: (message: string) => void
) => {
  const visible = () =>
    [...localGroups].filter((g) => g.memberIds.includes(userId)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const pushLocal = () => onNext(visible());
  pushLocal();
  localGroupListeners.add(pushLocal);

  let remoteUnsubscribe = () => {};
  if (isFirebaseConfigured) {
    try {
      const groupsRef = collection(db, "groups");
      const q = query(groupsRef, where("memberIds", "array-contains", userId), orderBy("createdAt", "desc"));
      remoteUnsubscribe = onSnapshot(
        q,
        (snapshot) => {
          snapshot.docs.forEach((d) => upsertLocalGroup(mapGroup(d.id, d.data())));
        },
        () => {
          onError("Showing locally saved groups.");
        }
      );
    } catch {
      onError("Showing locally saved groups.");
    }
  }

  return () => {
    localGroupListeners.delete(pushLocal);
    remoteUnsubscribe();
  };
};

export const createGroup = async (payload: {
  name: string;
  description: string;
  contributionAmount: number;
  frequency: "weekly" | "monthly";
  creatorId: string;
}): Promise<Group> => {
  const now = new Date();
  const localId = `g-${now.getTime()}`;
  const group: Group = {
    id: localId,
    name: payload.name,
    description: payload.description,
    creatorId: payload.creatorId,
    contributionAmount: payload.contributionAmount,
    frequency: payload.frequency,
    status: "active",
    memberIds: [payload.creatorId],
    nextPayoutDate: new Date(now.getTime() + 7 * 86400000).toISOString().slice(0, 10),
    createdAt: now.toISOString(),
    contributions: [{ userId: payload.creatorId, amount: payload.contributionAmount, status: "pending" }],
    payouts: [],
  };

  upsertLocalGroup(group);

  void recordTransaction({
    userId: payload.creatorId,
    type: "ajo_contribution",
    amount: 0,
    status: "pending",
    title: `Group created: ${payload.name}`,
    subtitle: `${payload.frequency} contribution group`,
  });

  if (isFirebaseConfigured) {
    void (async () => {
      try {
        await addDoc(collection(db, "groups"), {
          name: payload.name,
          description: payload.description,
          contributionAmount: payload.contributionAmount,
          frequency: payload.frequency,
          status: "active",
          creatorId: payload.creatorId,
          memberIds: [payload.creatorId],
          nextPayoutDate: group.nextPayoutDate,
          contributions: group.contributions,
          payouts: [],
          createdAt: serverTimestamp(),
        });
      } catch {}
    })();
  }

  return group;
};

export const getGroupById = async (groupId: string): Promise<Group | null> => {
  const local = localGroups.find((g) => g.id === groupId);
  if (local) return local;
  if (!isFirebaseConfigured) return null;
  try {
    const snap = await getDoc(doc(db, "groups", groupId));
    if (!snap.exists()) return null;
    const mapped = mapGroup(snap.id, snap.data() as Record<string, unknown>);
    upsertLocalGroup(mapped);
    return mapped;
  } catch {
    return null;
  }
};

export const contributeToGroup = async (group: Group, userId: string) => {
  await scheduleContributionNotification(group.name);
  await scheduleDueDateNotification(
    "Next contribution cycle",
    `Next ${group.name} contribution is coming up.`,
    new Date(Date.now() + 7 * 86400000)
  );
  const contributions = (group.contributions || []).map((c) =>
    c.userId === userId ? { ...c, status: "paid" as const, paidAt: new Date().toISOString() } : c
  );

  upsertLocalGroup({ ...group, contributions });

  if (isFirebaseConfigured && !group.id.startsWith("g-") && !group.id.startsWith("fallback-")) {
    void (async () => {
      try {
        await updateDoc(doc(db, "groups", group.id), { contributions });
      } catch {}
    })();
  }

  await recordTransaction({
    userId,
    type: "ajo_contribution",
    amount: -Math.abs(group.contributionAmount),
    status: "success",
    title: `Contribution: ${group.name}`,
    subtitle: "Cycle contribution paid",
  });
};
