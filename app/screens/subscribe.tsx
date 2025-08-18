// app/screens/subscribe.tsx
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Purchases from "react-native-purchases";
import { useRouter } from "expo-router";
import { useAccess } from "../../hooks/useAccess";


const OFF_DEFAULT = process.env.EXPO_PUBLIC_RC_OFFERING_DEFAULT || "default";
const OFF_UPGRADE = process.env.EXPO_PUBLIC_RC_OFFERING_UPGRADE || "premium_upgrade";
const ENT_STD = process.env.EXPO_PUBLIC_RC_ENTITLEMENT_STANDARD || "standard_access";
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

export default function Subscribe() {
  const [offerings, setOfferings] = useState<RCOfferings | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const access = useAccess(); // hook to check access state

  const goBack = () => {
    // @ts-ignore (expo-router newer versions expose canGoBack)
    if (router.canGoBack?.()) router.back();
    else router.replace("/");
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const o = await Purchases.getOfferings();
        if (mounted) {
          setOfferings(o);
          console.log("[RC] offerings:", Object.keys(o?.all ?? {}));
          // log packages & prices to verify you’re showing the right SKU
          Object.entries(o?.all ?? {}).forEach(([id, off]: any) => {
            const prices = off?.availablePackages?.map(
              (p: any) => `${p.identifier} → ${p.product.identifier} (${p.product.priceString})`
            );
            console.log(`[RC] ${id}:`, prices);
          });
        }
      } catch {
        Alert.alert("Error", "Could not load products.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // pick explicit packages by RC package identifiers
  const stdPkg = getPackageById(offerings, OFF_DEFAULT, "standard");
  const premiumPkg =
    getPackageById(offerings, OFF_DEFAULT, "premium_full") ??
    getPackageById(offerings, OFF_UPGRADE, "premium_full") ??
    getPackageById(offerings, OFF_UPGRADE, "premium_upgrade");

const buy = async (pkg?: RCPackage) => {
  if (!pkg) {
    Alert.alert("Unavailable", "This product isn't available yet. Try again shortly.");
    return;
  }
  try {
    setBusy(true);
    const { customerInfo } = await Purchases.purchasePackage(pkg as any);
    console.log("[RC] active after buy:", Object.keys(customerInfo.entitlements.active));

    // make the gate flip immediately
    try { await access.refresh(); } catch {}

    const gotPro = !!customerInfo.entitlements.active[ENT_PRO];
    const gotStd = gotPro || !!customerInfo.entitlements.active[ENT_STD];

    if (gotStd) {
      Alert.alert("Success", gotPro ? "Premium activated." : "Standard activated.");
      router.replace("/");
    } else {
      Alert.alert("Info", "Purchase completed but entitlement not active yet.");
    }
  } catch (e: any) {
    if (e?.userCancelled) return;
    Alert.alert("Purchase failed", e?.message ?? "Try again later.");
  } finally {
    setBusy(false);
  }
};


  if (loading) return <View style={s.center}><ActivityIndicator /></View>;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Back button at the top */}
      <TouchableOpacity onPress={goBack} style={s.backBtn} accessibilityRole="button" accessibilityLabel="Go back">
        <Text style={s.backTxt}>← Back</Text>
      </TouchableOpacity>

      <View style={s.wrap}>
        <Text style={s.title}>Choose your plan</Text>
        <Text style={s.subtitle}>Standard = view & interact. Premium = submit/update + all Standard.</Text>

        {stdPkg ? (
          <TouchableOpacity style={[s.btn, busy && s.dis]} disabled={busy} onPress={() => buy(stdPkg)}>
            <Text style={s.btnText}>Standard • {stdPkg.product.priceString}</Text>
          </TouchableOpacity>
        ) : (
          <Text style={{ marginTop: 8 }}>Standard package unavailable.</Text>
        )}

        {premiumPkg ? (
          <TouchableOpacity style={[s.btnOutline, busy && s.dis]} disabled={busy} onPress={() => buy(premiumPkg)}>
            <Text style={s.btnTextOutline}>Premium • {premiumPkg.product.priceString}</Text>
          </TouchableOpacity>
        ) : (
          <Text style={{ marginTop: 8 }}>Premium package unavailable.</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  center:{flex:1,alignItems:"center",justifyContent:"center"},
  wrap:{flex:1,padding:20,alignItems:"center",justifyContent:"center"},
  title:{fontSize:24,fontWeight:"700",marginBottom:6},
  subtitle:{fontSize:14,color:"#555",textAlign:"center",marginBottom:18},
  btn:{backgroundColor:"#007AFF",paddingVertical:12,paddingHorizontal:18,borderRadius:10,marginBottom:10},
  btnText:{color:"#fff",fontWeight:"700"},
  btnOutline:{borderWidth:2,borderColor:"#007AFF",paddingVertical:12,paddingHorizontal:18,borderRadius:10},
  btnTextOutline:{color:"#007AFF",fontWeight:"700"},
  dis:{opacity:0.6},
  backBtn:{position:"absolute",left:12,top:8,zIndex:10,padding:8},
  backTxt:{fontSize:16,color:"#007AFF",fontWeight:"600"}
});
