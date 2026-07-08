"use client";

import Link from "next/link";
import React, { useState } from "react";
import {
  CalendarDays,
  CreditCard,
  Heart,
  Home,
  ImagePlus,
  LogOut,
  PawPrint,
  Star,
  User,
  WalletCards
} from "lucide-react";
import { Logo, StatusBadge } from "@/components/Common";
import { demoDates, demoTimes, endTime, formatDate, formatPrice, useGroomerStore } from "@/lib/store";
import { Appointment } from "@/lib/types";

type ClientTab = "visits" | "pets" | "profile" | "reviews" | "favorites" | "payments";

const clientTabs: { id: ClientTab; label: string; icon: React.ElementType }[] = [
  { id: "visits", label: "Moje wizyty", icon: CalendarDays },
  { id: "pets", label: "Moi pupile", icon: PawPrint },
  { id: "profile", label: "Moje dane", icon: User },
  { id: "reviews", label: "Opinie", icon: Star },
  { id: "favorites", label: "Ulubione salony", icon: Heart },
  { id: "payments", label: "Płatności", icon: WalletCards }
];

export default function ClientPanel() {
  const store = useGroomerStore();
  const client = store.data.clients[0];
  const [activeTab, setActiveTab] = useState<ClientTab>("visits");
  const salon = store.data.salons[0];

  const content = {
    visits: <ClientVisits store={store} clientId={client.id} />,
    pets: <ClientPets store={store} clientId={client.id} />,
    profile: <ClientProfile store={store} clientId={client.id} />,
    reviews: <ClientReviews store={store} clientId={client.id} />,
    favorites: <FavoriteSalons salonSlug={salon.slug} salonName={salon.name} />,
    payments: <ClientPayments store={store} clientId={client.id} />
  }[activeTab];

  return (
    <div className="app-shell">
      <aside className="sidebar" style={{ background: "linear-gradient(180deg, #fffaf3, #f0e4d3)", color: "var(--ink)", borderRight: "1px solid var(--line)" }}>
        <Logo />
        <div className="sidebar-footer" style={{ marginTop: 0, borderTop: 0 }}>
          <div className="logo-mark" style={{ width: 42, height: 42 }}>👤</div>
          <div>
            <strong>{client.name}</strong>
            <div className="small muted">Panel klienta</div>
          </div>
        </div>
        <nav className="side-nav">
          {clientTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} className={activeTab === tab.id ? "active" : ""} onClick={() => setActiveTab(tab.id)} style={activeTab === tab.id ? { background: "rgba(201,154,74,.18)", color: "var(--ink)" } : { color: "var(--ink)" }}>
                <Icon size={18} /> {tab.label}
              </button>
            );
          })}
        </nav>
        <Link href="/" className="btn btn-outline" style={{ marginTop: "auto" }}>
          <LogOut size={16} /> Wyloguj demo
        </Link>
      </aside>
      <main className="main-panel">
        <div className="panel-header">
          <div>
            <h1 className="panel-title">{clientTabs.find((tab) => tab.id === activeTab)?.label}</h1>
            <p className="muted" style={{ marginTop: 8 }}>Zarządzaj wizytami, pupilami i danymi klienta.</p>
          </div>
          <Link className="btn btn-primary" href={`/salony/${salon.slug}`}>
            <Home size={18} /> Umów wizytę
          </Link>
        </div>
        {content}
      </main>
      <ClientMobileTabBar tabs={clientTabs} activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}


