"use client";

import Link from "next/link";
import React, { useState } from "react";
import {
  BarChart3,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  CreditCard,
  Home,
  Edit3,
  ImagePlus,
  LogOut,
  PawPrint,
  Plus,
  MoreHorizontal,
  X,
  RefreshCcw,
  Scissors,
  Settings,
  Star,
  Trash2,
  Users,
} from "lucide-react";
import { Logo, StatusBadge } from "@/components/Common";
import {
  calculateDeposit,
  demoDates,
  demoTimes,
  endTime,
  findAvailableEmployee,
  formatDate,
  formatPrice,
  hasEmployeeConflict,
  minutesFromTime,
  isEmployeeAvailable,
  isWithinWorkingDay,
  rangesOverlap,
  useGroomerStore,
} from "@/lib/store";
import { Appointment, Client, Service } from "@/lib/types";

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
  { id: "settings", label: "Ustawienia", icon: Settings },
];

type CalendarView = "day" | "week" | "month";

type DragPreview = {
  appointmentId: string;
  date: string;
  time: string;
  employeeId?: string;
  valid: boolean;
} | null;
type DragPoint = { x: number; y: number } | null;

function dateObj(iso: string) {
  return new Date(`${iso}T00:00:00`);
}

function toIsoDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function shiftIsoDate(iso: string, amount: number) {
  const next = dateObj(iso);
  next.setDate(next.getDate() + amount);
  return toIsoDate(next);
}

function weekDates(iso: string) {
  const base = dateObj(iso);
  const day = base.getDay() || 7;
  base.setDate(base.getDate() - day + 1);
  return Array.from({ length: 7 }, (_, index) => {
    const next = new Date(base);
    next.setDate(base.getDate() + index);
    return toIsoDate(next);
  });
}

function monthCells(iso: string) {
  const base = dateObj(iso);
  const first = new Date(base.getFullYear(), base.getMonth(), 1);
  const startOffset = (first.getDay() + 6) % 7;
  const start = new Date(first);
  start.setDate(first.getDate() - startOffset);
  return Array.from({ length: 42 }, (_, index) => {
    const next = new Date(start);
    next.setDate(start.getDate() + index);
    return toIsoDate(next);
  });
}

function dayLabel(iso: string) {
  return new Intl.DateTimeFormat("pl-PL", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  }).format(dateObj(iso));
}

function monthLabel(iso: string) {
  return new Intl.DateTimeFormat("pl-PL", {
    month: "long",
    year: "numeric",
  }).format(dateObj(iso));
}

