import { Uzytkownik, ja } from "../dane";

type Wlasciwosci = {
  uzytkownicy: Uzytkownik[];
  zmienUzytkownika: (uzytkownik: Uzytkownik) => void;
  przywrocDane: () => void;
};

export default function Ustawienia({ uzytkownicy, zmienUzytkownika, przywrocDane }: Wlasciwosci) {
  const uzytkownik = uzytkownicy.find((u) => u.id === ja) as Uzytkownik;

  return (
    <div className="strona">
      <h2>Ustawienia</h2>
      <label>Twoje imię<input value={uzytkownik.imie} onChange={(e) => zmienUzytkownika({ ...uzytkownik, imie: e.target.value })} /></label>
      <label className="wiersz">
        <input type="checkbox" checked={uzytkownik.udostepniaKalendarz} onChange={(e) => zmienUzytkownika({ ...uzytkownik, udostepniaKalendarz: e.target.checked })} />
        Udostępniaj mój kalendarz znajomym
      </label>
      <button className="przycisk czerwony" onClick={przywrocDane}>Przywróć dane przykładowe</button>
    </div>
  );
}
