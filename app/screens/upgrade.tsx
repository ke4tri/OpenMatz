// app/screens/upgrade.tsx
import React, { useEffect, useState, useMemo } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, StyleSheet} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Purchases from "react-native-purchases";
import { useRouter } from "expo-router";
import { useAccess } from "../../hooks/useAccess";

const OFF_UPGRADE = process.env.EXPO_PUBLIC_RC_OFFERING_UPGRADE || "premium_upgrade";
const ENT_PRO = process.env.EXPO_PUBLIC_RC_ENTITLEMENT_PREMIUM || "premium_access";

type RCOfferings = Awaited<ReturnType<typeof Purchases.getOfferings>>;
type RCPackage =
  NonNullable<NonNullable<RCOfferings["current"]>["availablePackages"]>[number];

const getPackageById = (
  offerings: RCOfferings | null,
  offeringId: string,
  packageId: string
): RCPackage | null => {
  const off = offerings?.all?.[offeringId];
  const pkg = off?.availablePackages?.find((p: any) => p.identifier === packageId);
  return (pkg ?? null) as any;
};

export default function Upgrade() {
  const router = useRouter();
  const access = useAccess(); // hook #1

  // state hooks (always called)
  const [offerings, setOfferings] = useState<RCOfferings | null>(null); // hook #2
  const [loading, setLoading] = useState(true);                         // hook #3
  const [busy, setBusy] = useState(false);                              // hook #4

  // fetch offerings (always called)
  useEffect(() => {                                                     // hook #5
    let mounted = true;
    (async () => {
      try {
        const o = await Purchases.getOfferings();
        if (mounted) {
          setOfferings(o);
          console.log("[RC] offerings:", Object.keys(o?.all ?? {}));
          Object.entries(o?.all ?? {}).forEach(([id, off]: any) => {
            const prices = off?.availablePackages?.map(
              (p: any) => `${p.identifier} → ${p.product.identifier} (${p.product.priceString})`
            );
            console.log(`[RC] ${id}:`, prices);
          });
        }
      } catch {
        Alert.alert("Store not ready", "Could not load products yet. Try again in a moment.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // redirect side-effects (always called)
  useEffect(() => {                                                     // hook #6
    if (access.loading) return;
    if (access.isPremium) {
      router.back();
      return;
    }
    if (!access.isStandard) {
      router.replace("/screens/subscribe");
    }
  }, [access.loading, access.isPremium, access.isStandard, router]);

  // compute premium package (pure, no hooks)
  const premiumPkg = useMemo(() => {
    return (
      getPackageById(offerings, OFF_UPGRADE, "premium_full") ??
      getPackageById(offerings, OFF_UPGRADE, "premium_upgrade")
    );
  }, [offerings]);

const buy = async () => {
  if (!premiumPkg) {
    Alert.alert(
      "Unavailable",
      `No Premium package found in offering “${OFF_UPGRADE}”. Check your RevenueCat package→product mapping and that the offering is Published.`
    );
    return;
  }
  try {
    setBusy(true);
    console.log("[RC] buying package:", premiumPkg.identifier, "->", premiumPkg.product.identifier, premiumPkg.product.priceString);
    const { customerInfo } = await Purchases.purchasePackage(premiumPkg as any);
    console.log("[RC] active after buy:", Object.keys(customerInfo.entitlements.active));

    // make the gate flip immediately
    try { await access.refresh(); } catch {}

    const pro = !!customerInfo.entitlements.active[ENT_PRO];
    if (pro) {
      Alert.alert("Success", "Premium activated.");
      router.back(); // upgrade screen goes back by design
    } else {
      Alert.alert("Info", "Purchase completed but entitlement not active yet.");
    }
  } catch (e: any) {
    console.log("[RC] purchase error:", e);
    if (e?.userCancelled) return;
    Alert.alert("Purchase failed", e?.message ?? "Try again later.");
  } finally {
    setBusy(false);
  }
};


  // show spinner while loading OR while redirecting based on entitlements
  if (loading || access.loading || access.isPremium || !access.isStandard) {
    return (
      <View style={s.center}>
        <ActivityIndicator />
      </View>
    );
  }

  const goBack = () => router.back();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TouchableOpacity onPress={goBack} style={s.backBtn} accessibilityRole="button" accessibilityLabel="Go back">
        <Text style={s.backTxt}>← Back</Text>
      </TouchableOpacity>

      <View style={s.wrap}>
        <Text style={s.title}>Upgrade to Premium</Text>
        <Text style={s.subtitle}>Unlock submit/update gym tools.</Text>

        {!premiumPkg ? (
          <Text style={{ textAlign: "center" }}>
            No Premium package found in offering “{OFF_UPGRADE}”. Ensure it’s published and mapped to the Premium product.
          </Text>
        ) : (
          <TouchableOpacity style={[s.btn, busy && s.dis]} disabled={busy} onPress={buy}>
            <Text style={s.btnText}>Premium • {premiumPkg.product.priceString}</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  wrap: { flex: 1, padding: 20, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 6 },
  subtitle: { fontSize: 14, color: "#555", textAlign: "center", marginBottom: 18 },
  btn: { backgroundColor: "#007AFF", paddingVertical: 12, paddingHorizontal: 18, borderRadius: 10 },
  btnText: { color: "#fff", fontWeight: "700" },
  dis: { opacity: 0.6 },
  backBtn: { position: "absolute", left: 12, top: 8, zIndex: 10, padding: 8 },
  backTxt: { fontSize: 16, color: "#007AFF", fontWeight: "600" }
});
