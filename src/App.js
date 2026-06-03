import { useState, useEffect } from 'react'; 
import './App.css';
import Header from './Header';
import Recherche from './Recherche';
import LigneBus from './LigneBus';
import DetailLigne from './DetailLigne';
import Carte from "./Carte";
import ListeLignes from './ListeLignes';
import Footer from './Footer';
import StatReseau from './StatReseau';

function App() {
  // --- Les 3 nouveaux états pour l'API ---
  const [lignes, setLignes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  // --- Vos états existants (inchangés) ---
  const [recherche, setRecherche] = useState("");
  const [ligneSelectionnee, setLigneSelectionnee] = useState(null);
  const [nbRecherches, setNbRecherches] = useState(0);

 // Fonction séparée pour pouvoir la réutiliser
function chargerLignes() {
  setChargement(true);
  setErreur(null);
  fetch("http://localhost:5000/lignes")
    .then(response => {
      if (!response.ok) {
        throw new Error("Erreur serveur : " + response.status);
      }
      return response.json();
    })
    .then(data => {
      setLignes(data);
      setChargement(false);
    })
    .catch(error => {
      setErreur(error.message);
      setChargement(false);
    });
}

// useEffect appelle simplement la fonction
useEffect(() => {
  chargerLignes();
}, []);

  const lignesFiltrees = lignes.filter((l) =>
    l.depart.toLowerCase().includes(recherche.toLowerCase()) ||
    l.arrivee.toLowerCase().includes(recherche.toLowerCase()) ||
    l.numero.includes(recherche)
  );

  function handleClickLigne(ligne) {
  // Si on reclique sur la même ligne, on ferme le détail
  if (ligneSelectionnee && ligneSelectionnee.id === ligne.id) {
    setLigneSelectionnee(null);
    return;
  }

  // Sinon on fetch les détails depuis Flask
  fetch(`http://localhost:5000/lignes/${ligne.id}`)
    .then(response => {
      if (!response.ok) {
        throw new Error("Erreur serveur : " + response.status);
      }
      return response.json();
    })
    .then(data => {
      setLigneSelectionnee(data);
    })
    .catch(error => {
      console.error("Erreur chargement détail :", error.message);
    });
}

    <button className="btn-recharger" onClick={chargerLignes}>
    Recharger
  </button>

  function handleRecherche(valeur) {
    setRecherche(valeur);
    setNbRecherches(nb => nb + 1);
  }

  // --- Écran 1 : Chargement ---
  if (chargement) {
    return (
      <div className="App">
        <Header />
        <main className="contenu">
          <p className="message-chargement">Chargement des lignes...</p>
        </main>
        <Footer />
      </div>
    );
  }

  // --- Écran 2 : Erreur ---
  if (erreur) {
    return (
      <div className="App">
        <Header />
        <main className="contenu">
          <div className="message-erreur">
            <p>Impossible de charger les lignes.</p>
            <p className="erreur-detail">{erreur}</p>
            <p>Vérifiez que le serveur Flask est lancé (python api/app.py).</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // --- Écran 3 : Succès ---
  return (
    <div className="App">
      <Header />

      <main className="contenu">
        <Recherche
          valeur={recherche}
          onChange={handleRecherche}
        />

        {nbRecherches > 0 && (
          <p className="compteur-recherche">
            Vous avez effectué {nbRecherches} recherche(s)
          </p>
        )}

        <p className="resultat-recherche">
          {lignesFiltrees.length} ligne
          {lignesFiltrees.length > 1 ? "s" : ""} trouvée
          {lignesFiltrees.length > 1 ? "s" : ""}
        </p>

        {lignesFiltrees.length === 0 ? (
          <p className="aucun-resultat">
            Aucune ligne trouvée pour "{recherche}"
          </p>
        ) : (
          lignesFiltrees.map(ligne => (
            <LigneBus
              key={ligne.id}
              numero={ligne.numero}
              depart={ligne.depart}
              arrivee={ligne.arrivee}
              arrets={ligne.arrets}
              estSelectionnee={ligneSelectionnee && ligneSelectionnee.id === ligne.id}
              onClick={() => handleClickLigne(ligne)}
            />
          ))
        )}

        {ligneSelectionnee && (
          <DetailLigne ligne={ligneSelectionnee} />
        )}
        <Carte/>
      </main>

      <Footer />
    </div>
  );
}

export default App;