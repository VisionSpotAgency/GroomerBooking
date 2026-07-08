import { GroomerData } from "./types";

export const defaultData: GroomerData = {
  salons: [
    {
      id: "salon-1",
      slug: "psia-elegancja",
      name: "Psia Elegancja",
      subtitle: "Salon groomerski premium",
      ownerName: "Anna Kowalska",
      address: "ul. Wojska Polskiego 1, 60-792 Poznań",
      city: "Poznań",
      phone: "+48 500 400 300",
      email: "kontakt@psiaelegancja.pl",
      description:
        "Kameralny salon groomerski dla psów małych i średnich ras. Pracujemy spokojnie, bez pośpiechu, z naciskiem na komfort pupila i piękny efekt końcowy.",
      openingHours: {
        pon: "09:00 - 19:00",
        wt: "09:00 - 19:00",
        śr: "09:00 - 19:00",
        czw: "09:00 - 19:00",
        pt: "09:00 - 18:00",
        sob: "09:00 - 15:00",
        ndz: "Zamknięte"
      },
      photos: [
        "https://images.unsplash.com/photo-1601758175576-648226072e90?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1598134493136-7b63ebbd7b58?auto=format&fit=crop&w=900&q=80"
      ],
      rating: 4.9,
      reviewCount: 207,
      package: "pro",
      depositType: "fixed",
      depositValue: 50,
      rescheduleLimitHours: 24,
      requireApprovalForReschedule: false
    }
  ],
  employees: [
    {
      id: "emp-1",
      salonId: "salon-1",
      name: "Anna",
      role: "Groomer",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80",
      color: "gold",
      active: true
    },
    {
      id: "emp-2",
      salonId: "salon-1",
      name: "Kasia",
      role: "Groomer",
      avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=240&q=80",
      color: "rose",
      active: true
    },
    {
      id: "emp-3",
      salonId: "salon-1",
      name: "Marta",
      role: "Asystentka",
      avatar: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=240&q=80",
      color: "lilac",
      active: true
    }
  ],
  services: [
    {
      id: "srv-1",
      salonId: "salon-1",
      name: "Kąpiel + Strzyżenie",
      category: "Popularne usługi",
      description: "Kąpiel oczyszczająca, pielęgnacja sierści, strzyżenie, uszy i pazurki.",
      price: 170,
      durationMin: 90,
      depositRequired: true,
      animalSize: "każdy",
      active: true
    },
    {
      id: "srv-2",
      salonId: "salon-1",
      name: "Trymowanie",
      category: "Popularne usługi",
      description: "Trymowanie ras szorstkowłosych z kąpielą pielęgnacyjną.",
      price: 160,
      durationMin: 90,
      depositRequired: true,
      animalSize: "średni",
      active: true
    },
    {
      id: "srv-3",
      salonId: "salon-1",
      name: "Kąpiel pielęgnacyjna",
      category: "Pielęgnacja",
      description: "Kąpiel, suszenie, rozczesywanie i kosmetyka podstawowa.",
      price: 90,
      durationMin: 60,
      depositRequired: true,
      animalSize: "każdy",
      active: true
    },
    {
      id: "srv-4",
      salonId: "salon-1",
      name: "Obcinanie pazurków",
      category: "Szybkie usługi",
      description: "Szybka pielęgnacja pazurków bez kąpieli.",
      price: 20,
      durationMin: 15,
      depositRequired: false,
      animalSize: "każdy",
      active: true
    },
    {
      id: "srv-5",
      salonId: "salon-1",
      name: "Pakiet puppy pierwsza wizyta",
      category: "Pakiety",
      description: "Delikatne oswojenie szczeniaka z salonem, kąpiel, łapki, pyszczek i nagroda.",
      price: 130,
      durationMin: 75,
      depositRequired: true,
      animalSize: "mały",
      active: true
    }
  ],
  clients: [
    {
      id: "cli-1",
      name: "Magdalena Nowak",
      phone: "+48 501 100 200",
      email: "magda@example.com",
      address: "Poznań",
      status: "stały",
      depositExempt: true,
      notes: "Stała klientka. Coco boi się suszarki, robić krótkie przerwy.",
      marketingConsent: true
    },
    {
      id: "cli-2",
      name: "Tomasz Wiśniewski",
      phone: "+48 502 200 300",
      email: "tomek@example.com",
      address: "Poznań",
      status: "nowy",
      depositExempt: false,
      notes: "Rocky ma dużo podszerstka. Warto doliczyć 15 minut bufora.",
      marketingConsent: false
    },
    {
      id: "cli-3",
      name: "Julia Zielińska",
      phone: "+48 503 300 400",
      email: "julia@example.com",
      address: "Poznań",
      status: "vip",
      depositExempt: true,
      notes: "Preferuje soboty. Luna ma wrażliwą skórę.",
      marketingConsent: true
    }
  ],
  pets: [
    {
      id: "pet-1",
      clientId: "cli-1",
      name: "Coco",
      species: "pies",
      breed: "Maltańczyk",
      weightKg: 4.8,
      age: 3,
      photo: "https://images.unsplash.com/photo-1601979031925-424e53b6caaa?auto=format&fit=crop&w=400&q=80",
      notes: "Lubi przysmaki, boi się suszarki. Strzyżenie na 9 mm."
    },
    {
      id: "pet-2",
      clientId: "cli-2",
      name: "Rocky",
      species: "pies",
      breed: "Cavapoo",
      weightKg: 8.1,
      age: 2,
      photo: "https://images.unsplash.com/photo-1591769225440-811ad7d6eab3?auto=format&fit=crop&w=400&q=80",
      notes: "Wymaga rozczesywania. Dobry kontakt z groomerem."
    },
    {
      id: "pet-3",
      clientId: "cli-3",
      name: "Luna",
      species: "pies",
      breed: "Pudel toy",
      weightKg: 3.7,
      age: 5,
      photo: "https://images.unsplash.com/photo-1588943211346-0908a1fb0b01?auto=format&fit=crop&w=400&q=80",
      notes: "Skóra wrażliwa. Używać hipoalergicznego szamponu."
    }
  ],
  appointments: [
    {
      id: "apt-1",
      salonId: "salon-1",
      clientId: "cli-1",
      petId: "pet-1",
      serviceId: "srv-1",
      employeeId: "emp-1",
      date: "2026-07-10",
      time: "09:00",
      durationMin: 90,
      price: 170,
      depositAmount: 0,
      status: "potwierdzona",
      paymentStatus: "zwolniony",
      source: "manual",
      notes: "Klientka zwolniona z zadatku."
    },
    {
      id: "apt-2",
      salonId: "salon-1",
      clientId: "cli-2",
      petId: "pet-2",
      serviceId: "srv-2",
      employeeId: "emp-2",
      date: "2026-07-10",
      time: "10:00",
      durationMin: 90,
      price: 160,
      depositAmount: 50,
      status: "potwierdzona",
      paymentStatus: "opłacony",
      source: "online"
    },
    {
      id: "apt-3",
      salonId: "salon-1",
      clientId: "cli-3",
      petId: "pet-3",
      serviceId: "srv-3",
      employeeId: "emp-3",
      date: "2026-07-11",
      time: "12:30",
      durationMin: 60,
      price: 90,
      depositAmount: 0,
      status: "potwierdzona",
      paymentStatus: "zwolniony",
      source: "online"
    },
    {
      id: "apt-4",
      salonId: "salon-1",
      clientId: "cli-1",
      petId: "pet-1",
      serviceId: "srv-4",
      employeeId: "emp-1",
      date: "2026-07-12",
      time: "13:00",
      durationMin: 15,
      price: 20,
      depositAmount: 0,
      status: "zakończona",
      paymentStatus: "zwolniony",
      source: "manual"
    }
  ],
  reviews: [
    {
      id: "rev-1",
      salonId: "salon-1",
      clientId: "cli-1",
      petId: "pet-1",
      rating: 5,
      text: "Coco wygląda przepięknie. Bardzo spokojne podejście i świetny efekt.",
      createdAt: "2026-07-02",
      verified: true,
      public: true
    },
    {
      id: "rev-2",
      salonId: "salon-1",
      clientId: "cli-2",
      petId: "pet-2",
      rating: 5,
      text: "Rocky wrócił pachnący i zadowolony. Rezerwacja online jest bardzo wygodna.",
      createdAt: "2026-07-03",
      verified: true,
      public: true
    },
    {
      id: "rev-3",
      salonId: "salon-1",
      clientId: "cli-3",
      petId: "pet-3",
      rating: 4,
      text: "Bardzo dobry salon. Doceniam przypomnienia i możliwość zmiany terminu.",
      createdAt: "2026-07-04",
      verified: true,
      public: true
    }
  ]
};
