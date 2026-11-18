import { Wydarzenie, naTekst, naDate, dzisiaj, dodajDni, nazwyMiesiecy, nazwyDni, naMinuty, pelnaGodzina } from "../dane";

type Wlasciwosci = {
  wydarzenia: Wydarzenie[];
  widok: string;
  ustawWidok: (widok: string) => void;
  wybranyDzien: string;
  ustawDzien: (dzien: string) => void;
  dodaj: (data: string, godzina: string) => void;
  edytuj: (wydarzenie: Wydarzenie) => void;
};

export default function Kalendarz({ wydarzenia, widok, ustawWidok, wybranyDzien, ustawDzien, dodaj, edytuj }: Wlasciwosci) {
  const data = naDate(wybranyDzien);
  const dzis = dzisiaj();

  function przesun(kierunek: number) {
    if (widok === "miesiac") {
      const nowa = naDate(wybranyDzien);
      nowa.setDate(1);
      nowa.setMonth(nowa.getMonth() + kierunek);
      ustawDzien(naTekst(nowa));
    } else if (widok === "tydzien") {
      ustawDzien(dodajDni(wybranyDzien, kierunek * 7));
    } else {
      ustawDzien(dodajDni(wybranyDzien, kierunek));
    }
  }

  function wydarzeniaDnia(dzien: string) {
    return wydarzenia
      .filter((w) => w.data === dzien)
      .sort((a, b) => naMinuty(a.godzinaRozpoczecia) - naMinuty(b.godzinaRozpoczecia));
  }

  const przesuniecie = (data.getDay() + 6) % 7;
  const poczatekTygodnia = dodajDni(wybranyDzien, -przesuniecie);
  const dniTygodnia = [0, 1, 2, 3, 4, 5, 6].map((i) => dodajDni(poczatekTygodnia, i));

  const pierwszyDzien = new Date(data.getFullYear(), data.getMonth(), 1);
  const poczatekMiesiaca = dodajDni(naTekst(pierwszyDzien), -((pierwszyDzien.getDay() + 6) % 7));
  const dniMiesiaca = Array.from({ length: 42 }, (_, i) => dodajDni(poczatekMiesiaca, i));

  let tytul = nazwyMiesiecy[data.getMonth()] + " " + data.getFullYear();
  if (widok === "tydzien") {
    tytul = naDate(dniTygodnia[0]).getDate() + " – " + naDate(dniTygodnia[6]).getDate() + " " + nazwyMiesiecy[naDate(dniTygodnia[6]).getMonth()] + " " + naDate(dniTygodnia[6]).getFullYear();
  }
  if (widok === "dzien") {
    tytul = data.getDate() + " " + nazwyMiesiecy[data.getMonth()] + " " + data.getFullYear();
  }

  function karta(w: Wydarzenie) {
    return (
      <button
        key={w.id}
        className="karta"
        style={{ background: w.kolor }}
        onClick={(e) => {
          e.stopPropagation();
          edytuj(w);
        }}
      >
        <b>{w.godzinaRozpoczecia}</b> {w.nazwa}
      </button>
    );
  }

  return (
    <div className="kalendarz">
      <div className="pasekKalendarza">
        <button className="przycisk" onClick={() => ustawDzien(dzis)}>Dzisiaj</button>
        <button className="przyciskIkona" onClick={() => przesun(-1)}>‹</button>
        <button className="przyciskIkona" onClick={() => przesun(1)}>›</button>
        <h2>{tytul}</h2>
        <div className="przelacznik">
          <button className={widok === "miesiac" ? "aktywny" : ""} onClick={() => ustawWidok("miesiac")}>Miesiąc</button>
          <button className={widok === "tydzien" ? "aktywny" : ""} onClick={() => ustawWidok("tydzien")}>Tydzień</button>
          <button className={widok === "dzien" ? "aktywny" : ""} onClick={() => ustawWidok("dzien")}>Dzień</button>
        </div>
      </div>

      {widok === "miesiac" && (
        <div className="siatkaMiesiaca">
          {nazwyDni.map((nazwa) => (
            <div key={nazwa} className="naglowekDnia">{nazwa}</div>
          ))}
          {dniMiesiaca.map((dzien) => {
            const lista = wydarzeniaDnia(dzien);
            const innyMiesiac = naDate(dzien).getMonth() !== data.getMonth();
            return (
              <div
                key={dzien}
                className={"komorka" + (innyMiesiac ? " szara" : "") + (dzien === wybranyDzien ? " wybrana" : "")}
                onClick={() => {
                  ustawDzien(dzien);
                  dodaj(dzien, "09:00");
                }}
              >
                <span className={dzien === dzis ? "numer dzisiaj" : "numer"}>{naDate(dzien).getDate()}</span>
                {lista.slice(0, 3).map((w) => karta(w))}
                {lista.length > 3 && <span className="wiecej">+{lista.length - 3} więcej</span>}
              </div>
            );
          })}
        </div>
      )}

      {widok === "tydzien" && (
        <div className="siatkaTygodnia">
          {dniTygodnia.map((dzien, i) => (
            <div key={dzien} className="kolumnaDnia">
              <div className={"naglowekTygodnia" + (dzien === dzis ? " dzisiaj" : "")} onClick={() => { ustawDzien(dzien); ustawWidok("dzien"); }}>
                {nazwyDni[i]} {naDate(dzien).getDate()}
              </div>
              <div className="zawartoscDnia" onClick={() => dodaj(dzien, "09:00")}>
                {wydarzeniaDnia(dzien).map((w) => karta(w))}
              </div>
            </div>
          ))}
        </div>
      )}

      {widok === "dzien" && (
        <div className="widokDnia">
          {Array.from({ length: 24 }, (_, godzina) => (
            <div key={godzina} className="wierszGodziny" onClick={() => dodaj(wybranyDzien, pelnaGodzina(godzina))}>
              <span className="etykietaGodziny">{pelnaGodzina(godzina)}</span>
              <div className="wydarzeniaGodziny">
                {wydarzeniaDnia(wybranyDzien)
                  .filter((w) => Math.floor(naMinuty(w.godzinaRozpoczecia) / 60) === godzina)
                  .map((w) => (
                    <button key={w.id} className="karta duza" style={{ background: w.kolor }} onClick={(e) => { e.stopPropagation(); edytuj(w); }}>
                      <b>{w.godzinaRozpoczecia} – {w.godzinaZakonczenia}</b> {w.nazwa}
                      {w.miejsce && <span> · {w.miejsce}</span>}
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
