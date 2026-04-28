import './Header.css';

function Header() {
  const date = new Date().toLocaleDateString('fr-FR');
  return (
    <header className="header">
      <h1 className="header-titre">SenTransport</h1>
      <p>Date du jour : {date}</p>
      <p className="header-soustitre">
        Votre guide du transport en commun à Dakar
      </p>
    </header>
  );
}

export default Header;
