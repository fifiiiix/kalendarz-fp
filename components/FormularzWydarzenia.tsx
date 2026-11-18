import { useState } from "react";
import { Wydarzenie, Uzytkownik, Uczestnik, ja, kolory, naMinuty, pelnaGodzina, pobierzImie, wydarzeniaUzytkownika, znajdzKolizje, opisUczestnikow } from "../dane";

type Wlasciwosci = {
  wydarzenie: Wydarzenie;
  czyNowe: boolean;
  uzytkownicy: Uzytkownik[];
  znajomi: number[];
  wydarzenia: Wydarzenie[];
  zapisz: (wydarzenie: Wydarzenie) => void;
  usun: (id: number) => void;
  zamknij: () => void;
};

export default function FormularzWydarzenia({ wydarzenie, czyNowe, uzytkownicy, znajomi, wydarzenia, zapisz, usun, zamknij }: Wlasciwosci) {
  const [nazwa, ustawNazwe] = useState(wydarzenie.nazwa);
  const [opis, ustawOpis] = useState(wydarzenie.opis);
  const [data, ustawDate] = useState(wydarzenie.data);
  const [godzinaRozpoczecia, ustawGodzineRozpoczecia] = useState(wydarzenie.godzinaRozpoczecia);
  const [godzinaZakonczenia, ustawGodzineZakonczenia] = useState(wydarzenie.godzinaZakonczenia);
  const [kolor, ustawKolor] = useState(wydarzenie.kolor);
  const [miejsce, ustawMiejsce] = useState(wydarzenie.miejsce);
  const [zaproszeni, ustawZaproszonych] = useState<number[]>(wydarzenie.uczestnicy.map((u) => u.idUzytkownika));
  const [blad, ustawBlad] = useState("");

  const mozeEdytowac = wydarzenie.wlasciciel === ja;
  const osoby = [ja, ...zaproszeni];

  function zajeciWPrzedziale(poczatek: number, koniec: number) {
    const wynik: string[] = [];
    osoby.forEach((id) => {
      const osoba = uzytkownicy.find((u) => u.id === id);
      if (!osoba || !osoba.udostepniaKalendarz) return;
      const kolizja = znajdzKolizje(wydarzeniaUzytkownika(wydarzenia, id), data, poczatek, koniec, wydarzenie.id);
      if (kolizja) wynik.push(pobierzImie(uzytkownicy, id) + " (" + kolizja.nazwa + ")");
    });
    return wynik;
  }

  const prywatni = zaproszeni.filter((id) => !uzytkownicy.find((u) => u.id === id)?.udostepniaKalendarz);
  const konflikty = zajeciWPrzedziale(naMinuty(godzinaRozpoczecia), naMinuty(godzinaZakonczenia));

  function przelaczOsobe(id: number) {
    if (zaproszeni.includes(id)) {
      ustawZaproszonych(zaproszeni.filter((x) => x !== id));
    } else {
      ustawZaproszonych([...zaproszeni, id]);
    }
  }

  function wybierzGodzine(godzina: number) {
    ustawGodzineRozpoczecia(pelnaGodzina(godzina));
    ustawGodzineZakonczenia(pelnaGodzina(godzina + 1));
  }

  function zapiszWydarzenie() {
    if (nazwa.trim() === "") {
      ustawBlad("Podaj nazwę spotkania");
      return;
    }
    if (data === "") {
      ustawBlad("Wybierz datę");
      return;
    }
    if (naMinuty(godzinaZakonczenia) <= naMinuty(godzinaRozpoczecia)) {
      ustawBlad("Godzina zakończenia musi być późniejsza niż rozpoczęcia");
      return;
    }
    const uczestnicy: Uczestnik[] = zaproszeni.map((id) => {
      const stary = wydarzenie.uczestnicy.find((u) => u.idUzytkownika === id);
      return stary ? stary : { idUzytkownika: id, status: "oczekuje" };
    });
    zapisz({ ...wydarzenie, nazwa: nazwa.trim(), opis, data, godzinaRozpoczecia, godzinaZakonczenia, kolor, miejsce, uczestnicy });
  }

  return (
    <div className="tlo" onClick={zamknij}>
      <div className="okno" onClick={(e) => e.stopPropagation()}>
        <h2>{czyNowe ? "Nowe wydarzenie" : mozeEdytowac ? "Edytuj wydarzenie" : "Wydarzenie"}</h2>
        {!mozeEdytowac && <p className="info">Organizator: {pobierzImie(uzytkownicy, wydarzenie.wlasciciel)}. Możesz tylko podejrzeć wydarzenie.</p>}
        <fieldset disabled={!mozeEdytowac}>
          <label>Nazwa spotkania<input value={nazwa} onChange={(e) => ustawNazwe(e.target.value)} /></label>
          <label>Opis<textarea value={opis} onChange={(e) => ustawOpis(e.target.value)} /></label>
          <label>Data<input type="date" value={data} onChange={(e) => ustawDate(e.target.value)} /></label>
          <div className="dwaPola">
            <label>Od<input type="time" value={godzinaRozpoczecia} onChange={(e) => ustawGodzineRozpoczecia(e.target.value)} /></label>
            <label>Do<input type="time" value={godzinaZakonczenia} onChange={(e) => ustawGodzineZakonczenia(e.target.value)} /></label>
          </div>
          <label>Miejsce<input value={miejsce} onChange={(e) => ustawMiejsce(e.target.value)} /></label>
          <div className="kolory">
            {kolory.map((k) => (
              <button type="button" key={k} className={k === kolor ? "kolor wybrany" : "kolor"} style={{ background: k }} onClick={() => ustawKolor(k)} />
            ))}
          </div>

          <h3>Zaproś znajomych</h3>
          {znajomi.length === 0 && <p className="info">Najpierw dodaj znajomych w sekcji Znajomi.</p>}
          <div className="listaZaproszonych">
            {znajomi.map((id) => (
              <label key={id} className="wiersz">
                <input type="checkbox" checked={zaproszeni.includes(id)} onChange={() => przelaczOsobe(id)} />
                {pobierzImie(uzytkownicy, id)}
              </label>
            ))}
          </div>
        </fieldset>

        {!czyNowe && wydarzenie.uczestnicy.length > 0 && <p className="info">{opisUczestnikow(wydarzenie, uzytkownicy)}</p>}

        {mozeEdytowac && (
          <div className="dostepnosc">
            <h3>Wspólny termin ({data})</h3>
            {prywatni.length > 0 && <p className="info">Prywatny kalendarz: {prywatni.map((id) => pobierzImie(uzytkownicy, id)).join(", ")} (nie da się sprawdzić)</p>}
            <div className="godziny">
              {Array.from({ length: 13 }, (_, i) => i + 8).map((godzina) => {
                const zajeci = zajeciWPrzedziale(godzina * 60, (godzina + 1) * 60);
                return (
                  <button type="button" key={godzina} disabled={zajeci.length > 0} className={zajeci.length === 0 ? "godzina wolna" : "godzina zajeta"} onClick={() => wybierzGodzine(godzina)}>
                    {pelnaGodzina(godzina)}
                    <small>{zajeci.length === 0 ? "wszyscy wolni" : "zajęci: " + zajeci.length}</small>
                  </button>
                );
              })}
            </div>
            {konflikty.length > 0 ? (
              <p className="blad">Konflikty: {konflikty.join(", ")}</p>
            ) : (
              <p className="ok">Wybrany termin pasuje wszystkim</p>
            )}
          </div>
        )}

        {blad && <p className="blad">{blad}</p>}
        <div className="przyciskiOkna">
          {mozeEdytowac && !czyNowe && <button className="przycisk czerwony" onClick={() => usun(wydarzenie.id)}>Usuń</button>}
          <button className="przycisk" onClick={zamknij}>Zamknij</button>
          {mozeEdytowac && <button className="przycisk glowny" onClick={zapiszWydarzenie}>Zapisz</button>}
        </div>
      </div>
    </div>
  );
}
