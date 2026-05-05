import { create } from "zustand";
import { recordTransaction } from "../services/transactions";

export type ActivityItem = {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  createdAt: string;
};

type WalletState = {
  balance: number;
  activities: ActivityItem[];
  deposit: (amountInKobo: number, userId: string) => void;
  withdraw: (amountInKobo: number, userId: string) => void;
  simulatePayment: (amountInKobo: number, userId: string, note?: string) => void;
};

export const useWalletStore = create<WalletState>((set) => ({
  balance: 2450000,
  activities: [
    {
      id: "1",
      title: "Ajo contribution",
      subtitle: "Lagos Freelancers Circle",
      amount: -100000,
      createdAt: "2h ago",
    },
    {
      id: "2",
      title: "Split received",
      subtitle: "Dinner reimbursement",
      amount: 18000,
      createdAt: "Yesterday",
    },
  ],
  deposit: (amountInKobo, userId) =>
    set((state) => {
      void recordTransaction({
        userId,
        type: "deposit",
        amount: amountInKobo,
        status: "success",
        title: "Wallet deposit",
        subtitle: "Card top-up",
      });
      return {
        balance: state.balance + amountInKobo,
        activities: [
          {
            id: `dep-${Date.now()}`,
            title: "Wallet deposit",
            subtitle: "Card top-up",
            amount: amountInKobo,
            createdAt: "Just now",
          },
          ...state.activities,
        ],
      };
    }),
  withdraw: (amountInKobo, userId) =>
    set((state) => {
      void recordTransaction({
        userId,
        type: "withdrawal",
        amount: -amountInKobo,
        status: "success",
        title: "Wallet withdrawal",
        subtitle: "Bank transfer",
      });
      return {
        balance: Math.max(0, state.balance - amountInKobo),
        activities: [
          {
            id: `wd-${Date.now()}`,
            title: "Wallet withdrawal",
            subtitle: "Bank transfer",
            amount: -amountInKobo,
            createdAt: "Just now",
          },
          ...state.activities,
        ],
      };
    }),
  simulatePayment: (amountInKobo, userId, note) =>
    set((state) => {
      const safeAmount = Math.max(0, amountInKobo);
      void recordTransaction({
        userId,
        type: "split_payment",
        amount: -safeAmount,
        status: "success",
        title: "Payment completed",
        subtitle: note?.trim() || "Simulated checkout payment",
      });
      return {
        balance: Math.max(0, state.balance - safeAmount),
        activities: [
          {
            id: `pay-${Date.now()}`,
            title: "Payment completed",
            subtitle: note?.trim() || "Simulated checkout payment",
            amount: -safeAmount,
            createdAt: "Just now",
          },
          ...state.activities,
        ],
      };
    }),
}));
