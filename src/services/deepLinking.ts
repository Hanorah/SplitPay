import * as Linking from "expo-linking";
import { LinkingOptions } from "@react-navigation/native";
import { RootStackParamList } from "../types";

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [Linking.createURL("/"), "https://splitpay.app"],
  config: {
    screens: {
      Onboarding: "onboarding",
      PhoneAuth: "auth/phone",
      OTP: "auth/otp",
      ProfileSetup: "auth/profile",
      MainTabs: {
        path: "app",
        screens: {
          Groups: {
            path: "groups",
            screens: {
              GroupsList: "",
              CreateGroup: "create",
              GroupDetail: ":groupId",
            },
          },
        },
      },
      CreateSplit: "split/create",
      SplitDetail: "split/:splitId",
      GenerateVendorLink: "vendor/link",
      SecuritySetup: "security",
    },
  },
};
