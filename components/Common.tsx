"use client";

import Link from "next/link";
import { PawPrint } from "lucide-react";

export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <Link className="brand" href="/" aria-label="GroomerBooking">
      <span className="logo-mark">
        <PawPrint size={19} />
      </span>
      <span style={{ color: dark ? "#fff" : undefined }}>GroomerBooking</span>
    </Link>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  let cls = "badge";
  if (normalized.includes("potwierdz") || normalized.includes("opłac") || normalized.includes("zakoń")) cls += " success";
  if (normalized.includes("oczek") || normalized.includes("przełoż")) cls += " warn";
  if (normalized.includes("anul") || normalized.includes("nieobec") || normalized.includes("nieudan")) cls += " danger";
  if (normalized.includes("zwoln")) cls += " dark";
  return <span className={cls}>{status.replaceAll("_", " ")}</span>;
}

export function EmptyState({ title, text }: { title: string; text?: string }) {
  return (
    <div className="card" style={{ textAlign: "center", padding: 36 }}>
      <div style={{ fontSize: 34 }}>🐾</div>
      <h3>{title}</h3>
      {text ? <p className="muted">{text}</p> : null}
    </div>
  );
}
