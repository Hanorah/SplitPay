import { useEffect, useState } from "react";
import { contributeToGroup, createGroup, getGroupById, subscribeMyGroups } from "../services/groups";
import { useAuthStore } from "../store/authStore";
import { Group } from "../types";

export function useGroups() {
  const user = useAuthStore((s) => s.user);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    if (!user?.uid) {
      setGroups([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsub = subscribeMyGroups(
      user.uid,
      (items) => {
        setGroups(items);
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

  const addGroup = async (payload: {
    name: string;
    description: string;
    contributionAmount: number;
    frequency: "weekly" | "monthly";
  }): Promise<Group> => {
    if (!user?.uid) {
      throw new Error("You must be logged in.");
    }
    return createGroup({ ...payload, creatorId: user.uid });
  };

  const findGroup = async (groupId: string) => getGroupById(groupId);

  const contribute = async (group: Group) => {
    if (!user?.uid) throw new Error("You must be logged in.");
    await contributeToGroup(group, user.uid);
  };

  const refresh = () => setRefreshTick((t) => t + 1);

  return { groups, isLoading, error, addGroup, findGroup, contribute, refresh };
}
