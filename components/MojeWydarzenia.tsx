import { useState } from "react";
import { Wydarzenie, Uzytkownik, ja, opisUczestnikow } from "../dane";

type Wlasciwosci = {
  wydarzenia: Wydarzenie[];
  uzytkownicy: Uzytkownik[];
  edytuj: (wydarzenie: Wydarzenie) => void;
  usun: (id: number) => void;
};

export default function MojeWydarzenia({ wydarzenia, uzytkownicy, edytuj, usun }: Wlasciwosci) {
  const [szukane, ustawSzukane] = useState("");
  const [filtr, ustawFiltr] = useState("wszystkie");

  const lista = wydarzenia
    .filter((w) => w.nazwa.toLowerCase().includes(szukane.toLowerCase()))
    .filter((w) => filtr === "wszystkie" || (filtr === "moje" && w.wlasciciel === ja) || (filtr === "zaproszone" && w.wlasciciel !== ja))
    .sort((a, b) => (a.data + a.godzinaRozpoczecia).localeCompare(b.data + b.godzinaRozpoczecia));

  return (
    <div className="strona">
      <h2>Moje wydarzenia</h2>
      <div className="filtry">
        <input className="szukaj" placeholder="Szukaj wydarzenia..." value={szukane} onChange={(e) => ustawSzukane(e.target.value)} />
        <select value={filtr} onChange={(e) => ustawFiltr(e.target.value)}>
          <option value="wszystkie">Wszystkie</option>
          <option value="moje">Utworzone przeze mnie</option>
          <option value="zaproszone">Do których jestem zaproszony</option>
        </select>
      </div>
      {lista.length === 0 && <p className="info">Brak wydarzeń</p>}
      {lista.map((w) => (
        <div key={w.id} className="panel" style={{ borderLeft: "6px solid " + w.kolor }}>
          <b>{w.nazwa}</b>
          <div className="info">{w.data} · {w.godzinaRozpoczecia}–{w.godzinaZakonczenia} · {w.miejsce || "bez miejsca"}</div>
          <div className="info">{opisUczestnikow(w, uzytkownicy)}</div>
          <button className="przycisk" onClick={() => edytuj(w)}>{w.wlasciciel === ja ? "Edytuj" : "Szczegóły"}</button>
          {w.wlasciciel === ja && <button className="przycisk czerwony" onClick={() => usun(w.id)}>Usuń</button>}
        </div>
      ))}
    </div>
  );
}
