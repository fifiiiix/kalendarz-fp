import { useState } from "react";
import { Wydarzenie, Uzytkownik, ja, dzisiaj, naMinuty, wydarzeniaUzytkownika, znajdzKolizje } from "../dane";

type Wlasciwosci = {
  uzytkownicy: Uzytkownik[];
  znajomi: number[];
  wydarzenia: Wydarzenie[];
  dodajZnajomego: (id: number) => void;
  usunZnajomego: (id: number) => void;
};

export default function Znajomi({ uzytkownicy, znajomi, wydarzenia, dodajZnajomego, usunZnajomego }: Wlasciwosci) {
  const [szukane, ustawSzukane] = useState("");
  const [wybrany, ustawWybranego] = useState<number | null>(null);

  const wyniki = szukane.trim() === "" ? [] : uzytkownicy.filter((u) => u.id !== ja && !znajomi.includes(u.id) && u.imie.toLowerCase().includes(szukane.toLowerCase()));

  function stan(u: Uzytkownik) {
    if (!u.udostepniaKalendarz) return "Kalendarz prywatny";
    const teraz = new Date();
    const minuty = teraz.getHours() * 60 + teraz.getMinutes();
    const kolizja = znajdzKolizje(wydarzeniaUzytkownika(wydarzenia, u.id), dzisiaj(), minuty, minuty + 1, -1);
    return kolizja ? "Zajęty: " + kolizja.nazwa + " do " + kolizja.godzinaZakonczenia : "Dostępny";
  }

  const wybranyZnajomy = uzytkownicy.find((u) => u.id === wybrany);
  const jegoWydarzenia = wybranyZnajomy && wybranyZnajomy.udostepniaKalendarz
    ? wydarzeniaUzytkownika(wydarzenia, wybranyZnajomy.id)
        .filter((w) => w.data >= dzisiaj())
        .sort((a, b) => (a.data + a.godzinaRozpoczecia).localeCompare(b.data + b.godzinaRozpoczecia))
    : [];

  return (
    <div className="strona">
      <h2>Znajomi</h2>
      <input className="szukaj" placeholder="Wyszukaj użytkownika..." value={szukane} onChange={(e) => ustawSzukane(e.target.value)} />
      {wyniki.map((u) => (
        <div key={u.id} className="wierszListy">
          <span>{u.imie}</span>
          <button className="przycisk glowny" onClick={() => dodajZnajomego(u.id)}>Dodaj</button>
        </div>
      ))}
      {szukane.trim() !== "" && wyniki.length === 0 && <p className="info">Nie znaleziono użytkownika</p>}

      <h3>Twoi znajomi</h3>
      {znajomi.length === 0 && <p className="info">Nie masz jeszcze znajomych</p>}
      {znajomi.map((id) => {
        const u = uzytkownicy.find((x) => x.id === id);
        if (!u) return null;
        return (
          <div key={id} className="wierszListy">
            <div>
              <b>{u.imie}</b>
              <div className="info">{stan(u)}</div>
            </div>
            <div>
              <button className="przycisk" onClick={() => ustawWybranego(wybrany === id ? null : id)}>Kalendarz</button>
              <button className="przycisk czerwony" onClick={() => usunZnajomego(id)}>Usuń</button>
            </div>
          </div>
        );
      })}

      {wybranyZnajomy && (
        <div className="panel">
          <h3>Kalendarz: {wybranyZnajomy.imie}</h3>
          {!wybranyZnajomy.udostepniaKalendarz && <p className="info">Ta osoba nie udostępnia kalendarza</p>}
          {wybranyZnajomy.udostepniaKalendarz && jegoWydarzenia.length === 0 && <p className="info">Brak nadchodzących wydarzeń – cały czas dostępny</p>}
          {jegoWydarzenia.map((w) => (
            <div key={w.id} className="wierszListy" style={{ borderLeft: "6px solid " + w.kolor }}>
              <span>{w.data} · {w.godzinaRozpoczecia}–{w.godzinaZakonczenia} · {w.nazwa}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
