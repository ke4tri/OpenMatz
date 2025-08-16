import { useEffect, useState } from "react";
import Purchases from "react-native-purchases";

export function useEntitlements() {
  const [entitlements, setEntitlements] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetch = async () => {
      try {
        const customerInfo = await Purchases.getCustomerInfo();
        setEntitlements({
          standard: !!customerInfo.entitlements.active["standard"],
          admin: !!customerInfo.entitlements.active["admin"],
        });
      } catch (e) {
        console.error("❌ Failed to get entitlements", e);
      }
    };

    fetch();
  }, []);

  return entitlements;
}
