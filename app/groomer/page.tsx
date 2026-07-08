"use client";

import Link from "next/link";
import React, { useMemo, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Heart,
  Home,
  ImagePlus,
  LogOut,
  PawPrint,
  Plus,
  RefreshCcw,
  Scissors,
  Settings,
  Star,
  Users
} from "lucide-react";
import { Logo, StatusBadge } from "@/components/Common";
import {
  calculateDeposit,
  demoDates,
  demoTimes,
  endTime,
  formatDate,
  formatPrice,
  uid,
  useGroomerStore
} from "@/lib/store";
import { Appointment, Client, Employee, Pet, Service } from "@/lib/types";

type TabId =
  | "dashboard"
  | "calendar"
  | "appointments"
  | "clients"
  | "pets"
  | "services"
  | "employees"
  | "reviews"
  | "reports"
  | "settings";

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Pulpit", icon: Home },
  { id: "calendar", label: "Kalendarz", icon: CalendarDays },
  { id: "appointments", label: "Wizyty", icon: CheckCircle2 },
  { id: "clients", label: "Klienci", icon: Users },
  { id: "pets", label: "Pupile", icon: PawPrint },
  { id: "services", label: "Usługi", icon: Scissors },
  { id: "employees", label: "Pracownicy", icon: Users },
  { id: "reviews", label: "Opinie", icon: Star },
  { id: "reports", label: "Raporty", icon: BarChart3 },
  { id: "settings", label: "Ustawienia", icon: Settings }
];

export default function GroomerPanel() {
  const store = useGroomerStore();
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const salon = store.data.salons[0];
  const employees = store.data.employees.filter((item) => item.salonId === salon.id);
  const services = store.data.services.filter((item) => item.salonId === salon.id);
  const appointments = store.data.appointments.filter((item) => item.salonId === salon.id);

  const content = {
    dashboard: <Dashboard store={store} openAppointment={() => setAppointmentModalOpen(true)} />,
    calendar: <CalendarBoard store={store} openAppointment={() => setAppointmentModalOpen(true)} />,
    appointments: <AppointmentsTab store={store} openAppointment={() => setAppointmentModalOpen(true)} />,
    clients: <ClientsTab store={store} />,
    pets: <PetsTab store={store} />,
    services: <ServicesTab store={store} openService={() => setServiceModalOpen(true)} />,
    employees: <EmployeesTab store={store} />,
    reviews: <ReviewsTab store={store} />,
    reports: <ReportsTab store={store} />,
    settings: <SettingsTab store={store} />
  }[activeTab];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Logo dark />
        <div className="small muted" style={{ color: "rgba(255,255,255,.58)", marginTop: -14 }}>
          {salon.name} · {salon.subtitle}
        </div>
        <nav className="side-nav">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={activeTab === tab.id ? "active" : ""}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={18} /> {tab.label}
              </button>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <img className="avatar" src={employees[0]?.avatar} alt="Właścicielka" />
          <div>
            <strong>{salon.ownerName}</strong>
            <div className="small" style={{ color: "rgba(255,255,255,.58)" }}>
              Właścicielka
            </div>
          </div>
        </div>
        <Link href="/" className="btn btn-outline" style={{ color: "#fff", borderColor: "rgba(255,255,255,.18)" }}>
          <LogOut size={16} /> Wyjdź z panelu
        </Link>
      </aside>
      <main className="main-panel">
        <div className="panel-header">
          <div>
            <h1 className="panel-title">{tabs.find((item) => item.id === activeTab)?.label}</h1>
            <p className="muted" style={{ marginTop: 8 }}>
              Demo działa bez bazy danych. Zmiany zapisują się lokalnie w przeglądarce.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link className="btn btn-outline" href={`/salony/${salon.slug}`}>
              Strona salonu
            </Link>
            <button className="btn btn-outline" onClick={store.reset}>
              <RefreshCcw size={16} /> Reset danych
            </button>
            <button className="btn btn-primary" onClick={() => setAppointmentModalOpen(true)}>
              <Plus size={18} /> Dodaj wizytę
            </button>
          </div>
        </div>
        {content}
      </main>
      {appointmentModalOpen ? <AppointmentModal store={store} onClose={() => setAppointmentModalOpen(false)} /> : null}
      {serviceModalOpen ? <ServiceModal store={store} onClose={() => setServiceModalOpen(false)} /> : null}
    </div>
  );
}

