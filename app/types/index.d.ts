// ✅ FILE: app/types/index.d.ts

// Allows importing JSON files with type safety
declare module "*.json" {
    const value: unknown;
    export default value;
  }
  
  // Shared Gym type across the app
  export type Gym = {
    id: string;
    name: string;
    city: string;
    state: string;
    latitude: number;
    longitude: number;
    logo: string;
    openMatTimes: string[];
    address: string;
    email: string;
    phone: string;
    approved: boolean;
  };