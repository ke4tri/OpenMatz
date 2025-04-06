export interface Gym {
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
  }
  
  // Add this
  export type GymForm = Omit<Gym, "latitude" | "longitude" | "openMatTimes"> & {
    latitude: string;
    longitude: string;
    openMatTimes: string | string[];
  };
  