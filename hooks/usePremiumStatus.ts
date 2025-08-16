// hooks/usePremiumStatus.ts
import { useEffect, useState } from "react";
import Purchases from "react-native-purchases";

export function usePremiumStatus() {
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkEntitlements = async () => {
      try {
        const customerInfo = await Purchases.getCustomerInfo();
        const active = customerInfo.entitlements.active;
        setIsPremium(!!active["premium"]);
      } catch (e) {
        console.warn("RevenueCat entitlement check failed:", e);
      } finally {
        setLoading(false);
      }
    };

    checkEntitlements();
  }, []);

  return { isPremium, loading };
}