function ClientMobileTabBar({
  tabs,
  activeTab,
  setActiveTab
}: {
  tabs: { id: ClientTab; label: string; icon: React.ElementType }[];
  activeTab: ClientTab;
  setActiveTab: (tab: ClientTab) => void;
}) {
  return (
    <nav className="mobile-tabbar" aria-label="Nawigacja panelu klienta">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button key={tab.id} className={activeTab === tab.id ? "active" : ""} onClick={() => setActiveTab(tab.id)}>
            <Icon size={18} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function ClientVisits({ store, clientId }: { store: ReturnType<typeof useGroomerStore>; clientId: string }) {
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"upcoming" | "history" | "cancelled">("upcoming");
  const visits = store.data.appointments
    .filter((appointment) => appointment.clientId === clientId)
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  const filteredVisits = visits.filter((appointment) => {
    if (filter === "cancelled") return appointment.status === "anulowana";
    if (filter === "history") return appointment.status === "zakończona" || appointment.status === "nieobecność";
    return appointment.status !== "anulowana" && appointment.status !== "zakończona" && appointment.status !== "nieobecność";
  });
  return (
    <div className="card">
      <div className="tabs" style={{ marginBottom: 18 }}>
        <button className={filter === "upcoming" ? "active" : ""} onClick={() => setFilter("upcoming")}>Nadchodzące</button>
        <button className={filter === "history" ? "active" : ""} onClick={() => setFilter("history")}>Historia</button>
        <button className={filter === "cancelled" ? "active" : ""} onClick={() => setFilter("cancelled")}>Anulowane</button>
      </div>
      <div className="table-list">
        {filteredVisits.length ? filteredVisits.map((appointment) => (
          <ClientVisitRow key={appointment.id} store={store} appointment={appointment} onReschedule={() => setRescheduleId(appointment.id)} />
        )) : <div className="empty-inline">Brak wizyt w tej sekcji.</div>}
      </div>
      <div className="card" style={{ marginTop: 18, boxShadow: "none", background: "rgba(247,241,232,.6)" }}>
        <strong>Informacja</strong>
        <p className="small muted" style={{ margin: "8px 0 0" }}>
          Termin możesz zmienić samodzielnie do 24h przed wizytą. W tym prototypie zmiana zapisuje się od razu.
        </p>
      </div>
      {rescheduleId ? <RescheduleModal store={store} appointmentId={rescheduleId} onClose={() => setRescheduleId(null)} /> : null}
    </div>
  );
}

function ClientVisitRow({ store, appointment, onReschedule }: { store: ReturnType<typeof useGroomerStore>; appointment: Appointment; onReschedule: () => void }) {
  const salon = store.data.salons.find((item) => item.id === appointment.salonId);
  const service = store.data.services.find((item) => item.id === appointment.serviceId);
  const pet = store.data.pets.find((item) => item.id === appointment.petId);
  const canEdit = appointment.status !== "anulowana" && appointment.status !== "zakończona";
  return (
    <div className="visit-row">
      <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
        <img className="pet-avatar" src={pet?.photo} alt={pet?.name || "Pupil"} style={{ width: 82, height: 82, borderRadius: 18 }} />
        <div>
          <strong>{service?.name}</strong>
          <div className="small muted">Salon: {salon?.name}</div>
          <div className="small muted">Pupil: {pet?.name}</div>
        </div>
      </div>
      <div>
        <strong>{formatDate(appointment.date)}</strong>
        <div className="small muted">{appointment.time} - {endTime(appointment.time, appointment.durationMin)}</div>
        <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
          <StatusBadge status={appointment.status} />
          <StatusBadge status={appointment.paymentStatus} />
        </div>
      </div>
      <div style={{ display: "grid", gap: 8, justifyItems: "end" }}>
        {appointment.paymentStatus === "oczekuje" ? (
          <button className="btn btn-small btn-gold" onClick={() => store.payDeposit(appointment.id)}>
            <CreditCard size={14} /> Zapłać zadatek
          </button>
        ) : null}
        {canEdit ? <button className="btn btn-small btn-primary" onClick={onReschedule}>Zmień termin</button> : null}
        {canEdit ? <button className="btn btn-small btn-outline" onClick={() => store.cancelAppointment(appointment.id)}>Anuluj wizytę</button> : null}
      </div>
    </div>
  );
}

function RescheduleModal({ store, appointmentId, onClose }: { store: ReturnType<typeof useGroomerStore>; appointmentId: string; onClose: () => void }) {
  const appointment = store.data.appointments.find((item) => item.id === appointmentId);
  const [date, setDate] = useState(appointment?.date || demoDates[0]);
  const [time, setTime] = useState(appointment?.time || demoTimes[0]);
  if (!appointment) return null;
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(event) => event.stopPropagation()}>
        <div className="section-head">
          <div>
            <h2>Zmień termin wizyty</h2>
            <p className="muted">Wybierz nowy dzień i godzinę.</p>
          </div>
          <button className="btn btn-outline" onClick={onClose}>Zamknij</button>
        </div>
        <h3>Data</h3>
        <div className="date-row">
          {demoDates.map((item) => (
            <button className={`pill-date ${date === item ? "active" : ""}`} key={item} onClick={() => setDate(item)}>
              {item.slice(8, 10)}.07
            </button>
          ))}
        </div>
        <h3 style={{ marginTop: 18 }}>Godzina</h3>
        <div className="time-row">
          {demoTimes.map((item) => (
            <button className={`pill-time ${time === item ? "active" : ""}`} key={item} onClick={() => setTime(item)}>
              {item}
            </button>
          ))}
        </div>
        <button
          className="btn btn-primary"
          style={{ width: "100%", marginTop: 22 }}
          onClick={() => {
            store.moveAppointment(appointment.id, date, time);
            onClose();
          }}
        >
          Zapisz nowy termin
        </button>
      </div>
    </div>
  );
}

