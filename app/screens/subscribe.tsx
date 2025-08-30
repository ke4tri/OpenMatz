import { useEffect, useState, useRef } from "react";
import { View, Text, Alert, ActivityIndicator, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import Purchases from "react-native-purchases";

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
  const [reason, setReason] = useState<string | null>(null); // <- why no products
  const router = useRouter();
  const configuredRef = useRef(false);

  const goBack = () => {
    // @ts-ignore (expo-router newer versions expose canGoBack)
    if (router.canGoBack?.()) router.back();
    else router.replace("/");
  };

  useEffect(() => {
    (async () => {
      try {
        Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);

        // Configure exactly once here if you don't already do it at app start
        if (!configuredRef.current) {
          configuredRef.current = true;
          await Purchases.configure({
            // Make sure this is your **iOS** public key
            apiKey: process.env.EXPO_PUBLIC_RC_IOS_KEY!,
            // appUserID: undefined, // optional: let RC manage anonymous IDs
          });
          console.log("✅ Purchases configured");
        }

        const offs = await Purchases.getOfferings();
        console.log("🧾 Offerings:", JSON.stringify(offs, null, 2));
        setOfferings(offs);

        // Explain why empty, for quick diagnosis
        if (!offs.current) setReason("No current offering set in RevenueCat.");
        else if (!offs.current.availablePackages?.length)
          setReason("Current offering has zero available packages.");
      } catch (e: any) {
        console.log("❌ getOfferings error:", e?.message || e);
        setReason(`getOfferings error: ${e?.message || String(e)}`);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 10 }}>Loading plans…</Text>
      </View>
    );
  }

  // Prefer the current offering; fall back to a named one like "default"
  const current = offerings?.current;
  const fallbackDefault = offerings?.all?.["default"];
  const hasPackages =
    (current?.availablePackages?.length ?? 0) > 0 ||
    (fallbackDefault?.availablePackages?.length ?? 0) > 0;

  if (!hasPackages) {
    return (
      <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
        <Text style={{ fontSize: 18, textAlign: "center", marginBottom: 8 }}>
          Plans are unavailable right now.
        </Text>
        <Text style={{ textAlign: "center", color: "gray" }}>
          {reason ??
            "No packages returned from the App Store. Check your iOS key, RC offering, and App Store Connect metadata."}
        </Text>
        <TouchableOpacity onPress={goBack} style={{ marginTop: 16, alignSelf: "center" }}>
          <Text style={{ color: "#007AFF" }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const std =
    getPackageById(offerings, "default", "standard") ??
    current?.availablePackages?.find((p: any) => p.identifier === "standard") ??
    null;

  const prem =
    getPackageById(offerings, "default", "premium") ??
    current?.availablePackages?.find((p: any) => p.identifier === "premium") ??
    null;

  // Render your packages/buttons—example:
  return (
    <View style={{ flex: 1, padding: 20, justifyContent: "center", gap: 16 }}>
      <Text style={{ fontSize: 22, textAlign: "center", marginBottom: 12 }}>
        Choose your plan
      </Text>

      {std && (
        <TouchableOpacity
          disabled={busy}
          onPress={async () => {
            try {
              setBusy(true);
              const { customerInfo } = await Purchases.purchasePackage(std);
              console.log("✅ Purchased standard:", customerInfo);
              // TODO: unlock access based on entitlement
              router.replace("/map");
            } catch (e: any) {
              if (!e?.userCancelled) Alert.alert("Purchase failed", e?.message || String(e));
            } finally {
              setBusy(false);
            }
          }}
          style={{ padding: 16, backgroundColor: "#eee", borderRadius: 8 }}
        >
          <Text style={{ textAlign: "center", fontSize: 16 }}>
            Standard {std.product.priceString}
          </Text>
        </TouchableOpacity>
      )}

      {prem && (
        <TouchableOpacity
          disabled={busy}
          onPress={async () => {
            try {
              setBusy(true);
              const { customerInfo } = await Purchases.purchasePackage(prem);
              console.log("✅ Purchased premium:", customerInfo);
              router.replace("/map");
            } catch (e: any) {
              if (!e?.userCancelled) Alert.alert("Purchase failed", e?.message || String(e));
            } finally {
              setBusy(false);
            }
          }}
          style={{ padding: 16, backgroundColor: "#eee", borderRadius: 8 }}
        >
          <Text style={{ textAlign: "center", fontSize: 16 }}>
            Premium {prem.product.priceString}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
