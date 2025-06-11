// constants/tiers.ts
export type UserTier = "free" | "paid" | "premium";

export const currentTier: UserTier = "free"; // change manually for now



//if tiers grow use :
// const featureAccess = {
//     submitGym: ["paid", "premium"],
//     updateGym: ["paid", "premium"],
//     favorites: ["premium"],
//     filters: ["premium"],
//     viewGyms: ["free", "paid", "premium"],
//   };

//and utility like : 
// export function hasAccess(feature: keyof typeof featureAccess) {
//     return featureAccess[feature].includes(currentTier);
//   }
  