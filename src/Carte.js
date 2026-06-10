import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./Carte.css";
import { useRef } from "react";


// Correction des icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const iconeDefaut = new L.Icon.Default();

const iconeRouge = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  iconRetinaUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});



// Calcul de distance entre 2 points GPS (km)
function calculerDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function Carte() {
  const [arrets, setArrets] = useState([]);
  const [positionUtilisateur, setPositionUtilisateur] = useState(null);
  const [arretsProcheS, setArretsProcheS] = useState([]);
  const mapRef = useRef(null);


  const DAKAR = [14.6928, -17.4467];

  // Charger les arrêts depuis Flask
  useEffect(() => {
    fetch("http://localhost:5000/arrets")
      .then((r) => r.json())
      .then((data) => setArrets(data))
      .catch((err) => console.error("Erreur arrets :", err));
  }, []);

  // Géolocalisation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPositionUtilisateur([
            pos.coords.latitude,
            pos.coords.longitude,
          ]);
        },
        () => console.log("Géolocalisation refusée")
      );
    }
  }, []);


  
  // Trouver les 3 arrêts les plus proches
  useEffect(() => {
    if (positionUtilisateur && arrets.length > 0) {
      const tries = arrets
        .map((a) => ({
          ...a,
          distance: calculerDistance(
            positionUtilisateur[0],
            positionUtilisateur[1],
            a.lat,
            a.lon
          ),
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 3);

      setArretsProcheS(tries);
    }
  }, [positionUtilisateur, arrets]);

  const idsProches = new Set(arretsProcheS.map((a) => a.id));

  return (
    <div style={{ position: "relative" }}>

      {arretsProcheS.length > 0 && (
        <div className="liste-proches">
          <h4>Arrêts les plus proches</h4>
          <ol>
            {arretsProcheS.map((a, i) => (
              <li key={a.id}>
                <strong>{a.nom}</strong> — {(a.distance * 1000).toFixed(0)} m
                <span className="lignes-proches"> ({a.lignes.join(", ")})</span>
              </li>
            ))}
          </ol>
        </div>
      )}

  {positionUtilisateur && (
    <button
      className="bouton-centrer"
      onClick={() => {
        // on stocke une ref vers la carte
        if (mapRef.current) {
          mapRef.current.setView(positionUtilisateur, 15);
        }
      }}
    >
      📍 Centrer sur ma position
    </button>
  )}

  <MapContainer
    center={DAKAR}
    zoom={13}
    className="carte"
    ref={mapRef}
  >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap"
        />

        {arrets.map((a) => (
          <Marker
            key={a.id}
            position={[a.lat, a.lon]}
            icon={idsProches.has(a.id) ? iconeRouge : iconeDefaut}
          >
            <Popup>
              <strong>{a.nom}</strong>
              <br />
              Lignes : {a.lignes.join(", ")}
            </Popup>
          </Marker>

        ))}


        {positionUtilisateur && (
          <Marker position={positionUtilisateur}>
            <Popup>Vous êtes ici</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}

export default Carte;

