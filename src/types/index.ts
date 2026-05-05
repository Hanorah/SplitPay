import { NavigatorScreenParams } from "@react-navigation/native";

export type RootStackParamList = {
  Onboarding: undefined;
  PhoneAuth: undefined;
  OTP: { phone: string };
  ProfileSetup: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  CreateSplit: undefined;
  SplitDetail: { splitId: string };
  GenerateVendorLink: undefined;
  VendorLinks: undefined;
  SecuritySetup: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Groups: NavigatorScreenParams<GroupsStackParamList>;
  Activity: undefined;
  Profile: undefined;
};

export type GroupsStackParamList = {
  GroupsList: undefined;
  CreateGroup: undefined;
  GroupDetail: { groupId: string };
};

export type UserProfile = {
  uid: string;
  phone: string;
  name: string;
  username: string;
  avatarUri?: string;
  balance: number;
  reputationScore: number;
};

export type Group = {
  id: string;
  name: string;
  description: string;
  creatorId: string;
  contributionAmount: number;
  frequency: "weekly" | "monthly";
  status: "active" | "completed" | "cancelled";
  memberIds: string[];
  nextPayoutDate: string;
  createdAt: string;
  contributions?: { userId: string; amount: number; status: "pending" | "paid"; paidAt?: string }[];
  payouts?: { cycle: number; recipientName: string; amount: number; paidAt: string }[];
};

export type SplitParticipant = {
  userId: string;
  name: string;
  amount: number;
  status: "pending" | "paid";
  paidAt?: string;
};

export type Split = {
  id: string;
  title: string;
  totalAmount: number;
  creatorId: string;
  status: "collecting" | "completed";
  participants: SplitParticipant[];
  createdAt: string;
};

export type VendorLink = {
  id: string;
  productName: string;
  price: number;
  payIn4: boolean;
  installments: number;
  shareLink: string;
  createdAt: string;
};

export type TimelineItem = {
  id: string;
  title: string;
  subtitle: string;
  amount?: number;
  kind: "wallet" | "split" | "vendor";
  status: "pending" | "success" | "failed";
  createdAt: string;
};

export type Transaction = {
  id: string;
  userId: string;
  type:
    | "deposit"
    | "withdrawal"
    | "ajo_contribution"
    | "ajo_payout"
    | "split_payment"
    | "split_receive"
    | "vendor_sale";
  amount: number;
  status: "pending" | "success" | "failed";
  title: string;
  subtitle: string;
  createdAt: string;
};
