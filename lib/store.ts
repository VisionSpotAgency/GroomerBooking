"use client";

import { useEffect, useMemo, useState } from "react";
import { defaultData } from "./mockData";
import {
  Appointment,
  Client,
  Employee,
  GroomerData,
  Pet,
  Review,
  Salon,
  Service
} from "./types";

const STORAGE_KEY = "groomerbooking-prototype-data-v1";

function cloneDefaultData(): GroomerData {
  return JSON.parse(JSON.stringify(defaultData)) as GroomerData;
}

function readData(): GroomerData {
  if (typeof window === "undefined") return cloneDefaultData();
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return cloneDefaultData();
  try {
    return JSON.parse(raw) as GroomerData;
  } catch {
    return cloneDefaultData();
  }
}

function persist(data: GroomerData) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
}

export function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36)}`;
}

export function useGroomerStore() {
  const [data, setData] = useState<GroomerData>(() => cloneDefaultData());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const next = readData();
    setData(next);
    setReady(true);
  }, []);

  const update = (updater: (current: GroomerData) => GroomerData) => {
    setData((current) => {
      const next = updater(current);
      persist(next);
      return next;
    });
  };

  const api = useMemo(
    () => ({
      data,
      ready,
      reset: () => {
        const fresh = cloneDefaultData();
        persist(fresh);
        setData(fresh);
      },
      updateSalon: (salon: Salon) =>
        update((current) => ({
          ...current,
          salons: current.salons.map((item) => (item.id === salon.id ? salon : item))
        })),
      addService: (service: Omit<Service, "id">) =>
        update((current) => ({
          ...current,
          services: [{ ...service, id: uid("srv") }, ...current.services]
        })),
      updateService: (service: Service) =>
        update((current) => ({
          ...current,
          services: current.services.map((item) => (item.id === service.id ? service : item))
        })),
      deleteService: (serviceId: string) =>
        update((current) => ({
          ...current,
          services: current.services.filter((item) => item.id !== serviceId)
        })),
      addClient: (client: Omit<Client, "id">) => {
        const id = uid("cli");
        update((current) => ({ ...current, clients: [{ ...client, id }, ...current.clients] }));
        return id;
      },
      updateClient: (client: Client) =>
        update((current) => ({
          ...current,
          clients: current.clients.map((item) => (item.id === client.id ? client : item))
        })),
      addPet: (pet: Omit<Pet, "id">) => {
        const id = uid("pet");
        update((current) => ({ ...current, pets: [{ ...pet, id }, ...current.pets] }));
        return id;
      },
      updatePet: (pet: Pet) =>
        update((current) => ({
          ...current,
          pets: current.pets.map((item) => (item.id === pet.id ? pet : item))
        })),
      addEmployee: (employee: Omit<Employee, "id">) =>
        update((current) => ({
          ...current,
          employees: [{ ...employee, id: uid("emp") }, ...current.employees]
        })),
      updateEmployee: (employee: Employee) =>
        update((current) => ({
          ...current,
          employees: current.employees.map((item) => (item.id === employee.id ? employee : item))
        })),
      addAppointment: (appointment: Omit<Appointment, "id">) => {
        const id = uid("apt");
        update((current) => ({
          ...current,
          appointments: [{ ...appointment, id }, ...current.appointments]
        }));
        return id;
      },
      updateAppointment: (appointment: Appointment) =>
        update((current) => ({
          ...current,
          appointments: current.appointments.map((item) =>
            item.id === appointment.id ? appointment : item
          )
        })),
      moveAppointment: (appointmentId: string, date: string, time: string, employeeId?: string) =>
        update((current) => ({
          ...current,
          appointments: current.appointments.map((item) =>
            item.id === appointmentId
              ? {
                  ...item,
                  date,
                  time,
                  employeeId: employeeId || item.employeeId,
                  status: item.status === "zakończona" ? item.status : "przełożona"
                }
              : item
          )
        })),
      cancelAppointment: (appointmentId: string) =>
        update((current) => ({
          ...current,
          appointments: current.appointments.map((item) =>
            item.id === appointmentId ? { ...item, status: "anulowana" } : item
          )
        })),
      payDeposit: (appointmentId: string) =>
        update((current) => ({
          ...current,
          appointments: current.appointments.map((item) =>
            item.id === appointmentId
              ? { ...item, paymentStatus: "opłacony", status: "potwierdzona" }
              : item
          )
        })),
      addReview: (review: Omit<Review, "id" | "createdAt" | "verified" | "public">) =>
        update((current) => ({
          ...current,
          reviews: [
            {
              ...review,
              id: uid("rev"),
              createdAt: new Date().toISOString().slice(0, 10),
              verified: true,
              public: true
            },
            ...current.reviews
          ]
        }))
    }),
    [data, ready]
  );

  return api;
}

export function formatPrice(value: number) {
  return new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" }).format(value);
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date(`${date}T00:00:00`));
}

export function endTime(time: string, durationMin: number) {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + durationMin;
  const hh = String(Math.floor(total / 60)).padStart(2, "0");
  const mm = String(total % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

export function calculateDeposit(salon: Salon, service: Service, client?: Client) {
  if (!service.depositRequired || client?.depositExempt) return 0;
  if (service.depositOverride) return service.depositOverride;
  if (salon.depositType === "fixed") return salon.depositValue;
  return Math.round((service.price * salon.depositValue) / 100);
}

export const demoDates = [
  "2026-07-10",
  "2026-07-11",
  "2026-07-12",
  "2026-07-13",
  "2026-07-14",
  "2026-07-15",
  "2026-07-16"
];

export const demoTimes = ["09:00", "10:00", "11:00", "12:30", "13:00", "14:00", "15:00", "16:00"];
