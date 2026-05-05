import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp, where } from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";
import { VendorLink } from "../types";
import { recordTransaction } from "./transactions";

let localVendorLinks: VendorLink[] = [];
const localVendorListeners = new Set<(links: VendorLink[]) => void>();
const ownership = new Map<string, string>();

const emitLocalVendorLinks = () => {
  const ordered = [...localVendorLinks].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  localVendorListeners.forEach((listener) => listener(ordered));
};

const upsertLocalLink = (link: VendorLink, ownerId: string) => {
  ownership.set(link.id, ownerId);
  const idx = localVendorLinks.findIndex((l) => l.id === link.id);
  if (idx >= 0) {
    const next = [...localVendorLinks];
    next[idx] = link;
    localVendorLinks = next;
  } else {
    localVendorLinks = [link, ...localVendorLinks];
  }
  emitLocalVendorLinks();
};

const mapLink = (id: string, data: Record<string, unknown>): VendorLink => ({
  id,
  productName: String(data.productName || ""),
  price: Number(data.price || 0),
  payIn4: Boolean(data.payIn4),
  installments: Number(data.installments || 4),
  shareLink: String(data.shareLink || ""),
  createdAt: String(data.createdAt || ""),
});

export const subscribeVendorLinks = (
  userId: string,
  onNext: (links: VendorLink[]) => void,
  onError: (message: string) => void
) => {
  const pushLocal = () => {
    const visible = [...localVendorLinks]
      .filter((l) => ownership.get(l.id) === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    onNext(visible);
  };
  pushLocal();
  localVendorListeners.add(pushLocal);

  let remoteUnsub = () => {};
  if (isFirebaseConfigured) {
    try {
      const q = query(collection(db, "vendorLinks"), where("creatorId", "==", userId), orderBy("createdAt", "desc"));
      remoteUnsub = onSnapshot(
        q,
        (snap) => {
          snap.docs.forEach((d) => upsertLocalLink(mapLink(d.id, d.data()), userId));
        },
        () => onError("Showing locally saved links.")
      );
    } catch {
      onError("Showing locally saved links.");
    }
  }

  return () => {
    localVendorListeners.delete(pushLocal);
    remoteUnsub();
  };
};

export const createVendorLink = async (payload: {
  productName: string;
  price: number;
  payIn4: boolean;
  creatorId: string;
}): Promise<VendorLink> => {
  const linkId = `v-${Date.now()}`;
  const newLink: VendorLink = {
    id: linkId,
    productName: payload.productName,
    price: payload.price,
    payIn4: payload.payIn4,
    installments: payload.payIn4 ? 4 : 1,
    shareLink: `https://splitpay.app/pay/${linkId}`,
    createdAt: new Date().toISOString(),
  };

  upsertLocalLink(newLink, payload.creatorId);

  void recordTransaction({
    userId: payload.creatorId,
    type: "vendor_sale",
    amount: payload.price,
    status: "success",
    title: `Vendor link created: ${payload.productName}`,
    subtitle: payload.payIn4 ? "Pay-in-4 enabled" : "One-time payment",
  });

  if (isFirebaseConfigured) {
    void (async () => {
      try {
        await addDoc(collection(db, "vendorLinks"), {
          productName: payload.productName,
          price: payload.price,
          payIn4: payload.payIn4,
          installments: payload.payIn4 ? 4 : 1,
          creatorId: payload.creatorId,
          shareLink: newLink.shareLink,
          createdAt: serverTimestamp(),
        });
      } catch {}
    })();
  }

  return newLink;
};
