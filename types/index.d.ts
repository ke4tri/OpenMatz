export interface Gym {
  id: string;
  name: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  logo: string;
  openMatTimes: string[];
  classTimes?: string[]; // ✅ Add this line
  address: string;
  email: string;
  phone: string;
  approved: boolean;
}

// Add this
export type GymForm = Omit<Gym, "latitude" | "longitude" | "openMatTimes" | "classTimes"> & {
  latitude: string;
  longitude: string;
  openMatTimes: string | string[];
  classTimes?: string | string[]; // ✅ Add this line too
};