function timeFromMinutesLocal(total: number) {
  const hh = String(Math.floor(total / 60)).padStart(2, "0");
  const mm = String(total % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

export default function GroomerPanel() {
  const store = useGroomerStore();
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [appointmentInitial, setAppointmentInitial] =
    useState<Partial<Appointment> | null>(null);
  const [editAppointmentId, setEditAppointmentId] = useState<string | null>(
    null,
  );
  const [serviceModalOpen, setServiceModalOpen] = useState(false);

  function openAppointment(initial?: Partial<Appointment>) {
    setAppointmentInitial(initial || null);
    setAppointmentModalOpen(true);
  }
  const salon = store.data.salons[0];
  const employees = store.data.employees.filter(
    (item) => item.salonId === salon.id,
  );
  const services = store.data.services.filter(
    (item) => item.salonId === salon.id,
  );
  const appointments = store.data.appointments.filter(
    (item) => item.salonId === salon.id,
  );

  const content = {
    dashboard: (
      <Dashboard
        store={store}
        openAppointment={() => openAppointment()}
        openEdit={setEditAppointmentId}
      />
    ),
    calendar: (
      <CalendarBoard
        store={store}
        openAppointment={openAppointment}
        openEdit={setEditAppointmentId}
      />
    ),
    appointments: (
      <AppointmentsTab
        store={store}
        openAppointment={() => openAppointment()}
        openEdit={setEditAppointmentId}
      />
    ),
    clients: <ClientsTab store={store} />,
    pets: <PetsTab store={store} />,
    services: (
      <ServicesTab
        store={store}
        openService={() => setServiceModalOpen(true)}
      />
    ),
    employees: <EmployeesTab store={store} />,
    reviews: <ReviewsTab store={store} />,
    reports: <ReportsTab store={store} />,
    settings: <SettingsTab store={store} />,
  }[activeTab];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Logo dark />
        <div
          className="small muted"
          style={{ color: "rgba(255,255,255,.58)", marginTop: -14 }}
        >
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
          <img
            className="avatar"
            src={employees[0]?.avatar}
            alt="Właścicielka"
          />
          <div>
            <strong>{salon.ownerName}</strong>
            <div className="small" style={{ color: "rgba(255,255,255,.58)" }}>
              Właścicielka
            </div>
          </div>
        </div>
        <Link
          href="/"
          className="btn btn-outline"
          style={{ color: "#fff", borderColor: "rgba(255,255,255,.18)" }}
        >
          <LogOut size={16} /> Wyjdź z panelu
        </Link>
      </aside>
      <main className="main-panel">
        <div className="panel-header">
          <div>
            <h1 className="panel-title">
              {tabs.find((item) => item.id === activeTab)?.label}
            </h1>
            <p className="muted" style={{ marginTop: 8 }}>
              Demo działa bez bazy danych. Zmiany zapisują się lokalnie w
              przeglądarce.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link className="btn btn-outline" href={`/salony/${salon.slug}`}>
              Strona salonu
            </Link>
            <button className="btn btn-outline" onClick={store.reset}>
              <RefreshCcw size={16} /> Reset danych
            </button>
            <button
              className="btn btn-primary"
              onClick={() => openAppointment()}
            >
              <Plus size={18} /> Dodaj wizytę
            </button>
          </div>
        </div>
        {content}
      </main>
      <MobileTabBar
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      {appointmentModalOpen ? (
        <AppointmentModal
          store={store}
          initial={appointmentInitial}
          onClose={() => setAppointmentModalOpen(false)}
        />
      ) : null}
      {editAppointmentId ? (
        <EditAppointmentModal
          store={store}
          appointmentId={editAppointmentId}
          onClose={() => setEditAppointmentId(null)}
        />
      ) : null}
      {serviceModalOpen ? (
        <ServiceModal
          store={store}
          onClose={() => setServiceModalOpen(false)}
        />
      ) : null}
    </div>
  );
}

function Dashboard({
  store,
  openAppointment,
  openEdit,
}: {
  store: ReturnType<typeof useGroomerStore>;
  openAppointment: () => void;
  openEdit: (id: string) => void;
}) {
  const salon = store.data.salons[0];
  const appointments = store.data.appointments.filter(
    (item) => item.salonId === salon.id,
  );
  const services = store.data.services.filter(
    (item) => item.salonId === salon.id,
  );
  const today = "2026-07-10";
  const todayAppointments = appointments.filter((item) => item.date === today);
  const revenue = appointments
    .filter((item) => item.status !== "anulowana")
    .reduce((sum, item) => sum + item.price, 0);
  const deposits = appointments
    .filter((item) => item.paymentStatus === "opłacony")
    .reduce((sum, item) => sum + item.depositAmount, 0);

  return (
    <div className="table-list">
      <div className="grid-3">
        <KpiCard
          icon={CalendarDays}
          title="Wizyty"
          value={appointments.length.toString()}
          text="łącznie w demo"
        />
        <KpiCard
          icon={CreditCard}
          title="Zadatki"
          value={formatPrice(deposits)}
          text="opłacone online"
        />
        <KpiCard
          icon={BarChart3}
          title="Przychód"
          value={formatPrice(revenue)}
          text="z aktywnych wizyt"
        />
      </div>
      <div className="grid-2">
        <div className="card">
          <div className="section-head" style={{ marginBottom: 12 }}>
            <div>
              <h3>Dzisiejsze wizyty</h3>
              <p className="muted small">{formatDate(today)}</p>
            </div>
            <button
              className="btn btn-small btn-primary"
              onClick={openAppointment}
            >
              <Plus size={15} /> Nowa
            </button>
          </div>
          <div className="table-list">
            {todayAppointments.map((appointment) => (
              <AppointmentRow
                key={appointment.id}
                store={store}
                appointment={appointment}
                openEdit={openEdit}
              />
            ))}
          </div>
        </div>
        <div className="card">
          <h3>Skrót salonu</h3>
          <div className="table-list">
            <InfoLine label="Pakiet" value={salon.package.toUpperCase()} />
            <InfoLine label="Usługi" value={services.length.toString()} />
            <InfoLine
              label="Klienci"
              value={store.data.clients.length.toString()}
            />
            <InfoLine
              label="Pupile"
              value={store.data.pets.length.toString()}
            />
            <InfoLine
              label="Zadatek"
              value={
                salon.depositType === "fixed"
                  ? formatPrice(salon.depositValue)
                  : `${salon.depositValue}%`
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  title,
  value,
  text,
}: {
  icon: React.ElementType;
  title: string;
  value: string;
  text: string;
}) {
  return (
    <div className="card">
      <Icon color="var(--gold-2)" />
      <p className="muted" style={{ margin: "14px 0 0" }}>
        {title}
      </p>
      <div className="kpi">{value}</div>
      <p className="small muted">{text}</p>
    </div>
  );
}

function CalendarBoard({
  store,
  openAppointment,
  openEdit,
}: {
  store: ReturnType<typeof useGroomerStore>;
  openAppointment: (initial?: Partial<Appointment>) => void;
  openEdit: (id: string) => void;
}) {
  const salon = store.data.salons[0];
  const employees = store.data.employees.filter(
    (item) => item.salonId === salon.id && item.active,
  );
  const appointments = store.data.appointments.filter(
    (item) => item.salonId === salon.id,
  );
  const [view, setView] = useState<CalendarView>("week");
  const [selectedDate, setSelectedDate] = useState(demoDates[0]);
  const [hoverSlot, setHoverSlot] = useState<string | null>(null);
  const [dragPreview, setDragPreview] = useState<DragPreview>(null);
  const [dragPoint, setDragPoint] = useState<DragPoint>(null);
  const [draggedAppointmentId, setDraggedAppointmentId] = useState<
    string | null
  >(null);
  const [calendarMessage, setCalendarMessage] = useState("");
  const visibleDates =
    view === "week" ? weekDates(selectedDate) : [selectedDate];
  const currentMonth = dateObj(selectedDate).getMonth();
  const dayStartMin = 9 * 60;
  const dayEndMin = 18 * 60;
  const dayRangeMin = dayEndMin - dayStartMin;
  const dayHourLabels = Array.from(
    { length: 10 },
    (_, index) => `${String(9 + index).padStart(2, "0")}:00`,
  );

  function dayPosition(time: string, durationMin = 0): React.CSSProperties {
    const top = ((minutesFromTime(time) - dayStartMin) / dayRangeMin) * 100;
    const height = durationMin
      ? Math.max(6, (durationMin / dayRangeMin) * 100)
      : 0;
    return durationMin
      ? {
          top: `${Math.max(0, top)}%`,
          height: `max(58px, calc(${height}% - 8px))`,
        }
      : { top: `${Math.max(0, top)}%` };
  }

  function slotPosition(time: string): React.CSSProperties {
    const top = ((minutesFromTime(time) - dayStartMin) / dayRangeMin) * 100;
    const height = (15 / dayRangeMin) * 100;
    return { top: `${Math.max(0, top)}%`, height: `calc(${height}% + 1px)` };
  }

  function timeFromPointer(event: React.DragEvent<HTMLElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const y = Math.min(Math.max(event.clientY - rect.top, 0), rect.height);
    const rawMinutes = dayStartMin + (y / rect.height) * dayRangeMin;
    const rounded = Math.round(rawMinutes / 15) * 15;
    const clamped = Math.min(Math.max(rounded, dayStartMin), dayEndMin - 15);
    return timeFromMinutesLocal(clamped);
  }

  function getDraggedAppointmentId(event?: React.DragEvent<HTMLElement>) {
    // Safari często nie pozwala odczytać dataTransfer.getData() w trakcie dragOver,
    // dlatego trzymamy aktywną wizytę także w stanie Reacta.
    return (
      event?.dataTransfer.getData("appointmentId") || draggedAppointmentId || ""
    );
  }

  function clearDragState() {
    setHoverSlot(null);
    setDragPreview(null);
    setDragPoint(null);
    setDraggedAppointmentId(null);
  }

  function updateDragPreview(
    event: React.DragEvent<HTMLElement>,
    date: string,
    employeeId?: string,
    fixedTime?: string,
  ) {
    const appointmentId = getDraggedAppointmentId(event);
    if (!appointmentId) return;
    const appointment = appointments.find((item) => item.id === appointmentId);
    if (!appointment) return;
    const time = fixedTime || timeFromPointer(event);
    const targetEmployeeId = employeeId || appointment.employeeId;
    const valid =
      isWithinWorkingDay(time, appointment.durationMin) &&
      !hasEmployeeConflict(
        appointments,
        targetEmployeeId,
        date,
        time,
        appointment.durationMin,
        appointment.id,
      );
    setDragPoint({ x: event.clientX, y: event.clientY });
    setDragPreview({
      appointmentId,
      date,
      time,
      employeeId: targetEmployeeId,
      valid,
    });
    setHoverSlot(`${date}-${time}-${targetEmployeeId}`);
  }

  function getAppointments(date: string, time?: string, employeeId?: string) {
    return appointments.filter((item) => {
      if (item.status === "anulowana") return false;
      if (item.date !== date) return false;
      if (time && item.time !== time) return false;
      if (employeeId && item.employeeId !== employeeId) return false;
      return true;
    });
  }

  function handleDrop(
    event: React.DragEvent,
    date: string,
    time: string,
    employeeId?: string,
  ) {
    event.preventDefault();
    const appointmentId = getDraggedAppointmentId(
      event as React.DragEvent<HTMLElement>,
    );
    const appointment = appointments.find((item) => item.id === appointmentId);
    if (!appointment) return;
    const targetEmployeeId = employeeId || appointment.employeeId;
    if (!isWithinWorkingDay(time, appointment.durationMin)) {
      setCalendarMessage(
        "Nie można przenieść wizyty — wybrana usługa nie mieści się w godzinach pracy salonu.",
      );
      clearDragState();
      return;
    }
    if (
      hasEmployeeConflict(
        appointments,
        targetEmployeeId,
        date,
        time,
        appointment.durationMin,
        appointment.id,
      )
    ) {
      setCalendarMessage(
        "Nie można przenieść wizyty — ten pracownik ma już wizytę w tym czasie.",
      );
      clearDragState();
      return;
    }
    store.moveAppointment(appointmentId, date, time, targetEmployeeId);
    setCalendarMessage("");
    clearDragState();
  }

  function goPrevious() {
    setSelectedDate((current) => {
      if (view === "month") {
        const next = dateObj(current);
        next.setMonth(next.getMonth() - 1);
        return toIsoDate(next);
      }
      return shiftIsoDate(current, view === "week" ? -7 : -1);
    });
  }

  function goNext() {
    setSelectedDate((current) => {
      if (view === "month") {
        const next = dateObj(current);
        next.setMonth(next.getMonth() + 1);
        return toIsoDate(next);
      }
      return shiftIsoDate(current, view === "week" ? 7 : 1);
    });
  }

  return (
    <div className="card">
      <div className="section-head calendar-heading">
        <div>
          <h3>
            {view === "month"
              ? monthLabel(selectedDate)
              : view === "day"
                ? formatDate(selectedDate)
                : "Widok tygodniowy"}
          </h3>
          <p className="muted">
            Klikaj dzień/tydzień/miesiąc, przeciągaj wizyty, albo kliknij kartę
            wizyty, żeby ją edytować.
          </p>
        </div>
        <div className="calendar-actions">
          <div className="calendar-nav-group">
            <button
              className="btn btn-outline btn-icon"
              onClick={goPrevious}
              aria-label="Poprzedni zakres"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              className="btn btn-outline"
              onClick={() => setSelectedDate(demoDates[0])}
            >
              Dziś
            </button>
            <button
              className="btn btn-outline btn-icon"
              onClick={goNext}
              aria-label="Następny zakres"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="tabs">
            <button
              className={view === "day" ? "active" : ""}
              onClick={() => setView("day")}
            >
              Dzień
            </button>
            <button
              className={view === "week" ? "active" : ""}
              onClick={() => setView("week")}
            >
              Tydzień
            </button>
            <button
              className={view === "month" ? "active" : ""}
              onClick={() => setView("month")}
            >
              Miesiąc
            </button>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => openAppointment({ date: selectedDate })}
          >
            <Plus size={18} /> Dodaj wizytę
          </button>
        </div>
      </div>
      {calendarMessage ? (
        <div className="inline-alert danger" style={{ marginBottom: 16 }}>
          {calendarMessage}
        </div>
      ) : null}

      {view === "month" ? (
        <div className="month-grid">
          {["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Niedz"].map((day) => (
            <div className="month-weekday" key={day}>
              {day}
            </div>
          ))}
          {monthCells(selectedDate).map((date) => {
            const dayAppointments = getAppointments(date);
            const inactive = dateObj(date).getMonth() !== currentMonth;
            const isSelected = date === selectedDate;
            return (
              <button
                key={date}
                className={`month-cell ${inactive ? "inactive" : ""} ${isSelected ? "active" : ""}`}
                onClick={() => {
                  setSelectedDate(date);
                  setView("day");
                }}
              >
                <span className="month-day-number">
                  {dateObj(date).getDate()}
                </span>
                {dayAppointments.length ? (
                  <span className="badge">{dayAppointments.length} wiz.</span>
                ) : (
                  <span className="small muted">wolne</span>
                )}
                <div className="month-appointments">
                  {dayAppointments.slice(0, 3).map((appointment) => {
                    const pet = store.data.pets.find(
                      (item) => item.id === appointment.petId,
                    );
                    return (
                      <span key={appointment.id}>
                        {appointment.time} {pet?.name}
                      </span>
                    );
                  })}
                </div>
              </button>
            );
          })}
        </div>
      ) : null}

      {view === "day" ? (
        <div className="calendar-wrap">
          <div
            className="day-planner"
            style={{
              gridTemplateColumns: `90px repeat(${Math.max(1, employees.length)}, minmax(240px, 1fr))`,
            }}
          >
            <div className="day-planner-head time-head">Godz.</div>
            {employees.map((employee) => (
              <div
                className="day-planner-head employee-header"
                key={employee.id}
              >
                <img
                  className="avatar"
                  src={employee.avatar}
                  alt={employee.name}
                />
                <div>
                  {employee.name}
                  <div className="muted small">{employee.role}</div>
                </div>
              </div>
            ))}
            <div className="day-time-rail">
              {dayHourLabels.map((time) => (
                <div
                  className="day-time-label"
                  key={time}
                  style={dayPosition(time)}
                >
                  {time}
                </div>
              ))}
            </div>
            {employees.map((employee) => {
              const employeeAppointments = appointments
                .filter(
                  (item) =>
                    item.status !== "anulowana" &&
                    item.date === selectedDate &&
                    item.employeeId === employee.id,
                )
                .sort(
                  (a, b) => minutesFromTime(a.time) - minutesFromTime(b.time),
                );

              return (
                <div
                  className="day-employee-column"
                  key={employee.id}
                  onDragOver={(event) => {
                    event.preventDefault();
                    updateDragPreview(event, selectedDate, employee.id);
                  }}
                  onDragLeave={(event) => {
                    if (
                      !event.currentTarget.contains(
                        event.relatedTarget as Node | null,
                      )
                    ) {
                      setHoverSlot(null);
                    }
                  }}
                  onDrop={(event) => {
                    const time = timeFromPointer(event);
                    handleDrop(event, selectedDate, time, employee.id);
                  }}
                >
                  {dayHourLabels.map((time) => (
                    <div
                      className="day-hour-line"
                      key={time}
                      style={dayPosition(time)}
                    />
                  ))}

                  {demoTimes.map((time) => {
                    const id = `${selectedDate}-${time}-${employee.id}`;
                    const isBusy = hasEmployeeConflict(
                      appointments,
                      employee.id,
                      selectedDate,
                      time,
                      1,
                    );
                    if (isBusy) return null;
                    return (
                      <button
                        key={id}
                        className={`day-free-slot ${hoverSlot === id ? "drop-hover" : ""}`}
                        style={slotPosition(time)}
                        onClick={() =>
                          openAppointment({
                            date: selectedDate,
                            time,
                            employeeId: employee.id,
                          })
                        }
                        onDragOver={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          updateDragPreview(
                            event,
                            selectedDate,
                            employee.id,
                            time,
                          );
                        }}
                        onDragLeave={() => setHoverSlot(null)}
                        onDrop={(event) => {
                          event.stopPropagation();
                          handleDrop(event, selectedDate, time, employee.id);
                        }}
                        title="Kliknij, aby dodać wizytę w tym slocie"
                      >
                        + {time}
                      </button>
                    );
                  })}

                  {dragPreview?.date === selectedDate &&
                  dragPreview.employeeId === employee.id
                    ? (() => {
                        const moving = appointments.find(
                          (item) => item.id === dragPreview.appointmentId,
                        );
                        return moving ? (
                          <div
                            className={`day-appointment-position drag-live-preview ${dragPreview.valid ? "" : "invalid"}`}
                            style={dayPosition(
                              dragPreview.time,
                              moving.durationMin,
                            )}
                          >
                            <CalendarAppointment
                              store={store}
                              appointment={{
                                ...moving,
                                date: dragPreview.date,
                                time: dragPreview.time,
                                employeeId: employee.id,
                              }}
                              openEdit={openEdit}
                              showEmployee
                              preview
                            />
                          </div>
                        ) : null;
                      })()
                    : null}

                  {employeeAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="day-appointment-position"
                      style={dayPosition(
                        appointment.time,
                        appointment.durationMin,
                      )}
                    >
                      <CalendarAppointment
                        store={store}
                        appointment={appointment}
                        openEdit={openEdit}
                        isDragging={
                          dragPreview?.appointmentId === appointment.id ||
                          draggedAppointmentId === appointment.id
                        }
                        onDragStart={(id) => setDraggedAppointmentId(id)}
                        onDragEnd={clearDragState}
                      />
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {view === "week" ? (
        <div className="calendar-wrap">
          <div className="calendar-grid">
            <div className="calendar-cell header">Godz.</div>
            {visibleDates.map((date) => (
              <button
                className={`calendar-cell header calendar-date-head ${date === selectedDate ? "active" : ""}`}
                key={date}
                onClick={() => setSelectedDate(date)}
              >
                <div>
                  <div>
                    {new Intl.DateTimeFormat("pl-PL", {
                      weekday: "short",
                    }).format(dateObj(date))}
                  </div>
                  <div className="muted small">{dayLabel(date)}</div>
                </div>
              </button>
            ))}
            {demoTimes.map((time) => (
              <React.Fragment key={time}>
                <div className="calendar-cell time">{time}</div>
                {visibleDates.map((date) => {
                  const id = `${date}-${time}`;
                  const inSlot = getAppointments(date, time);
                  return (
                    <button
                      key={id}
                      className={`calendar-cell slot-button ${hoverSlot === id ? "drop-hover" : ""}`}
                      onClick={() => openAppointment({ date, time })}
                      onDragOver={(event) => {
                        event.preventDefault();
                        updateDragPreview(event, date, undefined, time);
                        setHoverSlot(id);
                      }}
                      onDragLeave={() => setHoverSlot(null)}
                      onDrop={(event) => handleDrop(event, date, time)}
                      title="Kliknij, aby dodać wizytę w tym slocie"
                    >
                      <div className="table-list">
                        {dragPreview?.date === date && dragPreview.time === time
                          ? (() => {
                              const moving = appointments.find(
                                (item) => item.id === dragPreview.appointmentId,
                              );
                              return moving ? (
                                <CalendarAppointment
                                  key={`preview-${moving.id}-${date}-${time}`}
                                  store={store}
                                  appointment={{
                                    ...moving,
                                    date,
                                    time,
                                    employeeId:
                                      dragPreview.employeeId ||
                                      moving.employeeId,
                                  }}
                                  openEdit={openEdit}
                                  showEmployee
                                  preview
                                />
                              ) : null;
                            })()
                          : null}
                        {inSlot.length ? (
                          inSlot.map((appointment) => (
                            <CalendarAppointment
                              key={appointment.id}
                              store={store}
                              appointment={appointment}
                              openEdit={openEdit}
                              showEmployee
                              isDragging={
                                dragPreview?.appointmentId === appointment.id ||
                                draggedAppointmentId === appointment.id
                              }
                              onDragStart={(id) => setDraggedAppointmentId(id)}
                              onDragEnd={clearDragState}
                            />
                          ))
                        ) : dragPreview?.date === date &&
                          dragPreview.time === time ? null : (
                          <span className="empty-slot">+</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      ) : null}

      {dragPreview && dragPoint
        ? (() => {
            const moving = appointments.find(
              (item) => item.id === dragPreview.appointmentId,
            );
            return moving ? (
              <div
                className={`floating-drag-preview ${dragPreview.valid ? "" : "invalid"}`}
                style={{ left: dragPoint.x + 18, top: dragPoint.y + 18 }}
              >
                <CalendarAppointment
                  store={store}
                  appointment={{
                    ...moving,
                    date: dragPreview.date,
                    time: dragPreview.time,
                    employeeId: dragPreview.employeeId || moving.employeeId,
                  }}
                  openEdit={openEdit}
                  showEmployee
                  preview
                />
                <div className="floating-drag-caption">
                  {dragPreview.valid ? "Nowy termin" : "Termin niedostępny"}:{" "}
                  {dragPreview.time}
                </div>
              </div>
            ) : null;
          })()
        : null}
    </div>
  );
}

function CalendarAppointment({
  store,
  appointment,
  openEdit,
  showEmployee = false,
  isDragging = false,
  preview = false,
  onDragEnd,
  onDragStart,
}: {
  store: ReturnType<typeof useGroomerStore>;
  appointment: Appointment;
  openEdit: (id: string) => void;
  showEmployee?: boolean;
  isDragging?: boolean;
  preview?: boolean;
  onDragEnd?: () => void;
  onDragStart?: (id: string) => void;
}) {
  const service = store.data.services.find(
    (item) => item.id === appointment.serviceId,
  );
  const pet = store.data.pets.find((item) => item.id === appointment.petId);
  const client = store.data.clients.find(
    (item) => item.id === appointment.clientId,
  );
  const employee = store.data.employees.find(
    (item) => item.id === appointment.employeeId,
  );
  return (
    <div
      className={`appointment-card ${employee?.color || ""} ${isDragging ? "is-dragging" : ""} ${preview ? "is-preview" : ""}`}
      draggable={!preview}
      onDragStart={(event) => {
        event.stopPropagation();
        event.dataTransfer.setData("appointmentId", appointment.id);
        event.dataTransfer.effectAllowed = "move";
        const transparentDragImage = document.createElement("canvas");
        transparentDragImage.width = 1;
        transparentDragImage.height = 1;
        event.dataTransfer.setDragImage(transparentDragImage, 0, 0);
        onDragStart?.(appointment.id);
      }}
      onDragEnd={onDragEnd}
      onClick={(event) => {
        event.stopPropagation();
        if (!preview) openEdit(appointment.id);
      }}
      title="Kliknij, żeby edytować. Przeciągnij, żeby zmienić termin."
    >
      <strong>
        {appointment.time} -{" "}
        {endTime(appointment.time, appointment.durationMin)}
      </strong>
      <div>
        {pet?.name} · {service?.name}
      </div>
      <div className="muted">{client?.name}</div>
      {showEmployee ? (
        <div className="muted employee-line">Pracownik: {employee?.name}</div>
      ) : null}
    </div>
  );
}

function AppointmentsTab({
  store,
  openAppointment,
  openEdit,
}: {
  store: ReturnType<typeof useGroomerStore>;
  openAppointment: () => void;
  openEdit: (id: string) => void;
}) {
  const salon = store.data.salons[0];
  const appointments = [...store.data.appointments]
    .filter((item) => item.salonId === salon.id)
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));

  return (
    <div className="card">
      <div className="section-head">
        <div>
          <h3>Lista wizyt</h3>
          <p className="muted">
            Szybka edycja statusu, płatności i anulowanie.
          </p>
        </div>
        <button className="btn btn-primary" onClick={openAppointment}>
          <Plus size={18} /> Dodaj wizytę
        </button>
      </div>
      <div className="table-list">
        {appointments.map((appointment) => (
          <AppointmentRow
            key={appointment.id}
            store={store}
            appointment={appointment}
            openEdit={openEdit}
          />
        ))}
      </div>
    </div>
  );
}

function AppointmentRow({
  store,
  appointment,
  openEdit,
}: {
  store: ReturnType<typeof useGroomerStore>;
  appointment: Appointment;
  openEdit?: (id: string) => void;
}) {
  const service = store.data.services.find(
    (item) => item.id === appointment.serviceId,
  );
  const pet = store.data.pets.find((item) => item.id === appointment.petId);
  const client = store.data.clients.find(
    (item) => item.id === appointment.clientId,
  );
  const employee = store.data.employees.find(
    (item) => item.id === appointment.employeeId,
  );

  return (
    <div className="list-row">
      <img className="pet-avatar" src={pet?.photo} alt={pet?.name || "Pupil"} />
      <div>
        <strong>{service?.name}</strong>
        <div className="small muted">
          {formatDate(appointment.date)} · {appointment.time} -{" "}
          {endTime(appointment.time, appointment.durationMin)} ·{" "}
          {employee?.name}
        </div>
        <div className="small muted">
          {client?.name} · pupil: {pet?.name}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          flexWrap: "wrap",
          justifyContent: "flex-end",
        }}
      >
        <StatusBadge status={appointment.status} />
        <StatusBadge status={appointment.paymentStatus} />
        {openEdit ? (
          <button
            className="btn btn-small btn-outline"
            onClick={() => openEdit(appointment.id)}
          >
            <Edit3 size={14} /> Edytuj
          </button>
        ) : null}
        {appointment.paymentStatus === "oczekuje" ? (
          <button
            className="btn btn-small btn-primary"
            onClick={() => store.payDeposit(appointment.id)}
          >
            Oznacz opłacone
          </button>
        ) : null}
        {appointment.status !== "anulowana" ? (
          <button
            className="btn btn-small btn-outline"
            onClick={() => store.cancelAppointment(appointment.id)}
          >
            Anuluj
          </button>
        ) : null}
      </div>
    </div>
  );
}

function ClientsTab({ store }: { store: ReturnType<typeof useGroomerStore> }) {
  const [query, setQuery] = useState("");
  const [newClient, setNewClient] = useState({
    name: "",
    phone: "",
    email: "",
  });
  const clients = store.data.clients.filter((client) =>
    `${client.name} ${client.email} ${client.phone}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  return (
    <div className="grid-2">
      <div className="card">
        <h3>Baza klientów</h3>
        <input
          className="input"
          placeholder="Szukaj klienta..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
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
            <input
              className="input"
              value={newClient.name}
              onChange={(e) =>
                setNewClient({ ...newClient, name: e.target.value })
              }
            />
          </label>
          <label className="form-field">
            Telefon
            <input
              className="input"
              value={newClient.phone}
              onChange={(e) =>
                setNewClient({ ...newClient, phone: e.target.value })
              }
            />
          </label>
          <label className="form-field">
            E-mail
            <input
              className="input"
              value={newClient.email}
              onChange={(e) =>
                setNewClient({ ...newClient, email: e.target.value })
              }
            />
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
              marketingConsent: false,
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

function ClientCard({
  store,
  client,
}: {
  store: ReturnType<typeof useGroomerStore>;
  client: Client;
}) {
  const pets = store.data.pets.filter((pet) => pet.clientId === client.id);
  const visits = store.data.appointments.filter(
    (appointment) => appointment.clientId === client.id,
  );
  return (
    <div className="list-row">
      <div className="logo-mark" style={{ width: 42, height: 42 }}>
        👤
      </div>
      <div>
        <strong>{client.name}</strong>
        <div className="small muted">
          {client.phone} · {client.email}
        </div>
        <div className="small muted">
          {pets.length} pupile · {visits.length} wizyty ·{" "}
          {client.notes || "brak notatki"}
        </div>
      </div>
      <div style={{ display: "grid", gap: 8, justifyItems: "end" }}>
        <StatusBadge status={client.status} />
        <button
          className={
            client.depositExempt
              ? "btn btn-small btn-gold"
              : "btn btn-small btn-outline"
          }
          onClick={() =>
            store.updateClient({
              ...client,
              depositExempt: !client.depositExempt,
            })
          }
        >
          {client.depositExempt ? "Zwolniony z zadatku" : "Wymagaj zadatku"}
        </button>
      </div>
    </div>
  );
}

function PetsTab({ store }: { store: ReturnType<typeof useGroomerStore> }) {
  const [form, setForm] = useState({
    clientId: store.data.clients[0]?.id || "",
    name: "",
    breed: "",
    weightKg: "",
    photo: "",
  });
  return (
    <div className="grid-2">
      <div className="card">
        <h3>Profile pupili</h3>
        <div className="table-list">
          {store.data.pets.map((pet) => {
            const owner = store.data.clients.find(
              (client) => client.id === pet.clientId,
            );
            return (
              <div className="list-row" key={pet.id}>
                <img className="pet-avatar" src={pet.photo} alt={pet.name} />
                <div>
                  <strong>{pet.name}</strong>
                  <div className="small muted">
                    {pet.breed} · {pet.weightKg} kg · właściciel: {owner?.name}
                  </div>
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
            <select
              className="select"
              value={form.clientId}
              onChange={(e) => setForm({ ...form, clientId: e.target.value })}
            >
              {store.data.clients.map((client) => (
                <option value={client.id} key={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            Imię pupila
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
          <label className="form-field">
            Rasa
            <input
              className="input"
              value={form.breed}
              onChange={(e) => setForm({ ...form, breed: e.target.value })}
            />
          </label>
          <label className="form-field">
            Waga kg
            <input
              className="input"
              type="number"
              value={form.weightKg}
              onChange={(e) => setForm({ ...form, weightKg: e.target.value })}
            />
          </label>
          <label className="form-field">
            URL zdjęcia
            <input
              className="input"
              value={form.photo}
              onChange={(e) => setForm({ ...form, photo: e.target.value })}
            />
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
              photo:
                form.photo ||
                "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=400&q=80",
              notes: "Nowy profil pupila.",
            });
            setForm({
              clientId: store.data.clients[0]?.id || "",
              name: "",
              breed: "",
              weightKg: "",
              photo: "",
            });
          }}
        >
          <ImagePlus size={18} /> Dodaj pupila
        </button>
      </div>
    </div>
  );
}

function ServicesTab({
  store,
  openService,
}: {
  store: ReturnType<typeof useGroomerStore>;
  openService: () => void;
}) {
  const salon = store.data.salons[0];
  const services = store.data.services.filter(
    (item) => item.salonId === salon.id,
  );
  return (
    <div className="card">
      <div className="section-head">
        <div>
          <h3>Usługi salonu</h3>
          <p className="muted">
            Nazwa, cena, czas, zadatek i dostępność usługi.
          </p>
        </div>
        <button className="btn btn-primary" onClick={openService}>
          <Plus size={18} /> Dodaj usługę
        </button>
      </div>
      {services.map((service) => (
        <div className="service-row" key={service.id}>
          <div>
            <strong>{service.name}</strong>
            <p className="small muted" style={{ margin: "6px 0 0" }}>
              {service.description}
            </p>
            <div
              style={{
                marginTop: 8,
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <span className="badge">{service.category}</span>
              <span className="badge">{service.durationMin} min</span>
              {service.depositRequired ? (
                <span className="badge warn">zadatek</span>
              ) : (
                <span className="badge dark">bez zadatku</span>
              )}
            </div>
          </div>
          <strong>{formatPrice(service.price)}</strong>
          <button
            className="btn btn-small btn-outline"
            onClick={() =>
              store.updateService({ ...service, active: !service.active })
            }
          >
            {service.active ? "Wyłącz" : "Włącz"}
          </button>
        </div>
      ))}
    </div>
  );
}

function EmployeesTab({
  store,
}: {
  store: ReturnType<typeof useGroomerStore>;
}) {
  const salon = store.data.salons[0];
  const [name, setName] = useState("");
  const employees = store.data.employees.filter(
    (item) => item.salonId === salon.id,
  );
  return (
    <div className="grid-2">
      <div className="card">
        <h3>Pracownicy</h3>
        <div className="table-list">
          {employees.map((employee) => (
            <div className="list-row" key={employee.id}>
              <img
                className="avatar"
                src={employee.avatar}
                alt={employee.name}
              />
              <div>
                <strong>{employee.name}</strong>
                <div className="small muted">{employee.role}</div>
              </div>
              <button
                className="btn btn-small btn-outline"
                onClick={() =>
                  store.updateEmployee({
                    ...employee,
                    active: !employee.active,
                  })
                }
              >
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
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="np. Natalia"
          />
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
              avatar:
                "https://images.unsplash.com/photo-1558898479-33c0057a5d12?auto=format&fit=crop&w=240&q=80",
              color: "gold",
              active: true,
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
          const client = store.data.clients.find(
            (item) => item.id === review.clientId,
          );
          const pet = store.data.pets.find((item) => item.id === review.petId);
          return (
            <div className="list-row" key={review.id}>
              <div className="logo-mark" style={{ width: 42, height: 42 }}>
                <Star size={18} />
              </div>
              <div>
                <strong>
                  {"★".repeat(review.rating)}
                  {"☆".repeat(5 - review.rating)}
                </strong>
                <p style={{ margin: "6px 0" }}>{review.text}</p>
                <div className="small muted">
                  {client?.name} · {pet?.name} · {review.createdAt}
                </div>
              </div>
              <StatusBadge
                status={
                  review.verified ? "potwierdzona wizyta" : "niezweryfikowana"
                }
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ReportsTab({ store }: { store: ReturnType<typeof useGroomerStore> }) {
  const appointments = store.data.appointments.filter(
    (item) => item.status !== "anulowana",
  );
  const revenue = appointments.reduce((sum, item) => sum + item.price, 0);
  const noShows = store.data.appointments.filter(
    (item) => item.status === "nieobecność",
  ).length;
  const byService = store.data.services.map((service) => ({
    service,
    count: appointments.filter(
      (appointment) => appointment.serviceId === service.id,
    ).length,
  }));
  const maxCount = Math.max(1, ...byService.map((item) => item.count));
  return (
    <div className="table-list">
      <div className="grid-3">
        <KpiCard
          icon={BarChart3}
          title="Przychód"
          value={formatPrice(revenue)}
          text="z wizyt w demo"
        />
        <KpiCard
          icon={CalendarDays}
          title="Obłożenie"
          value="68%"
          text="symulowane"
        />
        <KpiCard
          icon={Users}
          title="Nieobecności"
          value={noShows.toString()}
          text="klienci bez przyjścia"
        />
      </div>
      <div className="card">
        <h3>Popularność usług</h3>
        <div className="table-list">
          {byService.map((item) => (
            <div key={item.service.id}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <strong>{item.service.name}</strong>
                <span className="muted">{item.count} wizyt</span>
              </div>
              <div
                style={{
                  height: 10,
                  background: "var(--sand-2)",
                  borderRadius: 999,
                  marginTop: 8,
                }}
              >
                <div
                  style={{
                    height: 10,
                    width: `${(item.count / maxCount) * 100}%`,
                    background:
                      "linear-gradient(90deg, var(--gold), var(--ink))",
                    borderRadius: 999,
                  }}
                />
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
          <input
            className="input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </label>
        <label className="form-field">
          Miasto
          <input
            className="input"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
          />
        </label>
        <label className="form-field full">
          Adres
          <input
            className="input"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
        </label>
        <label className="form-field full">
          Opis
          <textarea
            className="textarea"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </label>
        <label className="form-field">
          Typ zadatku
          <select
            className="select"
            value={form.depositType}
            onChange={(e) =>
              setForm({
                ...form,
                depositType: e.target.value as "fixed" | "percent",
              })
            }
          >
            <option value="fixed">Stała kwota</option>
            <option value="percent">Procent od ceny</option>
          </select>
        </label>
        <label className="form-field">
          Wartość zadatku
          <input
            className="input"
            type="number"
            value={form.depositValue}
            onChange={(e) =>
              setForm({ ...form, depositValue: Number(e.target.value) })
            }
          />
        </label>
        <label className="form-field">
          Zmiana terminu do ilu godzin przed
          <input
            className="input"
            type="number"
            value={form.rescheduleLimitHours}
            onChange={(e) =>
              setForm({ ...form, rescheduleLimitHours: Number(e.target.value) })
            }
          />
        </label>
      </div>
      <button
        className="btn btn-primary"
        style={{ marginTop: 16 }}
        onClick={() => store.updateSalon(form)}
      >
        Zapisz ustawienia
      </button>
    </div>
  );
}

function MobileTabBar({
  tabs,
  activeTab,
  setActiveTab,
}: {
  tabs: { id: TabId; label: string; icon: React.ElementType }[];
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
}) {
  const [moreOpen, setMoreOpen] = useState(false);
  const primaryIds: TabId[] = [
    "dashboard",
    "calendar",
    "appointments",
    "clients",
  ];
  const primaryTabs = tabs.filter((tab) => primaryIds.includes(tab.id));
  const moreTabs = tabs.filter((tab) => !primaryIds.includes(tab.id));
  const activeInMore = moreTabs.some((tab) => tab.id === activeTab);

  function choose(tab: TabId) {
    setActiveTab(tab);
    setMoreOpen(false);
  }

  return (
    <>
      {moreOpen ? (
        <button
          className="mobile-more-backdrop"
          aria-label="Zamknij więcej"
          onClick={() => setMoreOpen(false)}
        />
      ) : null}
      {moreOpen ? (
        <div
          className="mobile-more-sheet"
          role="dialog"
          aria-label="Pozostałe sekcje panelu groomera"
        >
          <div className="mobile-more-head">
            <strong>Więcej sekcji</strong>
            <button
              className="btn btn-small btn-outline"
              onClick={() => setMoreOpen(false)}
            >
              <X size={16} /> Zamknij
            </button>
          </div>
          <div className="mobile-more-grid">
            {moreTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={activeTab === tab.id ? "active" : ""}
                  onClick={() => choose(tab.id)}
                >
                  <Icon size={20} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
      <nav className="mobile-tabbar" aria-label="Nawigacja panelu groomera">
        {primaryTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={activeTab === tab.id ? "active" : ""}
              onClick={() => choose(tab.id)}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
            </button>
          );
        })}
        <button
          className={activeInMore || moreOpen ? "active" : ""}
          onClick={() => setMoreOpen((open) => !open)}
        >
          <MoreHorizontal size={18} />
          <span>Więcej</span>
        </button>
      </nav>
    </>
  );
}

function EditAppointmentModal({
  store,
  appointmentId,
  onClose,
}: {
  store: ReturnType<typeof useGroomerStore>;
  appointmentId: string;
  onClose: () => void;
}) {
  const salon = store.data.salons[0];
  const appointment = store.data.appointments.find(
    (item) => item.id === appointmentId,
  );
  const [form, setForm] = useState(() =>
    appointment ? { ...appointment } : null,
  );
  const [error, setError] = useState("");

  if (!appointment || !form) return null;

  const selectedClient =
    store.data.clients.find((item) => item.id === form.clientId) ||
    store.data.clients[0];
  const pets = store.data.pets.filter(
    (item) => item.clientId === form.clientId,
  );
  const selectedService =
    store.data.services.find((item) => item.id === form.serviceId) ||
    store.data.services[0];
  const deposit = calculateDeposit(salon, selectedService, selectedClient);

  function save() {
    if (!form) return;
    if (!isWithinWorkingDay(form.time, selectedService.durationMin)) {
      setError(
        "Nie można zapisać zmian — wybrana usługa nie mieści się w godzinach pracy salonu.",
      );
      return;
    }
    if (
      hasEmployeeConflict(
        store.data.appointments,
        form.employeeId,
        form.date,
        form.time,
        selectedService.durationMin,
        form.id,
      )
    ) {
      setError(
        "Nie można zapisać zmian — wybrany pracownik ma już wizytę w tym czasie.",
      );
      return;
    }
    const normalizedPayment = deposit === 0 ? "zwolniony" : form.paymentStatus;
    store.updateAppointment({
      ...form,
      durationMin: selectedService.durationMin,
      price: selectedService.price,
      depositAmount: deposit,
      paymentStatus: normalizedPayment,
    });
    onClose();
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(event) => event.stopPropagation()}>
        <div className="section-head">
          <div>
            <h2 style={{ marginBottom: 6 }}>Edytuj wizytę</h2>
            <p className="muted">
              Zmieniaj termin, pracownika, usługę, status i płatność.
            </p>
          </div>
          <button className="btn btn-outline" onClick={onClose}>
            Zamknij
          </button>
        </div>
        <div className="form-grid">
          <label className="form-field">
            Klient
            <select
              className="select"
              value={form.clientId}
              onChange={(e) => {
                const nextPets = store.data.pets.filter(
                  (item) => item.clientId === e.target.value,
                );
                setForm({
                  ...form,
                  clientId: e.target.value,
                  petId: nextPets[0]?.id || form.petId,
                });
              }}
            >
              {store.data.clients.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            Pupil
            <select
              className="select"
              value={form.petId}
              onChange={(e) => setForm({ ...form, petId: e.target.value })}
            >
              {pets.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            Usługa
            <select
              className="select"
              value={form.serviceId}
              onChange={(e) => setForm({ ...form, serviceId: e.target.value })}
            >
              {store.data.services.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} · {formatPrice(item.price)}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            Pracownik
            <select
              className="select"
              value={form.employeeId}
              onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
            >
              {store.data.employees.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            Data
            <input
              className="input"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </label>
          <label className="form-field">
            Godzina
            <select
              className="select"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
            >
              {demoTimes.map((time) => {
                const unavailable = !isEmployeeAvailable(
                  store.data.appointments,
                  form.employeeId,
                  form.date,
                  time,
                  selectedService.durationMin,
                  form.id,
                );
                return (
                  <option key={time} value={time} disabled={unavailable}>
                    {time}
                    {unavailable ? " — zajęte" : ""}
                  </option>
                );
              })}
            </select>
          </label>
          <label className="form-field">
            Status wizyty
            <select
              className="select"
              value={form.status}
              onChange={(e) =>
                setForm({
                  ...form,
                  status: e.target.value as Appointment["status"],
                })
              }
            >
              <option value="oczekuje_na_zadatek">Oczekuje na zadatek</option>
              <option value="potwierdzona">Potwierdzona</option>
              <option value="przełożona">Przełożona</option>
              <option value="anulowana">Anulowana</option>
              <option value="zakończona">Zakończona</option>
              <option value="nieobecność">Nieobecność</option>
            </select>
          </label>
          <label className="form-field">
            Status płatności
            <select
              className="select"
              value={deposit === 0 ? "zwolniony" : form.paymentStatus}
              disabled={deposit === 0}
              onChange={(e) =>
                setForm({
                  ...form,
                  paymentStatus: e.target.value as Appointment["paymentStatus"],
                })
              }
            >
              <option value="oczekuje">Oczekuje</option>
              <option value="opłacony">Opłacony</option>
              <option value="zwolniony">Zwolniony</option>
              <option value="nieudany">Nieudany</option>
              <option value="zwrócony">Zwrócony</option>
            </select>
          </label>
          <label className="form-field full">
            Notatka
            <textarea
              className="textarea"
              value={form.notes || ""}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </label>
        </div>
        {error ? (
          <div className="inline-alert danger" style={{ marginTop: 16 }}>
            {error}
          </div>
        ) : null}
        <div className="card" style={{ marginTop: 16, boxShadow: "none" }}>
          <InfoLine
            label="Cena po zmianach"
            value={formatPrice(selectedService.price)}
          />
          <InfoLine label="Czas" value={`${selectedService.durationMin} min`} />
          <InfoLine
            label="Zadatek"
            value={deposit === 0 ? "Nie wymagany" : formatPrice(deposit)}
          />
        </div>
        <div className="modal-actions">
          <button className="btn btn-primary" onClick={save}>
            Zapisz zmiany
          </button>
          {deposit > 0 ? (
            <button
              className="btn btn-gold"
              onClick={() =>
                setForm({
                  ...form,
                  paymentStatus: "opłacony",
                  status: "potwierdzona",
                })
              }
            >
              Oznacz opłacone
            </button>
          ) : null}
          <button
            className="btn btn-outline"
            onClick={() => setForm({ ...form, status: "anulowana" })}
          >
            Anuluj wizytę
          </button>
          <button
            className="btn btn-outline danger-action"
            onClick={() => {
              store.deleteAppointment(appointment.id);
              onClose();
            }}
          >
            <Trash2 size={16} /> Usuń
          </button>
        </div>
      </div>
    </div>
  );
}

function AppointmentModal({
  store,
  initial,
  onClose,
}: {
  store: ReturnType<typeof useGroomerStore>;
  initial?: Partial<Appointment> | null;
  onClose: () => void;
}) {
  const salon = store.data.salons[0];
  const client = store.data.clients[0];
  const pet =
    store.data.pets.find((item) => item.clientId === client.id) ||
    store.data.pets[0];
  const service = store.data.services[0];
  const activeEmployees = store.data.employees.filter(
    (item) => item.salonId === salon.id && item.active,
  );
  const initialDate = initial?.date || demoDates[0];
  const initialTime = initial?.time || demoTimes[0];
  const suggestedEmployee = initial?.employeeId
    ? activeEmployees.find((item) => item.id === initial.employeeId)
    : findAvailableEmployee(
        activeEmployees,
        store.data.appointments,
        initialDate,
        initialTime,
        service.durationMin,
      );
  const employee =
    suggestedEmployee || activeEmployees[0] || store.data.employees[0];
  const [form, setForm] = useState({
    clientId: client.id,
    petId: pet.id,
    serviceId: service.id,
    employeeId: employee.id,
    date: initialDate,
    time: initialTime,
    source: "manual" as "manual" | "online",
    notes: "",
  });
  const [error, setError] = useState("");

  const selectedClient =
    store.data.clients.find((item) => item.id === form.clientId) || client;
  const pets = store.data.pets.filter(
    (item) => item.clientId === form.clientId,
  );
  const selectedService =
    store.data.services.find((item) => item.id === form.serviceId) || service;
  const deposit = calculateDeposit(salon, selectedService, selectedClient);

  function saveAppointment() {
    if (!isWithinWorkingDay(form.time, selectedService.durationMin)) {
      setError(
        "Nie można dodać wizyty — wybrana usługa nie mieści się w godzinach pracy salonu.",
      );
      return;
    }
    if (
      hasEmployeeConflict(
        store.data.appointments,
        form.employeeId,
        form.date,
        form.time,
        selectedService.durationMin,
      )
    ) {
      setError(
        "Nie można dodać wizyty — wybrany pracownik ma już wizytę w tym czasie.",
      );
      return;
    }
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
      notes: form.notes,
    });
    onClose();
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(event) => event.stopPropagation()}>
        <div className="section-head">
          <div>
            <h2 style={{ marginBottom: 6 }}>Dodaj wizytę</h2>
            <p className="muted">Ręczna rezerwacja z bazy klientów.</p>
          </div>
          <button className="btn btn-outline" onClick={onClose}>
            Zamknij
          </button>
        </div>
        <div className="form-grid">
          <label className="form-field">
            Klient
            <select
              className="select"
              value={form.clientId}
              onChange={(e) => {
                const nextPets = store.data.pets.filter(
                  (item) => item.clientId === e.target.value,
                );
                setForm({
                  ...form,
                  clientId: e.target.value,
                  petId: nextPets[0]?.id || "",
                });
              }}
            >
              {store.data.clients.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            Pupil
            <select
              className="select"
              value={form.petId}
              onChange={(e) => setForm({ ...form, petId: e.target.value })}
            >
              {pets.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            Usługa
            <select
              className="select"
              value={form.serviceId}
              onChange={(e) => setForm({ ...form, serviceId: e.target.value })}
            >
              {store.data.services.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} · {formatPrice(item.price)}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            Pracownik
            <select
              className="select"
              value={form.employeeId}
              onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
            >
              {activeEmployees.map((item) => {
                const unavailable = !isEmployeeAvailable(
                  store.data.appointments,
                  item.id,
                  form.date,
                  form.time,
                  selectedService.durationMin,
                );
                return (
                  <option key={item.id} value={item.id} disabled={unavailable}>
                    {item.name}
                    {unavailable ? " — zajęty" : ""}
                  </option>
                );
              })}
            </select>
          </label>
          <label className="form-field">
            Data
            <select
              className="select"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            >
              {demoDates.map((date) => (
                <option key={date} value={date}>
                  {formatDate(date)}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            Godzina
            <select
              className="select"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
            >
              {demoTimes.map((time) => {
                const unavailable = !isEmployeeAvailable(
                  store.data.appointments,
                  form.employeeId,
                  form.date,
                  time,
                  selectedService.durationMin,
                );
                return (
                  <option key={time} value={time} disabled={unavailable}>
                    {time}
                    {unavailable ? " — zajęte" : ""}
                  </option>
                );
              })}
            </select>
          </label>
          <label className="form-field full">
            Notatka
            <textarea
              className="textarea"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </label>
        </div>
        {error ? (
          <div className="inline-alert danger" style={{ marginTop: 16 }}>
            {error}
          </div>
        ) : null}
        <div className="card" style={{ marginTop: 16, boxShadow: "none" }}>
          <InfoLine label="Cena" value={formatPrice(selectedService.price)} />
          <InfoLine label="Czas" value={`${selectedService.durationMin} min`} />
          <InfoLine
            label="Zadatek"
            value={deposit === 0 ? "Nie wymagany" : formatPrice(deposit)}
          />
        </div>
        <button
          className="btn btn-primary"
          style={{ width: "100%", marginTop: 16 }}
          onClick={saveAppointment}
        >
          Zapisz wizytę
        </button>
      </div>
    </div>
  );
}

function ServiceModal({
  store,
  onClose,
}: {
  store: ReturnType<typeof useGroomerStore>;
  onClose: () => void;
}) {
  const salon = store.data.salons[0];
  const [form, setForm] = useState({
    name: "",
    category: "Popularne usługi",
    description: "",
    price: "",
    durationMin: "60",
    depositRequired: true,
    animalSize: "każdy" as Service["animalSize"],
  });
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(event) => event.stopPropagation()}>
        <div className="section-head">
          <h2>Dodaj usługę</h2>
          <button className="btn btn-outline" onClick={onClose}>
            Zamknij
          </button>
        </div>
        <div className="form-grid">
          <label className="form-field">
            Nazwa
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
          <label className="form-field">
            Kategoria
            <input
              className="input"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
          </label>
          <label className="form-field">
            Cena
            <input
              className="input"
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </label>
          <label className="form-field">
            Czas min
            <input
              className="input"
              type="number"
              value={form.durationMin}
              onChange={(e) =>
                setForm({ ...form, durationMin: e.target.value })
              }
            />
          </label>
          <label className="form-field full">
            Opis
            <textarea
              className="textarea"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </label>
          <label
            className="form-field full"
            style={{
              display: "flex",
              alignItems: "center",
              flexDirection: "row",
              gap: 10,
            }}
          >
            <input
              type="checkbox"
              checked={form.depositRequired}
              onChange={(e) =>
                setForm({ ...form, depositRequired: e.target.checked })
              }
            />
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
              active: true,
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
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 14,
        padding: "10px 0",
        borderBottom: "1px solid var(--line)",
      }}
    >
      <span className="muted">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