function ClientPets({ store, clientId }: { store: ReturnType<typeof useGroomerStore>; clientId: string }) {
  const pets = store.data.pets.filter((pet) => pet.clientId === clientId);
  const [form, setForm] = useState({ name: "", breed: "", weightKg: "", photo: "" });
  return (
    <div className="grid-2">
      <div className="card">
        <h3>Moi pupile</h3>
        <div className="table-list">
          {pets.map((pet) => (
            <div className="list-row" key={pet.id}>
              <img className="pet-avatar" src={pet.photo} alt={pet.name} style={{ width: 74, height: 74, borderRadius: 18 }} />
              <div>
                <strong>{pet.name}</strong>
                <div className="small muted">{pet.breed} · {pet.weightKg} kg · {pet.age} lata</div>
                <div className="small muted">{pet.notes}</div>
              </div>
              <StatusBadge status={pet.species} />
            </div>
          ))}
        </div>
      </div>
      <div className="card">
        <h3>Dodaj pupila</h3>
        <div className="form-grid">
          <label className="form-field">
            Imię
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label className="form-field">
            Rasa
            <input className="input" value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })} />
          </label>
          <label className="form-field">
            Waga kg
            <input className="input" type="number" value={form.weightKg} onChange={(e) => setForm({ ...form, weightKg: e.target.value })} />
          </label>
          <label className="form-field">
            URL zdjęcia
            <input className="input" value={form.photo} onChange={(e) => setForm({ ...form, photo: e.target.value })} />
          </label>
        </div>
        <button
          className="btn btn-primary"
          style={{ marginTop: 16 }}
          onClick={() => {
            if (!form.name) return;
            store.addPet({
              clientId,
              name: form.name,
              species: "pies",
              breed: form.breed || "Nie podano",
              weightKg: Number(form.weightKg || 0),
              age: 1,
              photo: form.photo || "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=400&q=80",
              notes: "Dodany w panelu klienta."
            });
            setForm({ name: "", breed: "", weightKg: "", photo: "" });
          }}
        >
          <ImagePlus size={18} /> Dodaj pupila
        </button>
      </div>
    </div>
  );
}

