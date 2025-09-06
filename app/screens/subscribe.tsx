import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import Purchases from "react-native-purchases";
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";

const ENT_STD = process.env.EXPO_PUBLIC_RC_ENTITLEMENT_STANDARD ?? "standard_access";
const ENT_PRO  = process.env.EXPO_PUBLIC_RC_ENTITLEMENT_PREMIUM  ?? "premium_access";
const OFF_DEFAULT = process.env.EXPO_PUBLIC_RC_OFFERING_DEFAULT ?? "default";

export default function Subscribe() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [offering, setOffering] = useState<any | null>(null); // store the RC offering object
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // If you configure Purchases earlier, you can remove this.
        try {
          await Purchases.configure({ apiKey: process.env.EXPO_PUBLIC_RC_IOS_KEY! });
        } catch (e) {
        //  console.log("[Subscribe] Purchases.configure error (ok if already configured):", e);
        }

        // If already entitled, skip
        const info = await Purchases.getCustomerInfo();
        const hasPro = !!info.entitlements.active[ENT_PRO];
        const hasStd = hasPro || !!info.entitlements.active[ENT_STD];
        console.log("[Subscribe] Active entitlements:", Object.keys(info.entitlements.active), "hasStd:", hasStd);
        if (hasStd) {
          router.replace("/map");
          return;
        }

        // Load offerings
        const offs = await Purchases.getOfferings();
        const keys = Object.keys(offs.all ?? {});
        console.log("[Subscribe] offerings keys:", keys);

        let chosen =
          offs.all?.[OFF_DEFAULT]          // 1) try explicit id (e.g., "default")
          ?? offs.current                  // 2) try current offering
          ?? (keys.length ? offs.all?.[keys[0]] : null); // 3) try first available

        if (!chosen) {
          setErrorMsg(`No offering found. Check that your RC offering "${OFF_DEFAULT}" exists and has a Paywall assigned.`);
        }

        if (mounted) setOffering(chosen ?? null);
      } catch (e) {
      //  console.log("[Subscribe] init error:", e);
        setErrorMsg("Could not load products.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const onPressSubscribe = async () => {
    try {
      if (!offering) {
        Alert.alert("Unavailable", "No offering is configured yet. Please try again later.");
        return;
      }
      const result = await RevenueCatUI.presentPaywall({ offering });
       console.log("[Subscribe] presentPaywall result:", result);
      if (result === PAYWALL_RESULT.PURCHASED || result === PAYWALL_RESULT.RESTORED) {
        const updated = await Purchases.getCustomerInfo();
        const unlocked = !!updated.entitlements.active[ENT_PRO] ||
                         !!updated.entitlements.active[ENT_STD];
        if (unlocked) {
          router.replace("/map");
          return;
        }
      }
      // user cancelled or not unlocked → stay here
    } catch (e) {
       console.log("[Subscribe] presentPaywall error:", e);
    }
  };

  if (loading) {
    return (
      <View style={{ flex:1, justifyContent:"center", alignItems:"center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={{ flex:1, padding:24, justifyContent:"center", gap:16 }}>
      <Text style={{ fontSize:22, fontWeight:"700", textAlign:"center" }}>
        Subscribe to continue
      </Text>
      <Text style={{ textAlign:"center", color:"#666" }}>
        Standard: view & interact. Premium: submit/update gyms + everything in Standard.
      </Text>

      {errorMsg ? (
        <Text style={{ textAlign:"center", color:"#C00" }}>{errorMsg}</Text>
      ) : null}

      <TouchableOpacity
        onPress={onPressSubscribe}
        disabled={!offering}
        style={{
          opacity: offering ? 1 : 0.5,
          backgroundColor:"#007AFF",
          paddingVertical:14,
          borderRadius:10,
          alignItems:"center"
        }}
      >
        <Text style={{ color:"#fff", fontWeight:"700" }}>
          {offering ? "Subscribe" : "Loading products…"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.replace("/")}>
        <Text style={{ textAlign:"center", color:"#007AFF" }}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}
