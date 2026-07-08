# GroomerBooking — klikalny prototyp MVP

To jest klikalny prototyp aplikacji SaaS dla salonów groomerskich przygotowany pod GitHub + Vercel.

## Co zawiera

- Landing page z pakietami Start / Pro / Business
- Publiczną stronę salonu: `/salony/psia-elegancja`
- Proces rezerwacji wizyty: `/book/psia-elegancja`
- Panel groomera: `/groomer`
- Panel klienta: `/client`
- Kalendarz z drag & drop
- Dodawanie wizyt ręcznie z panelu salonu
- Usługi, pracownicy, klienci i pupile
- Zdjęcia pupili
- Opinie klientów
- Raporty
- Płatność zadatku jako symulacja
- Zwolnienie wybranych klientów z zadatku
- Edycję terminu przez klienta
- Dane zapisane w `localStorage`, bez bazy danych

## Uruchomienie lokalne

```bash
npm install
npm run dev
```

Potem otwórz:

```text
http://localhost:3000
```

## Deploy na Vercel

1. Wrzuć projekt na GitHub.
2. Wejdź na Vercel i wybierz `New Project`.
3. Podłącz repozytorium.
4. Framework zostanie wykryty jako Next.js.
5. Kliknij `Deploy`.

## Ważne

To jest prototyp front-endowy. Nie ma backendu ani prawdziwej bazy danych. Dane zapisują się lokalnie w przeglądarce, więc każdy użytkownik/komputer będzie miał własny stan demo.

Przycisk `Reset danych` w panelu groomera przywraca dane demo.

## Docelowe elementy do podpięcia później

- baza danych, np. PostgreSQL/Supabase/Neon
- autoryzacja, np. NextAuth/Auth.js, Clerk lub Supabase Auth
- płatności, np. Stripe, PayU, Przelewy24 lub Tpay
- wysyłka e-mail/SMS
- upload zdjęć do storage, np. S3, Supabase Storage lub Cloudinary
- role i uprawnienia
- wielosalonowość produkcyjna
