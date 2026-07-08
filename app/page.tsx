"use client";

import Link from "next/link";
import {
  CalendarDays,
  CreditCard,
  Heart,
  LineChart,
  PawPrint,
  Scissors,
  ShieldCheck,
  Users
} from "lucide-react";
import { Logo } from "@/components/Common";

const features = [
  {
    icon: CalendarDays,
    title: "Kalendarz i drag & drop",
    text: "Przesuwanie wizyt między godzinami i dniami, szybkie dodawanie wizyt z bazy klientów."
  },
  {
    icon: CreditCard,
    title: "Zadatki online",
    text: "Stały lub procentowy zadatek, status płatności oraz zwolnienie z zadatku dla wybranych klientów."
  },
  {
    icon: PawPrint,
    title: "Profile pupili",
    text: "Zdjęcia, rasa, waga, historia wizyt, notatki groomera i informacje o zachowaniu pupila."
  },
  {
    icon: Users,
    title: "Baza klientów",
    text: "Klienci, pupile, statusy, notatki, zgody marketingowe i szybka rezerwacja ręczna."
  },
  {
    icon: Heart,
    title: "Opinie po wizycie",
    text: "Zweryfikowane opinie klientów, ocena salonu i sekcja społecznego zaufania na stronie salonu."
  },
  {
    icon: LineChart,
    title: "Raporty salonu",
    text: "Przychód, liczba wizyt, popularne usługi, zadatki i obłożenie kalendarza."
  }
];

const packages = [
  {
    name: "Start",
    price: "99 zł",
    text: "Dla jednoosobowych salonów, które chcą przyjmować rezerwacje online.",
    items: ["1 pracownik", "Strona salonu", "Rezerwacje i zadatki", "Baza klientów"]
  },
  {
    name: "Pro",
    price: "179 zł",
    text: "Dla salonów, które chcą mieć pracowników, opinie, SMS-y i raporty.",
    featured: true,
    items: ["Wielu pracowników", "Opinie i zdjęcia pupili", "Drag & drop", "Raporty i automatyzacje"]
  },
  {
    name: "Business",
    price: "349 zł",
    text: "Dla dużych salonów, sieci i marek, które potrzebują większej kontroli.",
    items: ["Wiele lokalizacji", "Role i uprawnienia", "Własna domena", "Priorytetowe wsparcie"]
  }
];

export default function HomePage() {
  return (
    <main>
      <header className="topbar">
        <div className="container nav">
          <Logo />
          <nav className="nav-links">
            <a href="#funkcje">Funkcje</a>
            <a href="#cennik">Cennik</a>
            <Link href="/salony/psia-elegancja">Demo salonu</Link>
            <Link href="/groomer">Panel groomera</Link>
          </nav>
          <div className="nav-actions">
            <Link className="btn btn-ghost" href="/client">
              Konto klienta
            </Link>
            <Link className="btn btn-gold" href="/groomer">
              Załóż salon
            </Link>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="container hero-grid">
          <div>
            <p className="eyebrow">Premium booking dla groomerów</p>
            <h1>
              Twój salon groomerski <span className="serif">online</span> — rezerwacje, zadatki i klienci w jednym miejscu.
            </h1>
            <p className="lead">
              Stwórz profesjonalną stronę salonu, przyjmuj wizyty 24/7, pobieraj zadatki,
              zarządzaj kalendarzem, klientami, pupilami i opiniami bez telefonu i chaosu w wiadomościach.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 26 }}>
              <Link className="btn btn-gold" href="/groomer">
                Załóż salon
              </Link>
              <Link className="btn btn-outline" href="/salony/psia-elegancja">
                Zobacz demo salonu
              </Link>
            </div>
            <div className="stats-row">
              <div className="stat-tile">
                <CalendarDays />
                <div>
                  <strong>Rezerwacje 24/7</strong>
                  <div className="small muted">bez telefonu</div>
                </div>
              </div>
              <div className="stat-tile">
                <CreditCard />
                <div>
                  <strong>Płatne zadatki</strong>
                  <div className="small muted">mniej nieobecności</div>
                </div>
              </div>
              <div className="stat-tile">
                <ShieldCheck />
                <div>
                  <strong>Panel klienta</strong>
                  <div className="small muted">wizyty i pupile</div>
                </div>
              </div>
            </div>
          </div>

          <div className="hero-card">
            <img
              alt="Pies po wizycie u groomera"
              src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=1200&q=82"
            />
            <div className="floating-card">
              <strong>Kalendarz</strong>
              <p className="small muted">Maj 2026</p>
              <div className="mini-calendar">
                {Array.from({ length: 31 }, (_, index) => (
                  <span key={index}>{index + 1 === 14 ? <strong>14</strong> : index + 1}</span>
                ))}
              </div>
            </div>
            <div className="floating-card bottom">
              <strong>Dzisiejsze wizyty</strong>
              <div className="table-list" style={{ marginTop: 12 }}>
                <div className="list-row" style={{ gridTemplateColumns: "auto 1fr" }}>
                  <span>🐶</span>
                  <span className="small">10:00 Coco · Kąpiel + strzyżenie</span>
                </div>
                <div className="list-row" style={{ gridTemplateColumns: "auto 1fr" }}>
                  <span>🐕</span>
                  <span className="small">12:30 Rocky · Trymowanie</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="funkcje">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">Co jest w prototypie</p>
              <h2>Najważniejsze moduły gotowe do przeklikania.</h2>
            </div>
            <Link className="btn btn-primary" href="/groomer">
              Otwórz panel
            </Link>
          </div>
          <div className="feature-grid">
            {features.map((item) => {
              const Icon = item.icon;
              return (
                <article className="feature-card" key={item.title}>
                  <Icon color="var(--gold-2)" />
                  <h3 style={{ marginTop: 18 }}>{item.title}</h3>
                  <p className="muted">{item.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section" id="cennik">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">Pakiety SaaS</p>
              <h2>Start, Pro i Business dla różnych salonów.</h2>
            </div>
          </div>
          <div className="pricing-grid">
            {packages.map((item) => (
              <article className={`price-card ${item.featured ? "featured" : ""}`} key={item.name}>
                <div className="badge" style={{ marginBottom: 14 }}>
                  {item.name}
                </div>
                <div className="price">{item.price}</div>
                <p className={item.featured ? "" : "muted"}>{item.text}</p>
                <div className="table-list" style={{ margin: "20px 0" }}>
                  {item.items.map((feature) => (
                    <div key={feature} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <Scissors size={16} color="var(--gold)" /> {feature}
                    </div>
                  ))}
                </div>
                <Link className={item.featured ? "btn btn-gold" : "btn btn-primary"} href="/groomer">
                  Wybierz pakiet
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container" style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <Logo />
          <span>Prototyp bez bazy danych · dane zapisują się w localStorage przeglądarki.</span>
        </div>
      </footer>
    </main>
  );
}
