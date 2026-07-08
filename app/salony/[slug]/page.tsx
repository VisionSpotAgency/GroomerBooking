"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useMemo, useState } from "react";
import { Check, Clock, Heart, MapPin, Search, Share2, Star } from "lucide-react";
import { Logo, StatusBadge } from "@/components/Common";
import { formatPrice, useGroomerStore } from "@/lib/store";

export default function SalonPage() {
  const store = useGroomerStore();
  const params = useParams<{ slug: string }>();
  const salon = store.data.salons.find((item) => item.slug === params.slug) || store.data.salons[0];
  const [query, setQuery] = useState("");
  const [favorite, setFavorite] = useState(false);
  const [copied, setCopied] = useState(false);
  const services = store.data.services.filter(
    (item) => item.salonId === salon.id && item.active && `${item.name} ${item.description}`.toLowerCase().includes(query.toLowerCase())
  );
  const reviews = store.data.reviews.filter((item) => item.salonId === salon.id && item.public);
  const average = useMemo(() => {
    if (!reviews.length) return salon.rating;
    return reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length;
  }, [reviews, salon.rating]);

  return (
    <main>
      <header className="salon-header">
        <div className="container salon-nav">
          <Logo dark />
          <nav className="nav-links" style={{ color: "rgba(255,255,255,.82)" }}>
            <a href="#uslugi">Usługi</a>
            <a href="#opinie">Opinie</a>
            <a href="#galeria">Galeria</a>
            <a href="#kontakt">Kontakt</a>
          </nav>
          <div className="nav-actions">
            <button
              className={favorite ? "btn btn-gold" : "btn btn-outline"}
              style={{ minWidth: 44, padding: 0, color: favorite ? undefined : "#fff", borderColor: "rgba(255,255,255,.2)" }}
              onClick={() => setFavorite((current) => !current)}
              aria-label="Dodaj salon do ulubionych"
              title={favorite ? "Salon jest w ulubionych" : "Dodaj do ulubionych"}
            >
              <Heart size={18} />
            </button>
            <button
              className="btn btn-outline"
              style={{ minWidth: copied ? 128 : 44, padding: copied ? "0 12px" : 0, color: "#fff", borderColor: "rgba(255,255,255,.2)" }}
              onClick={() => {
                if (typeof window !== "undefined") {
                  navigator.clipboard?.writeText(window.location.href);
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 1400);
                }
              }}
              aria-label="Skopiuj link do salonu"
              title="Skopiuj link do salonu"
            >
              {copied ? <Check size={18} /> : <Share2 size={18} />}
              {copied ? "Skopiowano" : null}
            </button>
            <Link className="btn btn-gold" href={`/book/${salon.slug}`}>
              Umów wizytę
            </Link>
          </div>
        </div>
      </header>

      <section id="galeria" className="container gallery">
        {salon.photos.map((photo, index) => (
          <img key={photo} src={photo} alt={`${salon.name} zdjęcie ${index + 1}`} />
        ))}
      </section>

      <section className="container salon-layout">
        <div>
          <div className="badge" style={{ marginBottom: 14 }}>🐾 Karty podarunkowe i rezerwacje online</div>
          <h1 style={{ fontSize: "clamp(40px, 5vw, 64px)", marginBottom: 8 }}>{salon.name}</h1>
          <p className="lead" style={{ fontSize: 18 }}>{salon.address}</p>
          <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap", margin: "16px 0 22px" }}>
            <div className="rating">
              <span className="stars">★★★★★</span> {average.toFixed(1).replace(".", ",")}
            </div>
            <a href="#opinie" className="muted" style={{ textDecoration: "underline" }}>
              {reviews.length + salon.reviewCount} opinii
            </a>
            <StatusBadge status="potwierdzone wizyty" />
          </div>
          <p className="lead">{salon.description}</p>

          <div className="search-box" id="uslugi">
            <Search size={20} />
            <input className="input" placeholder="Szukaj usługi" value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>

          <div className="card" style={{ boxShadow: "none" }}>
            <h2 style={{ fontSize: 34, marginBottom: 12 }}>Popularne usługi</h2>
            {services.length ? services.map((service) => (
              <div className="service-row" key={service.id}>
                <div>
                  <strong style={{ fontSize: 19 }}>{service.name}</strong>
                  <p className="muted" style={{ margin: "8px 0" }}>{service.description}</p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <span className="badge">{service.category}</span>
                    <span className="badge"><Clock size={13} /> {service.durationMin} min</span>
                    {service.depositRequired ? <span className="badge warn">zadatek online</span> : <span className="badge dark">bez zadatku</span>}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <strong style={{ fontSize: 20 }}>od {formatPrice(service.price)}</strong>
                  <div className="small muted">{service.durationMin >= 60 ? `${Math.floor(service.durationMin / 60)}h ${service.durationMin % 60 ? `${service.durationMin % 60}min` : ""}` : `${service.durationMin}min`}</div>
                </div>
                <Link className="btn btn-primary" href={`/book/${salon.slug}?service=${service.id}`}>
                  Umów
                </Link>
              </div>
            )) : <div className="empty-inline">Nie znaleziono usług dla tej frazy.</div>}
          </div>

          <div className="card" id="opinie" style={{ marginTop: 20 }}>
            <div className="section-head">
              <div>
                <h2 style={{ fontSize: 32 }}>Opinie klientów</h2>
                <p className="muted">Zweryfikowane opinie po zakończonej wizycie.</p>
              </div>
              <div className="kpi">{average.toFixed(1).replace(".", ",")}</div>
            </div>
            <div className="table-list">
              {reviews.length ? reviews.map((review) => {
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
                    <StatusBadge status="potwierdzona" />
                  </div>
                );
              }) : <div className="empty-inline">Na razie brak nowych opinii w prototypie.</div>}
            </div>
          </div>
        </div>

        <aside className="card" id="kontakt" style={{ position: "sticky", top: 96 }}>
          <h2 style={{ fontSize: 28, marginBottom: 8 }}>{salon.name}</h2>
          <div className="rating"><span className="stars">★★★★★</span> {average.toFixed(1).replace(".", ",")}</div>
          <div className="table-list" style={{ marginTop: 18 }}>
            <Info icon={<MapPin size={18} />} label={salon.address} />
            <Info icon={<Clock size={18} />} label={`Pon - Pt: ${salon.openingHours.pon}`} />
            <Info icon={<Clock size={18} />} label={`Sobota: ${salon.openingHours.sob}`} />
          </div>
          <Link className="btn btn-gold" href={`/book/${salon.slug}`} style={{ width: "100%", marginTop: 20 }}>
            Zarezerwuj wizytę
          </Link>
          <div className="card" style={{ marginTop: 18, boxShadow: "none", background: "rgba(247,241,232,.65)" }}>
            <strong>Informacje dla klienta</strong>
            <p className="small muted" style={{ margin: "8px 0 0", lineHeight: 1.6 }}>
              Rezerwacja online wymaga zadatku, chyba że salon oznaczy klienta jako zwolnionego z zadatku. Termin można zmienić do {salon.rescheduleLimitHours}h przed wizytą.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}

function Info({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
      <span style={{ color: "var(--gold-2)" }}>{icon}</span>
      <span>{label}</span>
    </div>
  );
}