function ClientProfile({ store, clientId }: { store: ReturnType<typeof useGroomerStore>; clientId: string }) {
  const client = store.data.clients.find((item) => item.id === clientId) || store.data.clients[0];
  const [form, setForm] = useState(client);
  return (
    <div className="card">
      <h3>Moje dane</h3>
      <div className="form-grid">
        <label className="form-field">
          Imię i nazwisko
          <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </label>
        <label className="form-field">
          Telefon
          <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </label>
        <label className="form-field">
          E-mail
          <input className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </label>
        <label className="form-field">
          Adres
          <input className="input" value={form.address || ""} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </label>
        <label className="form-field full" style={{ display: "flex", flexDirection: "row", gap: 10, alignItems: "center" }}>
          <input type="checkbox" checked={form.marketingConsent} onChange={(e) => setForm({ ...form, marketingConsent: e.target.checked })} />
          Zgadzam się na przypomnienia i komunikację marketingową salonu.
        </label>
      </div>
      <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => store.updateClient(form)}>
        Zapisz dane
      </button>
    </div>
  );
}

function ClientReviews({ store, clientId }: { store: ReturnType<typeof useGroomerStore>; clientId: string }) {
  const salon = store.data.salons[0];
  const pets = store.data.pets.filter((pet) => pet.clientId === clientId);
  const [form, setForm] = useState({ petId: pets[0]?.id || "", rating: 5, text: "" });
  const myReviews = store.data.reviews.filter((review) => review.clientId === clientId);
  return (
    <div className="grid-2">
      <div className="card">
        <h3>Dodaj opinię</h3>
        <div className="form-grid">
          <label className="form-field">
            Pupil
            <select className="select" value={form.petId} onChange={(e) => setForm({ ...form, petId: e.target.value })}>
              {pets.map((pet) => <option key={pet.id} value={pet.id}>{pet.name}</option>)}
            </select>
          </label>
          <label className="form-field">
            Ocena
            <select className="select" value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}>
              {[5, 4, 3, 2, 1].map((item) => <option key={item} value={item}>{item} gwiazdek</option>)}
            </select>
          </label>
          <label className="form-field full">
            Opinia
            <textarea className="textarea" value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} />
          </label>
        </div>
        <button
          className="btn btn-primary"
          style={{ marginTop: 16 }}
          onClick={() => {
            if (!form.petId || !form.text) return;
            store.addReview({ salonId: salon.id, clientId, petId: form.petId, rating: form.rating, text: form.text });
            setForm({ petId: pets[0]?.id || "", rating: 5, text: "" });
          }}
        >
          Dodaj opinię
        </button>
      </div>
      <div className="card">
        <h3>Moje opinie</h3>
        <div className="table-list">
          {myReviews.map((review) => (
            <div className="list-row" key={review.id}>
              <div className="logo-mark" style={{ width: 42, height: 42 }}><Star size={18} /></div>
              <div>
                <strong>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</strong>
                <p className="small muted">{review.text}</p>
              </div>
              <StatusBadge status="publiczna" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FavoriteSalons({ salonSlug, salonName }: { salonSlug: string; salonName: string }) {
  return (
    <div className="card">
      <h3>Ulubione salony</h3>
      <div className="list-row">
        <div className="logo-mark" style={{ width: 42, height: 42 }}><Heart size={18} /></div>
        <div>
          <strong>{salonName}</strong>
          <div className="small muted">Salon dodany do ulubionych w demo.</div>
        </div>
        <Link className="btn btn-small btn-primary" href={`/salony/${salonSlug}`}>Otwórz</Link>
      </div>
    </div>
  );
}

function ClientPayments({ store, clientId }: { store: ReturnType<typeof useGroomerStore>; clientId: string }) {
  const payments = store.data.appointments.filter((appointment) => appointment.clientId === clientId && appointment.depositAmount > 0);
  return (
    <div className="card">
      <h3>Płatności i zadatki</h3>
      <div className="table-list">
        {payments.map((appointment) => {
          const service = store.data.services.find((item) => item.id === appointment.serviceId);
          return (
            <div className="list-row" key={appointment.id}>
              <div className="logo-mark" style={{ width: 42, height: 42 }}><CreditCard size={18} /></div>
              <div>
                <strong>{service?.name}</strong>
                <div className="small muted">{formatDate(appointment.date)} · zadatek {formatPrice(appointment.depositAmount)}</div>
              </div>
              <StatusBadge status={appointment.paymentStatus} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
