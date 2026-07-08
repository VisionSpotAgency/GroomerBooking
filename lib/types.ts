export type PackageId = "start" | "pro" | "business";

export type Salon = {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  ownerName: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  description: string;
  openingHours: Record<string, string>;
  photos: string[];
  rating: number;
  reviewCount: number;
  package: PackageId;
  depositType: "fixed" | "percent";
  depositValue: number;
  rescheduleLimitHours: number;
  requireApprovalForReschedule: boolean;
};

export type Employee = {
  id: string;
  salonId: string;
  name: string;
  role: string;
  avatar: string;
  color: string;
  active: boolean;
};

export type Service = {
  id: string;
  salonId: string;
  name: string;
  category: string;
  description: string;
  price: number;
  durationMin: number;
  depositRequired: boolean;
  depositOverride?: number;
  animalSize: "mały" | "średni" | "duży" | "każdy";
  active: boolean;
};

export type Client = {
  id: string;
  name: string;
  phone: string;
  email: string;
  address?: string;
  status: "nowy" | "stały" | "vip" | "problematyczny";
  depositExempt: boolean;
  notes: string;
  marketingConsent: boolean;
};

export type Pet = {
  id: string;
  clientId: string;
  name: string;
  species: "pies" | "kot" | "inny";
  breed: string;
  weightKg: number;
  age: number;
  photo: string;
  notes: string;
};

export type AppointmentStatus =
  | "oczekuje_na_zadatek"
  | "potwierdzona"
  | "przełożona"
  | "anulowana"
  | "zakończona"
  | "nieobecność";

export type PaymentStatus =
  | "oczekuje"
  | "opłacony"
  | "zwolniony"
  | "nieudany"
  | "zwrócony";

export type Appointment = {
  id: string;
  salonId: string;
  clientId: string;
  petId: string;
  serviceId: string;
  employeeId: string;
  date: string;
  time: string;
  durationMin: number;
  price: number;
  depositAmount: number;
  status: AppointmentStatus;
  paymentStatus: PaymentStatus;
  source: "online" | "manual";
  notes?: string;
};

export type Review = {
  id: string;
  salonId: string;
  clientId: string;
  petId: string;
  rating: number;
  text: string;
  createdAt: string;
  verified: boolean;
  public: boolean;
};

export type GroomerData = {
  salons: Salon[];
  employees: Employee[];
  services: Service[];
  clients: Client[];
  pets: Pet[];
  appointments: Appointment[];
  reviews: Review[];
};
