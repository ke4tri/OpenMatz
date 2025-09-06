// lib/revenuecat.ts
import Purchases from "react-native-purchases";

export async function rcSwitchTo(userId: string | null) {
  try { await Purchases.logOut(); } catch {}
  await Purchases.invalidateCustomerInfoCache();

  if (userId) {
    const result = await Purchases.logIn(userId);
    console.log("[RC] logIn -> created?", result.created);
  } else {
    console.log("[RC] staying anonymous");
  }

  try { await Purchases.restorePurchases(); } catch (e) {
    console.log("[RC] restorePurchases error (ok in dev):", e);
  }

  await Purchases.invalidateCustomerInfoCache();
  const appUserID = await Purchases.getAppUserID();
  const info = await Purchases.getCustomerInfo();
  console.log("[RC] appUserID =", appUserID);
  console.log("[RC] originalAppUserId =", info.originalAppUserId);
  console.log("[RC] active entitlements:", Object.keys(info.entitlements.active));
}
