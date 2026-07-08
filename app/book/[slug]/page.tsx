"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, Clock, CreditCard, PawPrint, Plus, Scissors, User } from "lucide-react";
import { calculateDeposit, demoDates, demoTimes, formatDate, formatPrice, useGroomerStore } from "@/lib/store";
import { Service } from "@/lib/types";

export default function BookingPage() {
  const store = useGroomerStore();
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const salon = store.data.salons.find((item) => item.slug === params.slug) || store.data.salons[0];
  const services = store.data.services.filter((item) => item.salonId === salon.id && item.active);
  const employees = store.data.employees.filter((item) => item.salonId === salon.id && item.active);
  const currentClient = store.data.clients[0];
  const currentPets = store.data.pets.filter((pet) => pet.clientId === currentClient.id);

  const [step, setStep] = useState(1);
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id || "");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("any");
  const [selectedDate, setSelectedDate] = useState(demoDates[0]);
  const [selectedTime, setSelectedTime] = useState(demoTimes[0]);
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [selectedPetId, setSelectedPetId] = useState(currentPets[0]?.id || "");
  const [newPet, setNewPet] = useState({ name: "", breed: "", weightKg: "", photo: "" });
  const [clientData, setClientData] = useState({ name: currentClient.name, phone: currentClient.phone, email: currentClient.email });
  const [finishedId, setFinishedId] = useState<string | null>(null);

  useEffect(() => {
    const queryService = searchParams.get("service");
    if (queryService && services.some((service) => service.id === queryService)) {
      setSelectedServiceId(queryService);
    } else if (!selectedServiceId && services[0]) {
      setSelectedServiceId(services[0].id);
    }
  }, [searchParams, selectedServiceId, services]);

  const service = services.find((item) => item.id === selectedServiceId) || services[0];
  const selectedClient = currentClient;
  const deposit = service ? calculateDeposit(salon, service, selectedClient) : 0;
  const employee = selectedEmployeeId === "any" ? employees[0] : employees.find((item) => item.id === selectedEmployeeId) || employees[0];
  const total = service?.price || 0;

  const canContinue = useMemo(() => {
    if (step === 1) return Boolean(service);
    if (step === 2) return Boolean(selectedDate && selectedTime);
    if (step === 3) {
      if (!clientData.name || !clientData.phone) return false;
      if (mode === "existing") return Boolean(selectedPetId);
      return Boolean(newPet.name);
    }
    return true;
  }, [step, service, selectedDate, selectedTime, clientData, mode, selectedPetId, newPet.name]);

  function finishBooking() {
    if (!service || !employee) return;
    let clientId = currentClient.id;
    let petId = selectedPetId;

    if (mode === "new") {
      petId = store.addPet({
        clientId,
        name: newPet.name,
        species: "pies",
        breed: newPet.breed || "Nie podano",
        weightKg: Number(newPet.weightKg || 0),
        age: 1,
        photo: newPet.photo || "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=400&q=80",
        notes: "Dodany podczas rezerwacji online."
      });
    }

    const id = store.addAppointment({
      salonId: salon.id,
      clientId,
      petId,
      serviceId: service.id,
      employeeId: employee.id,
      date: selectedDate,
      time: selectedTime,
      durationMin: service.durationMin,
      price: service.price,
      depositAmount: deposit,
      status: deposit > 0 ? "potwierdzona" : "potwierdzona",
      paymentStatus: deposit > 0 ? "opłacony" : "zwolniony",
      source: "online",
      notes: "Rezerwacja z publicznej strony salonu."
    });
    setFinishedId(id);
    setStep(5);
  }

  if (step === 5) {
    const appointment = store.data.appointments.find((item) => item.id === finishedId);
    return (
      <main className="booking-page">
        <div className="booking-shell">
          <div className="card" style={{ textAlign: "center", padding: 42 }}>
            <CheckCircle2 size={56} color="var(--success)" style={{ margin: "0 auto 18px" }} />
            <h1 style={{ fontSize: 46, marginBottom: 12 }}>Wizyta potwierdzona</h1>
            <p className="lead" style={{ margin: "0 auto 24px" }}>
              Dziękujemy. Rezerwacja trafiła do kalendarza salonu, a zadatek został oznaczony jako opłacony w prototypie.
            </p>
            <div className="card" style={{ boxShadow: "none", textAlign: "left", marginBottom: 20 }}>
              <InfoLine label="Salon" value={salon.name} />
              <InfoLine label="Usługa" value={service?.name || ""} />
              <InfoLine label="Termin" value={`${appointment ? formatDate(appointment.date) : formatDate(selectedDate)}, ${selectedTime}`} />
              <InfoLine label="Cena" value={formatPrice(total)} />
              <InfoLine label="Zadatek" value={deposit > 0 ? formatPrice(deposit) : "Nie wymagany"} />
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link className="btn btn-primary" href="/client">Przejdź do panelu klienta</Link>
              <Link className="btn btn-outline" href={`/salony/${salon.slug}`}>Wróć do salonu</Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="booking-page">
      <div className="booking-shell">
        <Link href={`/salony/${salon.slug}`} className="btn btn-ghost" style={{ paddingLeft: 0 }}>
          <ArrowLeft size={18} /> Wróć do salonu
        </Link>
        <div className="section-head" style={{ marginTop: 16 }}>
          <div>
            <p className="eyebrow">{salon.name}</p>
            <h1 style={{ fontSize: "clamp(40px, 6vw, 58px)", marginBottom: 8 }}>Umów wizytę</h1>
            <p className="muted">Wybierz usługę, termin, pupila i opłać zadatek.</p>
          </div>
        </div>
        <div className="stepper">
          {[1, 2, 3, 4].map((item) => (
            <button
              key={item}
              className={`step ${item <= step ? "active" : ""}`}
              onClick={() => item < step && setStep(item)}
              aria-label={`Krok ${item}`}
              disabled={item > step}
            />
          ))}
        </div>

        <div className="card">
          {step === 1 ? (
            <ServiceStep services={services} selectedId={selectedServiceId} setSelectedId={setSelectedServiceId} />
          ) : null}
          {step === 2 ? (
            <DateStep
              employees={employees}
              selectedEmployeeId={selectedEmployeeId}
              setSelectedEmployeeId={setSelectedEmployeeId}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              selectedTime={selectedTime}
              setSelectedTime={setSelectedTime}
            />
          ) : null}
          {step === 3 ? (
            <ClientPetStep
              pets={currentPets}
              mode={mode}
              setMode={setMode}
              selectedPetId={selectedPetId}
              setSelectedPetId={setSelectedPetId}
              newPet={newPet}
              setNewPet={setNewPet}
              clientData={clientData}
              setClientData={setClientData}
            />
          ) : null}
          {step === 4 && service ? (
            <PaymentStep service={service} salonName={salon.name} deposit={deposit} total={total} selectedDate={selectedDate} selectedTime={selectedTime} />
          ) : null}
        </div>

        <div className="checkout-bar">
          <div>
            <div className="small muted">Łącznie</div>
            <strong style={{ fontSize: 34, letterSpacing: "-.05em" }}>{formatPrice(total)}</strong>
            <div className="small muted">Zadatek teraz: {deposit > 0 ? formatPrice(deposit) : "nie wymagany"}</div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {step > 1 ? <button className="btn btn-outline" onClick={() => setStep(step - 1)}>Wstecz</button> : null}
            {step < 4 ? (
              <button className="btn btn-primary" disabled={!canContinue} onClick={() => canContinue && setStep(step + 1)}>
                Dalej
              </button>
            ) : (
              <button className="btn btn-gold" onClick={finishBooking}>
                <CreditCard size={18} /> {deposit > 0 ? "Zapłać zadatek i rezerwuj" : "Potwierdź wizytę"}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function ServiceStep({ services, selectedId, setSelectedId }: { services: Service[]; selectedId: string; setSelectedId: (id: string) => void }) {
  return (
    <div>
      <h2>Wybierz usługę</h2>
      <div className="choice-grid">
        {services.map((service) => (
          <button className={`choice-card ${selectedId === service.id ? "active" : ""}`} key={service.id} onClick={() => setSelectedId(service.id)}>
            <Scissors color="var(--gold-2)" />
            <h3 style={{ margin: "12px 0 8px" }}>{service.name}</h3>
            <p className="small muted">{service.description}</p>
            <strong>{formatPrice(service.price)}</strong>
            <span className="muted small"> · {service.durationMin} min</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function DateStep({
  employees,
  selectedEmployeeId,
  setSelectedEmployeeId,
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime
}: {
  employees: { id: string; name: string; avatar: string; role: string }[];
  selectedEmployeeId: string;
  setSelectedEmployeeId: (id: string) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  selectedTime: string;
  setSelectedTime: (time: string) => void;
}) {
  return (
    <div>
      <h2>Wybierz pracownika i termin</h2>
      <p className="muted">Możesz wybrać konkretną osobę albo zostawić dowolną dostępną osobę.</p>
      <div className="date-row" style={{ margin: "18px 0" }}>
        <button className={`choice-card ${selectedEmployeeId === "any" ? "active" : ""}`} style={{ minWidth: 130 }} onClick={() => setSelectedEmployeeId("any")}>
          <User />
          <strong>Dowolna osoba</strong>
        </button>
        {employees.map((employee) => (
          <button className={`choice-card ${selectedEmployeeId === employee.id ? "active" : ""}`} style={{ minWidth: 130 }} key={employee.id} onClick={() => setSelectedEmployeeId(employee.id)}>
            <img className="avatar" src={employee.avatar} alt={employee.name} />
            <strong>{employee.name}</strong>
            <div className="small muted">{employee.role}</div>
          </button>
        ))}
      </div>
      <h3>Data</h3>
      <div className="date-row">
        {demoDates.map((date) => (
          <button className={`pill-date ${selectedDate === date ? "active" : ""}`} key={date} onClick={() => setSelectedDate(date)}>
            <span>{new Intl.DateTimeFormat("pl-PL", { weekday: "short" }).format(new Date(`${date}T00:00:00`))}</span>
            <br />
            <strong>{date.slice(8, 10)}</strong>
          </button>
        ))}
      </div>
      <h3 style={{ marginTop: 18 }}>Godzina</h3>
      <div className="time-row">
        {demoTimes.map((time) => (
          <button className={`pill-time ${selectedTime === time ? "active" : ""}`} key={time} onClick={() => setSelectedTime(time)}>
            {time}
          </button>
        ))}
      </div>
    </div>
  );
}

function ClientPetStep({
  pets,
  mode,
  setMode,
  selectedPetId,
  setSelectedPetId,
  newPet,
  setNewPet,
  clientData,
  setClientData
}: {
  pets: { id: string; name: string; breed: string; photo: string; weightKg: number }[];
  mode: "existing" | "new";
  setMode: (mode: "existing" | "new") => void;
  selectedPetId: string;
  setSelectedPetId: (id: string) => void;
  newPet: { name: string; breed: string; weightKg: string; photo: string };
  setNewPet: (pet: { name: string; breed: string; weightKg: string; photo: string }) => void;
  clientData: { name: string; phone: string; email: string };
  setClientData: (data: { name: string; phone: string; email: string }) => void;
}) {
  return (
    <div>
      <h2>Dane klienta i pupil</h2>
      <div className="form-grid">
        <label className="form-field">
          Imię i nazwisko
          <input className="input" value={clientData.name} onChange={(e) => setClientData({ ...clientData, name: e.target.value })} />
        </label>
        <label className="form-field">
          Telefon
          <input className="input" value={clientData.phone} onChange={(e) => setClientData({ ...clientData, phone: e.target.value })} />
        </label>
        <label className="form-field full">
          E-mail
          <input className="input" value={clientData.email} onChange={(e) => setClientData({ ...clientData, email: e.target.value })} />
        </label>
      </div>
      <div className="tabs" style={{ margin: "22px 0" }}>
        <button className={mode === "existing" ? "active" : ""} onClick={() => setMode("existing")}>Wybierz pupila</button>
        <button className={mode === "new" ? "active" : ""} onClick={() => setMode("new")}><Plus size={14} /> Dodaj nowego</button>
      </div>
      {mode === "existing" ? (
        <div className="choice-grid">
          {pets.map((pet) => (
            <button className={`choice-card ${selectedPetId === pet.id ? "active" : ""}`} key={pet.id} onClick={() => setSelectedPetId(pet.id)}>
              <img className="pet-avatar" src={pet.photo} alt={pet.name} />
              <h3 style={{ margin: "12px 0 4px" }}>{pet.name}</h3>
              <p className="muted small">{pet.breed} · {pet.weightKg} kg</p>
            </button>
          ))}
        </div>
      ) : (
        <div className="form-grid">
          <label className="form-field">
            Imię pupila
            <input className="input" value={newPet.name} onChange={(e) => setNewPet({ ...newPet, name: e.target.value })} />
          </label>
          <label className="form-field">
            Rasa
            <input className="input" value={newPet.breed} onChange={(e) => setNewPet({ ...newPet, breed: e.target.value })} />
          </label>
          <label className="form-field">
            Waga kg
            <input className="input" type="number" value={newPet.weightKg} onChange={(e) => setNewPet({ ...newPet, weightKg: e.target.value })} />
          </label>
          <label className="form-field">
            URL zdjęcia pupila
            <input className="input" value={newPet.photo} onChange={(e) => setNewPet({ ...newPet, photo: e.target.value })} />
          </label>
        </div>
      )}
    </div>
  );
}

function PaymentStep({ service, salonName, deposit, total, selectedDate, selectedTime }: { service: Service; salonName: string; deposit: number; total: number; selectedDate: string; selectedTime: string }) {
  return (
    <div>
      <h2>Podsumowanie i zadatek</h2>
      <div className="card" style={{ boxShadow: "none", marginBottom: 18 }}>
        <InfoLine label="Salon" value={salonName} />
        <InfoLine label="Usługa" value={service.name} />
        <InfoLine label="Termin" value={`${formatDate(selectedDate)}, ${selectedTime}`} />
        <InfoLine label="Czas" value={`${service.durationMin} min`} />
        <InfoLine label="Cena" value={formatPrice(total)} />
        <InfoLine label="Zadatek teraz" value={deposit > 0 ? formatPrice(deposit) : "Nie wymagany"} />
      </div>
      <div className="card" style={{ boxShadow: "none", background: "rgba(247,241,232,.65)" }}>
        <CreditCard color="var(--gold-2)" />
        <h3 style={{ marginTop: 12 }}>Symulowana płatność</h3>
        <p className="muted">W tym prototypie płatność nie łączy się z bramką płatniczą. Kliknięcie przycisku oznaczy zadatek jako opłacony i doda wizytę do kalendarza.</p>
      </div>
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 14, padding: "11px 0", borderBottom: "1px solid var(--line)" }}>
      <span className="muted">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
