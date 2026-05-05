import { create } from "zustand";

export type GroupItem = {
  id: string;
  name: string;
  amountLabel: string;
  progress: number;
  nextPayout: string;
  members: number;
};

type GroupState = {
  myGroups: GroupItem[];
};

export const useGroupStore = create<GroupState>(() => ({
  myGroups: [
    {
      id: "1",
      name: "Lagos Freelancers Circle",
      amountLabel: "N10,000 / week",
      progress: 0.6,
      nextPayout: "Fri, 9 May",
      members: 10,
    },
    {
      id: "2",
      name: "Family Ajo",
      amountLabel: "N5,000 / week",
      progress: 0.3,
      nextPayout: "Mon, 12 May",
      members: 6,
    },
  ],
}));
