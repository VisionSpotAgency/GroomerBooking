# GroomerBooking Prototype

Klikalny prototyp aplikacji SaaS dla salonów groomerskich, przygotowany pod GitHub i Vercel.

## Stack

- Next.js 14
- React 18
- TypeScript
- CSS bez zewnętrznej biblioteki UI
- Dane demo w `localStorage`

## Uruchomienie lokalne

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Ścieżki

- `/` — landing page SaaS
- `/groomer` — panel groomera
- `/client` — panel klienta
- `/salony/psia-elegancja` — publiczna strona salonu
- `/book/psia-elegancja` — proces rezerwacji

## Co działa w prototypie

- strona główna z pakietami Start / Pro / Business,
- publiczna strona salonu z usługami, opiniami, galerią, ulubionymi i kopiowaniem linku,
- proces rezerwacji z wyborem usługi, pracownika, terminu, klienta, pupila i symulacją płatności zadatku,
- panel groomera z dashboardem, klientami, pupilami, usługami, pracownikami, opiniami, raportami i ustawieniami,
- kalendarz groomera z widokiem dnia, tygodnia i miesiąca,
- drag & drop wizyt w kalendarzu,
- klikanie slotu w kalendarzu w celu dodania wizyty,
- klikanie wizyty w kalendarzu w celu edycji,
- edycja terminu, usługi, pracownika, statusu i płatności wizyty,
- zwalnianie wybranych klientów z zadatku,
- panel klienta z wizytami, pupilami, danymi, opiniami, ulubionymi salonami i płatnościami,
- filtrowanie wizyt klienta: nadchodzące, historia, anulowane,
- zmiana terminu wizyty przez klienta,
- dolna nawigacja mobilna w panelu groomera i panelu klienta.

## Ważne

To jest prototyp front-endowy. Nie ma jeszcze prawdziwej autoryzacji, bazy danych, uploadu plików ani prawdziwej bramki płatności. Dane zapisują się lokalnie w przeglądarce. Reset danych znajduje się w panelu groomera.

Nie wrzucaj na GitHub folderów:

- `node_modules/`
- `.next/`
- `package-lock.json`


## Aktualizacja v5

- Poprawione mobile: dolny pasek rezerwacji nie zasłania już treści, a modale panelu są nad dolną nawigacją.
- Mobilna nawigacja w panelu groomera i klienta ma teraz 4 główne pozycje + przycisk „Więcej”, bez ukrytego przewijania poziomego.
- Terminy generują się co 15 minut.
- Drag & drop w kalendarzu obsługuje sloty 09:15, 09:30, 09:45 itd.
- W procesie rezerwacji klient widzi tylko dostępne godziny — zajęte terminy są ukryte.
- System nadal blokuje nakładające się wizyty u tego samego pracownika i pilnuje godzin pracy salonu.


## Zmiany w v6

- Poprawiono drag & drop w widoku dziennym kalendarza.
- Sloty `+ 09:15`, `+ 09:30` itd. są teraz pełnoszerokościowymi obszarami kliknięcia/dropu.
- Wizyty można przeciągać co 15 minut również w widoku dziennym.
- Podczas przeciągania pojawia się podgląd wizyty z aktualizowaną godziną docelową.
- System dalej blokuje przeniesienie wizyty na zajęty czas pracownika albo poza godziny pracy.
- W rezerwacji klienta zajęte godziny nie są pokazywane na liście dostępnych terminów.
