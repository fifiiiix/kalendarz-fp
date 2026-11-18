export type StatusZaproszenia = "oczekuje" | "przyjete" | "odrzucone";
export type Uczestnik = { idUzytkownika: number; status: StatusZaproszenia };
export type Wydarzenie = {
  id: number;
  nazwa: string;
  opis: string;
  data: string;
  godzinaRozpoczecia: string;
  godzinaZakonczenia: string;
  kolor: string;
  miejsce: string;
  wlasciciel: number;
  uczestnicy: Uczestnik[];
};
export type Uzytkownik = { id: number; imie: string; udostepniaKalendarz: boolean };

export const ja = 0;
export const kolory = ["#a8c7fa", "#b5e3c4", "#fbd5a5", "#f6b8c4", "#d9c2f0", "#fff0a6"];
export const nazwyMiesiecy = ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"];
export const nazwyDni = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Ndz"];
export const nazwyStatusow = { oczekuje: "oczekuje", przyjete: "przyjęte", odrzucone: "odrzucone" };

export const przykladowiUzytkownicy: Uzytkownik[] = [
  { id: 0, imie: "Ja", udostepniaKalendarz: true },
  { id: 1, imie: "Anna Kowalska", udostepniaKalendarz: true },
  { id: 2, imie: "Michał Nowak", udostepniaKalendarz: true },
  { id: 3, imie: "Kasia Wiśniewska", udostepniaKalendarz: true },
  { id: 4, imie: "Piotr Zieliński", udostepniaKalendarz: false },
  { id: 5, imie: "Ola Lewandowska", udostepniaKalendarz: true },
  { id: 6, imie: "Tomek Wójcik", udostepniaKalendarz: true },
];

export function naTekst(data: Date) {
  const miesiac = String(data.getMonth() + 1).padStart(2, "0");
  const dzien = String(data.getDate()).padStart(2, "0");
  return data.getFullYear() + "-" + miesiac + "-" + dzien;
}

export function naDate(tekst: string) {
  const [rok, miesiac, dzien] = tekst.split("-").map(Number);
  return new Date(rok, miesiac - 1, dzien);
}

export function dzisiaj() {
  return naTekst(new Date());
}

export function dodajDni(tekst: string, ile: number) {
  const data = naDate(tekst);
  data.setDate(data.getDate() + ile);
  return naTekst(data);
}

export function naMinuty(godzina: string) {
  const [godziny, minuty] = godzina.split(":").map(Number);
  return godziny * 60 + minuty;
}

export function pelnaGodzina(godzina: number) {
  return String(godzina).padStart(2, "0") + ":00";
}

export function wydarzeniaUzytkownika(wydarzenia: Wydarzenie[], id: number) {
  return wydarzenia.filter(
    (w) => w.wlasciciel === id || w.uczestnicy.some((u) => u.idUzytkownika === id && u.status === "przyjete")
  );
}

export function znajdzKolizje(wydarzenia: Wydarzenie[], data: string, poczatek: number, koniec: number, pomijaneId: number) {
  return wydarzenia.find(
    (w) =>
      w.id !== pomijaneId &&
      w.data === data &&
      naMinuty(w.godzinaRozpoczecia) < koniec &&
      naMinuty(w.godzinaZakonczenia) > poczatek
  );
}

export function pobierzImie(uzytkownicy: Uzytkownik[], id: number) {
  const znaleziony = uzytkownicy.find((u) => u.id === id);
  return znaleziony ? znaleziony.imie : "Nieznany";
}

export function opisUczestnikow(w: Wydarzenie, uzytkownicy: Uzytkownik[]) {
  if (w.uczestnicy.length === 0) return "Brak zaproszonych osób";
  return w.uczestnicy.map((u) => pobierzImie(uzytkownicy, u.idUzytkownika) + " (" + nazwyStatusow[u.status] + ")").join(", ");
}

export function przykladoweWydarzenia(): Wydarzenie[] {
  const dzis = dzisiaj();
  return [
    { id: 1, nazwa: "Trening tenisa", opis: "Sparing na korcie", data: dzis, godzinaRozpoczecia: "17:00", godzinaZakonczenia: "18:30", kolor: kolory[1], miejsce: "Kort miejski", wlasciciel: 0, uczestnicy: [{ idUzytkownika: 2, status: "przyjete" }] },
    { id: 2, nazwa: "Nauka programowania", opis: "Next.js i TypeScript", data: dodajDni(dzis, 1), godzinaRozpoczecia: "08:00", godzinaZakonczenia: "09:30", kolor: kolory[0], miejsce: "Dom", wlasciciel: 0, uczestnicy: [] },
    { id: 3, nazwa: "Mecz piłki nożnej", opis: "Mecz na orliku", data: dodajDni(dzis, 2), godzinaRozpoczecia: "18:00", godzinaZakonczenia: "20:00", kolor: kolory[2], miejsce: "Orlik", wlasciciel: 2, uczestnicy: [{ idUzytkownika: 0, status: "oczekuje" }, { idUzytkownika: 1, status: "przyjete" }] },
    { id: 4, nazwa: "Wieczór z grami", opis: "Gramy w co chcecie", data: dodajDni(dzis, 3), godzinaRozpoczecia: "20:00", godzinaZakonczenia: "22:00", kolor: kolory[4], miejsce: "Online", wlasciciel: 3, uczestnicy: [{ idUzytkownika: 0, status: "oczekuje" }] },
    { id: 5, nazwa: "Projekt z informatyki", opis: "", data: dodajDni(dzis, 1), godzinaRozpoczecia: "10:00", godzinaZakonczenia: "12:00", kolor: kolory[3], miejsce: "Szkoła", wlasciciel: 1, uczestnicy: [] },
    { id: 6, nazwa: "Kino", opis: "", data: dodajDni(dzis, 1), godzinaRozpoczecia: "16:00", godzinaZakonczenia: "18:00", kolor: kolory[5], miejsce: "Kino Helios", wlasciciel: 2, uczestnicy: [] },
    { id: 7, nazwa: "Siłownia", opis: "", data: dzis, godzinaRozpoczecia: "10:00", godzinaZakonczenia: "11:00", kolor: kolory[1], miejsce: "Siłownia", wlasciciel: 1, uczestnicy: [] },
    { id: 8, nazwa: "Koło zainteresowań AI", opis: "Rozmowa o modelach językowych", data: dodajDni(dzis, 4), godzinaRozpoczecia: "15:00", godzinaZakonczenia: "16:00", kolor: kolory[0], miejsce: "Sala 12", wlasciciel: 0, uczestnicy: [{ idUzytkownika: 1, status: "przyjete" }, { idUzytkownika: 3, status: "oczekuje" }] },
    { id: 9, nazwa: "Prywatne sprawy", opis: "", data: dodajDni(dzis, 2), godzinaRozpoczecia: "18:00", godzinaZakonczenia: "19:00", kolor: kolory[3], miejsce: "", wlasciciel: 4, uczestnicy: [] },
  ];
}
