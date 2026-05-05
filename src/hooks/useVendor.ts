import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { createVendorLink, subscribeVendorLinks } from "../services/vendor";
import { VendorLink } from "../types";

export function useVendor() {
  const user = useAuthStore((s) => s.user);
  const [links, setLinks] = useState<VendorLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    if (!user?.uid) {
      setLinks([]);
      setIsLoading(false);
      return;
    }
    const unsub = subscribeVendorLinks(
      user.uid,
      (items) => {
        setLinks(items);
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

  const generateLink = async (payload: {
    productName: string;
    price: number;
    payIn4: boolean;
  }): Promise<VendorLink> => {
    if (!user?.uid) throw new Error("You must be logged in.");
    return createVendorLink({ ...payload, creatorId: user.uid });
  };

  const refresh = () => setRefreshTick((t) => t + 1);

  return { links, isLoading, error, generateLink, refresh };
}