function Dashboard({ store, openAppointment }: { store: ReturnType<typeof useGroomerStore>; openAppointment: () => void }) {
  const salon = store.data.salons[0];
  const appointments = store.data.appointments.filter((item) => item.salonId === salon.id);
  const services = store.data.services.filter((item) => item.salonId === salon.id);
  const today = "2026-07-10";
  const todayAppointments = appointments.filter((item) => item.date === today);
  const revenue = appointments.filter((item) => item.status !== "anulowana").reduce((sum, item) => sum + item.price, 0);
  const deposits = appointments.filter((item) => item.paymentStatus === "opłacony").reduce((sum, item) => sum + item.depositAmount, 0);

  return (
    <div className="table-list">
      <div className="grid-3">
        <KpiCard icon={CalendarDays} title="Wizyty" value={appointments.length.toString()} text="łącznie w demo" />
        <KpiCard icon={CreditCard} title="Zadatki" value={formatPrice(deposits)} text="opłacone online" />
        <KpiCard icon={BarChart3} title="Przychód" value={formatPrice(revenue)} text="z aktywnych wizyt" />
      </div>
      <div className="grid-2">
        <div className="card">
          <div className="section-head" style={{ marginBottom: 12 }}>
            <div>
              <h3>Dzisiejsze wizyty</h3>
              <p className="muted small">{formatDate(today)}</p>
            </div>
            <button className="btn btn-small btn-primary" onClick={openAppointment}>
              <Plus size={15} /> Nowa
            </button>
          </div>
          <div className="table-list">
            {todayAppointments.map((appointment) => (
              <AppointmentRow key={appointment.id} store={store} appointment={appointment} />
            ))}
          </div>
        </div>
        <div className="card">
          <h3>Skrót salonu</h3>
          <div className="table-list">
            <InfoLine label="Pakiet" value={salon.package.toUpperCase()} />
            <InfoLine label="Usługi" value={services.length.toString()} />
            <InfoLine label="Klienci" value={store.data.clients.length.toString()} />
            <InfoLine label="Pupile" value={store.data.pets.length.toString()} />
            <InfoLine label="Zadatek" value={salon.depositType === "fixed" ? formatPrice(salon.depositValue) : `${salon.depositValue}%`} />
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ icon: Icon, title, value, text }: { icon: React.ElementType; title: string; value: string; text: string }) {
  return (
    <div className="card">
      <Icon color="var(--gold-2)" />
      <p className="muted" style={{ margin: "14px 0 0" }}>{title}</p>
      <div className="kpi">{value}</div>
      <p className="small muted">{text}</p>
    </div>
  );
}

