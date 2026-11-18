import { Wydarzenie, Uzytkownik, StatusZaproszenia, ja, opisUczestnikow, pobierzImie } from "../dane";

type Wlasciwosci = {
  wydarzenia: Wydarzenie[];
  uzytkownicy: Uzytkownik[];
  odpowiedz: (idWydarzenia: number, status: StatusZaproszenia) => void;
};

export default function Zaproszenia({ wydarzenia, uzytkownicy, odpowiedz }: Wlasciwosci) {
  const mojStatus = (w: Wydarzenie) => w.uczestnicy.find((u) => u.idUzytkownika === ja)?.status;
  const oczekujace = wydarzenia.filter((w) => mojStatus(w) === "oczekuje");
  const odpowiedziane = wydarzenia.filter((w) => mojStatus(w) === "przyjete" || mojStatus(w) === "odrzucone");

  function karta(w: Wydarzenie, przyciski: boolean) {
    return (
      <div key={w.id} className="panel" style={{ borderLeft: "6px solid " + w.kolor }}>
        <b>{w.nazwa}</b>
        <div className="info">{w.data} · {w.godzinaRozpoczecia}–{w.godzinaZakonczenia} · {w.miejsce || "bez miejsca"}</div>
        <div className="info">Organizator: {pobierzImie(uzytkownicy, w.wlasciciel)}</div>
        <div className="info">Uczestnicy: {opisUczestnikow(w, uzytkownicy)}</div>
        {przyciski ? (
          <div>
            <button className="przycisk glowny" onClick={() => odpowiedz(w.id, "przyjete")}>Akceptuj</button>
            <button className="przycisk czerwony" onClick={() => odpowiedz(w.id, "odrzucone")}>Odrzuć</button>
          </div>
        ) : (
          <div className="info">Twoja odpowiedź: {mojStatus(w) === "przyjete" ? "przyjęte" : "odrzucone"}</div>
        )}
      </div>
    );
  }

  return (
    <div className="strona">
      <h2>Zaproszenia</h2>
      {oczekujace.length === 0 && <p className="info">Brak nowych zaproszeń</p>}
      {oczekujace.map((w) => karta(w, true))}
      {odpowiedziane.length > 0 && <h3>Odpowiedziane</h3>}
      {odpowiedziane.map((w) => karta(w, false))}
    </div>
  );
}
