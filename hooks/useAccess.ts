// hooks/useAccess.ts
import { useEffect, useState, useCallback } from "react";
import Purchases, { CustomerInfo } from "react-native-purchases";

const ENT_STD = process.env.EXPO_PUBLIC_RC_ENTITLEMENT_STANDARD || "standard_access";
const ENT_PRO  = process.env.EXPO_PUBLIC_RC_ENTITLEMENT_PREMIUM  || "premium_access";

type AccessState = {
  loading: boolean;
  isStandard: boolean;
  isPremium: boolean;
  hasAnyAccess: boolean;
  customerInfo: CustomerInfo | null;
};

export function useAccess() {
  const [state, setState] = useState<AccessState>({
    loading: true,
    isStandard: false,
    isPremium: false,
    hasAnyAccess: false,
    customerInfo: null,
  });

  const compute = useCallback((info: CustomerInfo | null) => {
    const active = info?.entitlements?.active ?? {};
    const isPremium = !!active[ENT_PRO];
    const isStandard = isPremium || !!active[ENT_STD];
    const hasAnyAccess = isPremium || isStandard;
    console.log("🧪 entitlements.active:", Object.keys(active));
    setState({
      loading: false,
      isStandard,
      isPremium,
      hasAnyAccess,
      customerInfo: info ?? null,
    });
  }, []);

  const refresh = useCallback(async () => {
    try {
      // force network
      // @ts-ignore available at runtime on recent SDKs
      Purchases.invalidateCustomerInfoCache?.();
      const info = await Purchases.getCustomerInfo();
      compute(info);
    } catch (e) {
      console.warn("[useAccess] refresh failed:", e);
      setState((s) => ({ ...s, loading: false }));
    }
  }, [compute]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const info = await Purchases.getCustomerInfo();
        if (mounted) compute(info);
      } catch {
        if (mounted) setState((s) => ({ ...s, loading: false }));
      }
    })();

    // attach listener (returns void in SDK 5.x)
    const listener = (info: CustomerInfo) => {
      if (mounted) compute(info);
    };
    Purchases.addCustomerInfoUpdateListener(listener);

    return () => {
      mounted = false;
      // remove if available; optional-chained for older SDKs
      // @ts-ignore TS doesn't know this exists on all versions
      Purchases.removeCustomerInfoUpdateListener?.(listener);
    };
  }, [compute]);

  return {
    loading: state.loading,
    isStandard: state.isStandard,
    isPremium: state.isPremium,
    hasAnyAccess: state.hasAnyAccess,
    customerInfo: state.customerInfo,
    refresh,
  };
}