function CalendarBoard({ store, openAppointment }: { store: ReturnType<typeof useGroomerStore>; openAppointment: () => void }) {
  const salon = store.data.salons[0];
  const appointments = store.data.appointments.filter((item) => item.salonId === salon.id);
  const [hoverSlot, setHoverSlot] = useState<string | null>(null);

  function getAppointments(date: string, time: string) {
    return appointments.filter((item) => item.date === date && item.time === time && item.status !== "anulowana");
  }

  return (
    <div className="card">
      <div className="section-head">
        <div>
          <h3>Widok tygodniowy</h3>
          <p className="muted">Przeciągnij wizytę na inną godzinę albo dzień. Zmiana zapisze się w localStorage.</p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div className="tabs">
            <button>Dzień</button>
            <button className="active">Tydzień</button>
            <button>Miesiąc</button>
          </div>
          <button className="btn btn-primary" onClick={openAppointment}>
            <Plus size={18} /> Dodaj wizytę
          </button>
        </div>
      </div>
      <div className="calendar-wrap">
        <div className="calendar-grid">
          <div className="calendar-cell header">Godz.</div>
          {demoDates.map((date) => (
            <div className="calendar-cell header" key={date}>
              <div>
                <div>{new Intl.DateTimeFormat("pl-PL", { weekday: "short" }).format(new Date(`${date}T00:00:00`))}</div>
                <div className="muted small">{date.slice(8, 10)}.07</div>
              </div>
            </div>
          ))}
          {demoTimes.map((time) => (
            <React.Fragment key={time}>
              <div className="calendar-cell time">{time}</div>
              {demoDates.map((date) => {
                const id = `${date}-${time}`;
                const inSlot = getAppointments(date, time);
                return (
                  <div
                    key={id}
                    className={`calendar-cell ${hoverSlot === id ? "drop-hover" : ""}`}
                    onDragOver={(event) => {
                      event.preventDefault();
                      setHoverSlot(id);
                    }}
                    onDragLeave={() => setHoverSlot(null)}
                    onDrop={(event) => {
                      event.preventDefault();
                      const appointmentId = event.dataTransfer.getData("appointmentId");
                      if (appointmentId) store.moveAppointment(appointmentId, date, time);
                      setHoverSlot(null);
                    }}
                  >
                    <div className="table-list">
                      {inSlot.map((appointment) => (
                        <CalendarAppointment key={appointment.id} store={store} appointment={appointment} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

function CalendarAppointment({ store, appointment }: { store: ReturnType<typeof useGroomerStore>; appointment: Appointment }) {
  const service = store.data.services.find((item) => item.id === appointment.serviceId);
  const pet = store.data.pets.find((item) => item.id === appointment.petId);
  const client = store.data.clients.find((item) => item.id === appointment.clientId);
  const employee = store.data.employees.find((item) => item.id === appointment.employeeId);
  return (
    <div
      className={`appointment-card ${employee?.color || ""}`}
      draggable
      onDragStart={(event) => event.dataTransfer.setData("appointmentId", appointment.id)}
      title="Przeciągnij wizytę"
    >
      <strong>
        {appointment.time} - {endTime(appointment.time, appointment.durationMin)}
      </strong>
      <div>{pet?.name} · {service?.name}</div>
      <div className="muted">{client?.name}</div>
    </div>
  );
}

function AppointmentsTab({ store, openAppointment }: { store: ReturnType<typeof useGroomerStore>; openAppointment: () => void }) {
  const salon = store.data.salons[0];
  const appointments = [...store.data.appointments]
    .filter((item) => item.salonId === salon.id)
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));

  return (
    <div className="card">
      <div className="section-head">
        <div>
          <h3>Lista wizyt</h3>
          <p className="muted">Szybka edycja statusu, płatności i anulowanie.</p>
        </div>
        <button className="btn btn-primary" onClick={openAppointment}>
          <Plus size={18} /> Dodaj wizytę
        </button>
      </div>
      <div className="table-list">
        {appointments.map((appointment) => (
          <AppointmentRow key={appointment.id} store={store} appointment={appointment} />
        ))}
      </div>
    </div>
  );
}

function AppointmentRow({ store, appointment }: { store: ReturnType<typeof useGroomerStore>; appointment: Appointment }) {
  const service = store.data.services.find((item) => item.id === appointment.serviceId);
  const pet = store.data.pets.find((item) => item.id === appointment.petId);
  const client = store.data.clients.find((item) => item.id === appointment.clientId);
  const employee = store.data.employees.find((item) => item.id === appointment.employeeId);

  return (
    <div className="list-row">
      <img className="pet-avatar" src={pet?.photo} alt={pet?.name || "Pupil"} />
      <div>
        <strong>{service?.name}</strong>
        <div className="small muted">
          {formatDate(appointment.date)} · {appointment.time} - {endTime(appointment.time, appointment.durationMin)} · {employee?.name}
        </div>
        <div className="small muted">{client?.name} · pupil: {pet?.name}</div>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
        <StatusBadge status={appointment.status} />
        <StatusBadge status={appointment.paymentStatus} />
        {appointment.paymentStatus === "oczekuje" ? (
          <button className="btn btn-small btn-primary" onClick={() => store.payDeposit(appointment.id)}>
            Oznacz opłacone
          </button>
        ) : null}
        {appointment.status !== "anulowana" ? (
          <button className="btn btn-small btn-outline" onClick={() => store.cancelAppointment(appointment.id)}>
            Anuluj
          </button>
        ) : null}
      </div>
    </div>
  );
}

function ClientsTab({ store }: { store: ReturnType<typeof useGroomerStore> }) {
  const [query, setQuery] = useState("");
  const [newClient, setNewClient] = useState({ name: "", phone: "", email: "" });
  const clients = store.data.clients.filter((client) =>
    `${client.name} ${client.email} ${client.phone}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="grid-2">
      <div className="card">
        <h3>Baza klientów</h3>
        <input className="input" placeholder="Szukaj klienta..." value={query} onChange={(event) => setQuery(event.target.value)} />
        <div className="table-list" style={{ marginTop: 16 }}>
          {clients.map((client) => (
            <ClientCard key={client.id} store={store} client={client} />
          ))}
        </div>
      </div>
      <div className="card">
        <h3>Dodaj klienta</h3>
        <div className="form-grid">
          <label className="form-field full">
            Imię i nazwisko
            <input className="input" value={newClient.name} onChange={(e) => setNewClient({ ...newClient, name: e.target.value })} />
          </label>
          <label className="form-field">
            Telefon
            <input className="input" value={newClient.phone} onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })} />
          </label>
          <label className="form-field">
            E-mail
            <input className="input" value={newClient.email} onChange={(e) => setNewClient({ ...newClient, email: e.target.value })} />
          </label>
        </div>
        <button
          className="btn btn-primary"
          style={{ marginTop: 16 }}
          onClick={() => {
            if (!newClient.name || !newClient.phone) return;
            store.addClient({
              ...newClient,
              status: "nowy",
              depositExempt: false,
              notes: "",
              marketingConsent: false
            });
            setNewClient({ name: "", phone: "", email: "" });
          }}
        >
          <Plus size={18} /> Dodaj klienta
        </button>
      </div>
    </div>
  );
}

function ClientCard({ store, client }: { store: ReturnType<typeof useGroomerStore>; client: Client }) {
  const pets = store.data.pets.filter((pet) => pet.clientId === client.id);
  const visits = store.data.appointments.filter((appointment) => appointment.clientId === client.id);
  return (
    <div className="list-row">
      <div className="logo-mark" style={{ width: 42, height: 42 }}>👤</div>
      <div>
        <strong>{client.name}</strong>
        <div className="small muted">{client.phone} · {client.email}</div>
        <div className="small muted">{pets.length} pupile · {visits.length} wizyty · {client.notes || "brak notatki"}</div>
      </div>
      <div style={{ display: "grid", gap: 8, justifyItems: "end" }}>
        <StatusBadge status={client.status} />
        <button
          className={client.depositExempt ? "btn btn-small btn-gold" : "btn btn-small btn-outline"}
          onClick={() => store.updateClient({ ...client, depositExempt: !client.depositExempt })}
        >
          {client.depositExempt ? "Zwolniony z zadatku" : "Wymagaj zadatku"}
        </button>
      </div>
    </div>
  );
}

function PetsTab({ store }: { store: ReturnType<typeof useGroomerStore> }) {
  const [form, setForm] = useState({ clientId: store.data.clients[0]?.id || "", name: "", breed: "", weightKg: "", photo: "" });
  return (
    <div className="grid-2">
      <div className="card">
        <h3>Profile pupili</h3>
        <div className="table-list">
          {store.data.pets.map((pet) => {
            const owner = store.data.clients.find((client) => client.id === pet.clientId);
            return (
              <div className="list-row" key={pet.id}>
                <img className="pet-avatar" src={pet.photo} alt={pet.name} />
                <div>
                  <strong>{pet.name}</strong>
                  <div className="small muted">{pet.breed} · {pet.weightKg} kg · właściciel: {owner?.name}</div>
                  <div className="small muted">{pet.notes}</div>
                </div>
                <StatusBadge status={pet.species} />
              </div>
            );
          })}
        </div>
      </div>
      <div className="card">
        <h3>Dodaj pupila</h3>
        <div className="form-grid">
          <label className="form-field full">
            Właściciel
            <select className="select" value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })}>
              {store.data.clients.map((client) => (
                <option value={client.id} key={client.id}>{client.name}</option>
              ))}
            </select>
          </label>
          <label className="form-field">
            Imię pupila
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
            if (!form.clientId || !form.name) return;
            store.addPet({
              clientId: form.clientId,
              name: form.name,
              species: "pies",
              breed: form.breed || "Nie podano",
              weightKg: Number(form.weightKg || 0),
              age: 1,
              photo: form.photo || "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=400&q=80",
              notes: "Nowy profil pupila."
            });
            setForm({ clientId: store.data.clients[0]?.id || "", name: "", breed: "", weightKg: "", photo: "" });
          }}
        >
          <ImagePlus size={18} /> Dodaj pupila
        </button>
      </div>
    </div>
  );
}

function ServicesTab({ store, openService }: { store: ReturnType<typeof useGroomerStore>; openService: () => void }) {
  const salon = store.data.salons[0];
  const services = store.data.services.filter((item) => item.salonId === salon.id);
  return (
    <div className="card">
      <div className="section-head">
        <div>
          <h3>Usługi salonu</h3>
          <p className="muted">Nazwa, cena, czas, zadatek i dostępność usługi.</p>
        </div>
        <button className="btn btn-primary" onClick={openService}>
          <Plus size={18} /> Dodaj usługę
        </button>
      </div>
      {services.map((service) => (
        <div className="service-row" key={service.id}>
          <div>
            <strong>{service.name}</strong>
            <p className="small muted" style={{ margin: "6px 0 0" }}>{service.description}</p>
            <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span className="badge">{service.category}</span>
              <span className="badge">{service.durationMin} min</span>
              {service.depositRequired ? <span className="badge warn">zadatek</span> : <span className="badge dark">bez zadatku</span>}
            </div>
          </div>
          <strong>{formatPrice(service.price)}</strong>
          <button className="btn btn-small btn-outline" onClick={() => store.updateService({ ...service, active: !service.active })}>
            {service.active ? "Wyłącz" : "Włącz"}
          </button>
        </div>
      ))}
    </div>
  );
}

function EmployeesTab({ store }: { store: ReturnType<typeof useGroomerStore> }) {
  const salon = store.data.salons[0];
  const [name, setName] = useState("");
  const employees = store.data.employees.filter((item) => item.salonId === salon.id);
  return (
    <div className="grid-2">
      <div className="card">
        <h3>Pracownicy</h3>
        <div className="table-list">
          {employees.map((employee) => (
            <div className="list-row" key={employee.id}>
              <img className="avatar" src={employee.avatar} alt={employee.name} />
              <div>
                <strong>{employee.name}</strong>
                <div className="small muted">{employee.role}</div>
              </div>
              <button className="btn btn-small btn-outline" onClick={() => store.updateEmployee({ ...employee, active: !employee.active })}>
                {employee.active ? "Aktywny" : "Ukryty"}
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="card">
        <h3>Dodaj pracownika</h3>
        <label className="form-field">
          Imię
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="np. Natalia" />
        </label>
        <button
          className="btn btn-primary"
          style={{ marginTop: 16 }}
          onClick={() => {
            if (!name) return;
            store.addEmployee({
              salonId: salon.id,
              name,
              role: "Groomer",
              avatar: "https://images.unsplash.com/photo-1558898479-33c0057a5d12?auto=format&fit=crop&w=240&q=80",
              color: "gold",
              active: true
            });
            setName("");
          }}
        >
          <Plus size={18} /> Dodaj
        </button>
      </div>
    </div>
  );
}

function ReviewsTab({ store }: { store: ReturnType<typeof useGroomerStore> }) {
  return (
    <div className="card">
      <h3>Opinie klientów</h3>
      <div className="table-list">
        {store.data.reviews.map((review) => {
          const client = store.data.clients.find((item) => item.id === review.clientId);
          const pet = store.data.pets.find((item) => item.id === review.petId);
          return (
            <div className="list-row" key={review.id}>
              <div className="logo-mark" style={{ width: 42, height: 42 }}><Star size={18} /></div>
              <div>
                <strong>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</strong>
                <p style={{ margin: "6px 0" }}>{review.text}</p>
                <div className="small muted">{client?.name} · {pet?.name} · {review.createdAt}</div>
              </div>
              <StatusBadge status={review.verified ? "potwierdzona wizyta" : "niezweryfikowana"} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ReportsTab({ store }: { store: ReturnType<typeof useGroomerStore> }) {
  const appointments = store.data.appointments.filter((item) => item.status !== "anulowana");
  const revenue = appointments.reduce((sum, item) => sum + item.price, 0);
  const noShows = store.data.appointments.filter((item) => item.status === "nieobecność").length;
  const byService = store.data.services.map((service) => ({
    service,
    count: appointments.filter((appointment) => appointment.serviceId === service.id).length
  }));
  const maxCount = Math.max(1, ...byService.map((item) => item.count));
  return (
    <div className="table-list">
      <div className="grid-3">
        <KpiCard icon={BarChart3} title="Przychód" value={formatPrice(revenue)} text="z wizyt w demo" />
        <KpiCard icon={CalendarDays} title="Obłożenie" value="68%" text="symulowane" />
        <KpiCard icon={Users} title="Nieobecności" value={noShows.toString()} text="klienci bez przyjścia" />
      </div>
      <div className="card">
        <h3>Popularność usług</h3>
        <div className="table-list">
          {byService.map((item) => (
            <div key={item.service.id}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <strong>{item.service.name}</strong>
                <span className="muted">{item.count} wizyt</span>
              </div>
              <div style={{ height: 10, background: "var(--sand-2)", borderRadius: 999, marginTop: 8 }}>
                <div style={{ height: 10, width: `${(item.count / maxCount) * 100}%`, background: "linear-gradient(90deg, var(--gold), var(--ink))", borderRadius: 999 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SettingsTab({ store }: { store: ReturnType<typeof useGroomerStore> }) {
  const salon = store.data.salons[0];
  const [form, setForm] = useState(salon);
  return (
    <div className="card">
      <h3>Ustawienia salonu</h3>
      <div className="form-grid">
        <label className="form-field">
          Nazwa salonu
          <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </label>
        <label className="form-field">
          Miasto
          <input className="input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
        </label>
        <label className="form-field full">
          Adres
          <input className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </label>
        <label className="form-field full">
          Opis
          <textarea className="textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </label>
        <label className="form-field">
          Typ zadatku
          <select className="select" value={form.depositType} onChange={(e) => setForm({ ...form, depositType: e.target.value as "fixed" | "percent" })}>
            <option value="fixed">Stała kwota</option>
            <option value="percent">Procent od ceny</option>
          </select>
        </label>
        <label className="form-field">
          Wartość zadatku
          <input className="input" type="number" value={form.depositValue} onChange={(e) => setForm({ ...form, depositValue: Number(e.target.value) })} />
        </label>
        <label className="form-field">
          Zmiana terminu do ilu godzin przed
          <input className="input" type="number" value={form.rescheduleLimitHours} onChange={(e) => setForm({ ...form, rescheduleLimitHours: Number(e.target.value) })} />
        </label>
      </div>
      <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => store.updateSalon(form)}>
        Zapisz ustawienia
      </button>
    </div>
  );
}

function AppointmentModal({ store, onClose }: { store: ReturnType<typeof useGroomerStore>; onClose: () => void }) {
  const salon = store.data.salons[0];
  const client = store.data.clients[0];
  const pet = store.data.pets.find((item) => item.clientId === client.id) || store.data.pets[0];
  const service = store.data.services[0];
  const employee = store.data.employees[0];
  const [form, setForm] = useState({
    clientId: client.id,
    petId: pet.id,
    serviceId: service.id,
    employeeId: employee.id,
    date: demoDates[0],
    time: demoTimes[0],
    source: "manual" as "manual" | "online",
    notes: ""
  });

  const selectedClient = store.data.clients.find((item) => item.id === form.clientId) || client;
  const pets = store.data.pets.filter((item) => item.clientId === form.clientId);
  const selectedService = store.data.services.find((item) => item.id === form.serviceId) || service;
  const deposit = calculateDeposit(salon, selectedService, selectedClient);

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(event) => event.stopPropagation()}>
        <div className="section-head">
          <div>
            <h2 style={{ marginBottom: 6 }}>Dodaj wizytę</h2>
            <p className="muted">Ręczna rezerwacja z bazy klientów.</p>
          </div>
          <button className="btn btn-outline" onClick={onClose}>Zamknij</button>
        </div>
        <div className="form-grid">
          <label className="form-field">
            Klient
            <select
              className="select"
              value={form.clientId}
              onChange={(e) => {
                const nextPets = store.data.pets.filter((item) => item.clientId === e.target.value);
                setForm({ ...form, clientId: e.target.value, petId: nextPets[0]?.id || "" });
              }}
            >
              {store.data.clients.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </label>
          <label className="form-field">
            Pupil
            <select className="select" value={form.petId} onChange={(e) => setForm({ ...form, petId: e.target.value })}>
              {pets.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </label>
          <label className="form-field">
            Usługa
            <select className="select" value={form.serviceId} onChange={(e) => setForm({ ...form, serviceId: e.target.value })}>
              {store.data.services.map((item) => (
                <option key={item.id} value={item.id}>{item.name} · {formatPrice(item.price)}</option>
              ))}
            </select>
          </label>
          <label className="form-field">
            Pracownik
            <select className="select" value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })}>
              {store.data.employees.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </label>
          <label className="form-field">
            Data
            <select className="select" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}>
              {demoDates.map((date) => <option key={date} value={date}>{formatDate(date)}</option>)}
            </select>
          </label>
          <label className="form-field">
            Godzina
            <select className="select" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })}>
              {demoTimes.map((time) => <option key={time} value={time}>{time}</option>)}
            </select>
          </label>
          <label className="form-field full">
            Notatka
            <textarea className="textarea" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </label>
        </div>
        <div className="card" style={{ marginTop: 16, boxShadow: "none" }}>
          <InfoLine label="Cena" value={formatPrice(selectedService.price)} />
          <InfoLine label="Czas" value={`${selectedService.durationMin} min`} />
          <InfoLine label="Zadatek" value={deposit === 0 ? "Nie wymagany" : formatPrice(deposit)} />
        </div>
        <button
          className="btn btn-primary"
          style={{ width: "100%", marginTop: 16 }}
          onClick={() => {
            store.addAppointment({
              salonId: salon.id,
              clientId: form.clientId,
              petId: form.petId,
              serviceId: form.serviceId,
              employeeId: form.employeeId,
              date: form.date,
              time: form.time,
              durationMin: selectedService.durationMin,
              price: selectedService.price,
              depositAmount: deposit,
              status: deposit > 0 ? "oczekuje_na_zadatek" : "potwierdzona",
              paymentStatus: deposit > 0 ? "oczekuje" : "zwolniony",
              source: "manual",
              notes: form.notes
            });
            onClose();
          }}
        >
          Zapisz wizytę
        </button>
      </div>
    </div>
  );
}

function ServiceModal({ store, onClose }: { store: ReturnType<typeof useGroomerStore>; onClose: () => void }) {
  const salon = store.data.salons[0];
  const [form, setForm] = useState({
    name: "",
    category: "Popularne usługi",
    description: "",
    price: "",
    durationMin: "60",
    depositRequired: true,
    animalSize: "każdy" as Service["animalSize"]
  });
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(event) => event.stopPropagation()}>
        <div className="section-head">
          <h2>Dodaj usługę</h2>
          <button className="btn btn-outline" onClick={onClose}>Zamknij</button>
        </div>
        <div className="form-grid">
          <label className="form-field">
            Nazwa
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label className="form-field">
            Kategoria
            <input className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          </label>
          <label className="form-field">
            Cena
            <input className="input" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </label>
          <label className="form-field">
            Czas min
            <input className="input" type="number" value={form.durationMin} onChange={(e) => setForm({ ...form, durationMin: e.target.value })} />
          </label>
          <label className="form-field full">
            Opis
            <textarea className="textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </label>
          <label className="form-field full" style={{ display: "flex", alignItems: "center", flexDirection: "row", gap: 10 }}>
            <input type="checkbox" checked={form.depositRequired} onChange={(e) => setForm({ ...form, depositRequired: e.target.checked })} />
            Wymagaj zadatku dla tej usługi
          </label>
        </div>
        <button
          className="btn btn-primary"
          style={{ width: "100%", marginTop: 16 }}
          onClick={() => {
            if (!form.name || !form.price) return;
            store.addService({
              salonId: salon.id,
              name: form.name,
              category: form.category,
              description: form.description,
              price: Number(form.price),
              durationMin: Number(form.durationMin),
              depositRequired: form.depositRequired,
              animalSize: form.animalSize,
              active: true
            });
            onClose();
          }}
        >
          Dodaj usługę
        </button>
      </div>
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 14, padding: "10px 0", borderBottom: "1px solid var(--line)" }}>
      <span className="muted">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
