export type ApiResponse = {
  message: string;
  success: true;
}

// Database types
export type Property = {
  id: string;
  userId: string;
  name: string;
  address: string;
  city: string;
  state: string | null;
  zipCode: string | null;
  country: string;
  propertyType: string;
  bedrooms: number | null;
  bathrooms: number | null;
  squareMeters: string | null;
  description: string | null;
  amenities: unknown;
  images: unknown;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type Renter = {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phoneNumber: string | null;
  dniNumber: string | null;
  emergencyContact: unknown;
  verificationStatus: string | null;
  notes: string | null;
  isActive: boolean | null;
  createdAt: Date;
  updatedAt: Date;
}

export type Lease = {
  id: string;
  propertyId: string;
  renterId: string;
  userId: string;
  leaseNumber: string | null;
  startDate: string;
  endDate: string;
  monthlyRent: string;
  securityDeposit: string | null;
  paymentDueDay: number;
  status: string;
  contractFile: string | null;
  terms: string | null;
  autoRenew: boolean | null;
  isActive: boolean | null;
  createdAt: Date;
  updatedAt: Date;
}
