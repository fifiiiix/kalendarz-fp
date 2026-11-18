"use client";

import { useEffect, useState } from "react";
import { Wydarzenie, Uzytkownik, StatusZaproszenia, ja, kolory, dzisiaj, przykladoweWydarzenia, przykladowiUzytkownicy, wydarzeniaUzytkownika } from "../dane";
import Kalendarz from "../components/Kalendarz";
import FormularzWydarzenia from "../components/FormularzWydarzenia";
import MojeWydarzenia from "../components/MojeWydarzenia";
import Znajomi from "../components/Znajomi";
import Zaproszenia from "../components/Zaproszenia";
import Ustawienia from "../components/Ustawienia";

export default function Strona() {
  const [uzytkownicy, ustawUzytkownikow] = useState<Uzytkownik[]>(przykladowiUzytkownicy);
  const [wydarzenia, ustawWydarzenia] = useState<Wydarzenie[]>([]);
  const [znajomi, ustawZnajomych] = useState<number[]>([1, 2, 3]);
  const [wczytano, ustawWczytano] = useState(false);
  const [strona, ustawStrone] = useState("kalendarz");
  const [widok, ustawWidok] = useState("miesiac");
  const [wybranyDzien, ustawDzien] = useState("");
  const [formularz, ustawFormularz] = useState<Wydarzenie | null>(null);

  useEffect(() => {
    const zapisane = localStorage.getItem("kalendarzDane");
    if (zapisane) {
      const dane = JSON.parse(zapisane);
      ustawUzytkownikow(dane.uzytkownicy);
      ustawWydarzenia(dane.wydarzenia);
      ustawZnajomych(dane.znajomi);
    } else {
      ustawWydarzenia(przykladoweWydarzenia());
    }
    ustawDzien(dzisiaj());
    ustawWczytano(true);
  }, []);

  useEffect(() => {
    if (wczytano) {
      localStorage.setItem("kalendarzDane", JSON.stringify({ uzytkownicy, wydarzenia, znajomi }));
    }
  }, [uzytkownicy, wydarzenia, znajomi, wczytano]);

  if (!wczytano) {
    return <p className="info">Ładowanie...</p>;
  }

  const mojeWydarzenia = wydarzeniaUzytkownika(wydarzenia, ja);
  const liczbaZaproszen = wydarzenia.filter((w) => w.uczestnicy.some((u) => u.idUzytkownika === ja && u.status === "oczekuje")).length;
  const czyNowe = formularz !== null && !wydarzenia.some((w) => w.id === formularz.id);

  function dodajWydarzenie(data: string, godzina: string) {
    const godzinaKonca = String(Math.min(parseInt(godzina) + 1, 23)).padStart(2, "0") + ":" + godzina.slice(3);
    ustawFormularz({ id: Date.now(), nazwa: "", opis: "", data, godzinaRozpoczecia: godzina, godzinaZakonczenia: godzinaKonca, kolor: kolory[0], miejsce: "", wlasciciel: ja, uczestnicy: [] });
  }

  function zapiszWydarzenie(wydarzenie: Wydarzenie) {
    if (wydarzenia.some((w) => w.id === wydarzenie.id)) {
      ustawWydarzenia(wydarzenia.map((w) => (w.id === wydarzenie.id ? wydarzenie : w)));
    } else {
      ustawWydarzenia([...wydarzenia, wydarzenie]);
    }
    ustawFormularz(null);
  }

  function usunWydarzenie(id: number) {
    ustawWydarzenia(wydarzenia.filter((w) => w.id !== id));
    ustawFormularz(null);
  }

  function odpowiedzNaZaproszenie(id: number, status: StatusZaproszenia) {
    ustawWydarzenia(
      wydarzenia.map((w) =>
        w.id === id ? { ...w, uczestnicy: w.uczestnicy.map((u) => (u.idUzytkownika === ja ? { ...u, status } : u)) } : w
      )
    );
  }

  function zmienUzytkownika(uzytkownik: Uzytkownik) {
    ustawUzytkownikow(uzytkownicy.map((u) => (u.id === uzytkownik.id ? uzytkownik : u)));
  }

  function przywrocDane() {
    ustawUzytkownikow(przykladowiUzytkownicy);
    ustawWydarzenia(przykladoweWydarzenia());
    ustawZnajomych([1, 2, 3]);
  }

  const menu = [
    { id: "kalendarz", nazwa: "Kalendarz" },
    { id: "moje", nazwa: "Moje wydarzenia" },
    { id: "znajomi", nazwa: "Znajomi" },
    { id: "zaproszenia", nazwa: "Zaproszenia" },
    { id: "ustawienia", nazwa: "Ustawienia" },
  ];

  return (
    <div className="aplikacja">
      <aside className="menu">
        <h1>Kalendarz</h1>
        <button className="przycisk glowny duzy" onClick={() => dodajWydarzenie(wybranyDzien, "09:00")}>+ Utwórz wydarzenie</button>
        <nav>
          {menu.map((pozycja) => (
            <button key={pozycja.id} className={strona === pozycja.id ? "pozycja aktywna" : "pozycja"} onClick={() => ustawStrone(pozycja.id)}>
              {pozycja.nazwa}
              {pozycja.id === "zaproszenia" && liczbaZaproszen > 0 && <span className="odznaka">{liczbaZaproszen}</span>}
            </button>
          ))}
        </nav>
      </aside>

      <main className="tresc">
        {strona === "kalendarz" && (
          <Kalendarz wydarzenia={mojeWydarzenia} widok={widok} ustawWidok={ustawWidok} wybranyDzien={wybranyDzien} ustawDzien={ustawDzien} dodaj={dodajWydarzenie} edytuj={ustawFormularz} />
        )}
        {strona === "moje" && <MojeWydarzenia wydarzenia={mojeWydarzenia} uzytkownicy={uzytkownicy} edytuj={ustawFormularz} usun={usunWydarzenie} />}
        {strona === "znajomi" && (
          <Znajomi uzytkownicy={uzytkownicy} znajomi={znajomi} wydarzenia={wydarzenia} dodajZnajomego={(id) => ustawZnajomych([...znajomi, id])} usunZnajomego={(id) => ustawZnajomych(znajomi.filter((x) => x !== id))} />
        )}
        {strona === "zaproszenia" && <Zaproszenia wydarzenia={wydarzenia} uzytkownicy={uzytkownicy} odpowiedz={odpowiedzNaZaproszenie} />}
        {strona === "ustawienia" && <Ustawienia uzytkownicy={uzytkownicy} zmienUzytkownika={zmienUzytkownika} przywrocDane={przywrocDane} />}
      </main>

      {formularz && (
        <FormularzWydarzenia key={formularz.id} wydarzenie={formularz} czyNowe={czyNowe} uzytkownicy={uzytkownicy} znajomi={znajomi} wydarzenia={wydarzenia} zapisz={zapiszWydarzenie} usun={usunWydarzenie} zamknij={() => ustawFormularz(null)} />
      )}
    </div>
  );
}
