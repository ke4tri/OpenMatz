export interface Gym {
  membershipRequired: any;
  id: string;
  name: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  logo: string;
  openMatTimes: string[];
  classTimes?: string[];
  address: string;
  email: string;
  phone: string;
  approved: boolean;

  // ✅ Add these optional metadata fields:
  submittedAt?: string;
  submittedByIP?: string;
  submittedBy?: {
    name: string;
    email: string;
    phone: string;
  };
}
