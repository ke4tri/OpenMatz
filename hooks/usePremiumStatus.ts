// hooks/usePremiumStatus.ts
import { useAccess } from "./useAccess";

// Keep submit.tsx unchanged: it still uses usePremiumStatus,
// but under the hood this listens to RevenueCat updates
// and flips isPremium immediately after a purchase/restore.
export function usePremiumStatus() {
  const a = useAccess();
  return {
    loading: a.loading,
    isPremium: a.isPremium,
    // Optional extras if you want them later:
    isStandard: a.isStandard,
    refresh: a.refresh,
  };
}
