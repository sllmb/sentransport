import json
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Charger les données depuis le fichier JSON
with open("lignes_ddd.json", "r", encoding="utf-8") as f:
    lignes = json.load(f)

with open("arrets.json", "r", encoding="utf-8") as f:
    arrets = json.load(f)

@app.route("/arrets")
def get_arrets():
    return jsonify(arrets)


@app.route("/")
def accueil():
    return jsonify({
        "message": "Bienvenue sur l'API SenTransport !",
        "endpoints": ["/lignes", "/lignes/<id>"]
    })

@app.route("/lignes")
def get_lignes():
    return jsonify(lignes)

@app.route("/lignes/<int:ligne_id>")
def get_ligne(ligne_id):
    ligne = next((l for l in lignes if l["id"] == ligne_id), None)
    if ligne is None:
        return jsonify({"erreur": "Ligne non trouvée"}), 404
    return jsonify(ligne)

# --- EXERCICE 1 : GET /arrets ---

# @app.route("/arrets")
# def get_arrets():
#     tous_les_arrets = set()  # un set() ne garde pas les doublons

#     for ligne in lignes:
#         for arret in ligne["listeArrets"]:
#             tous_les_arrets.add(arret)

#     return jsonify(sorted(list(tous_les_arrets)))

# --- EXERCICE 2 : GET /stats ---

@app.route("/stats")
def get_stats():
    nombre_lignes = len(lignes)
    total_arrets = sum(ligne["arrets"] for ligne in lignes)
    ligne_max = max(lignes, key=lambda l: l["arrets"])

    return jsonify({
        "nombre_total_lignes": nombre_lignes,
        "nombre_total_arrets": total_arrets,
        "ligne_plus_darrets": {
            "numero": ligne_max["numero"],
            "depart": ligne_max["depart"],
            "arrivee": ligne_max["arrivee"],
            "arrets": ligne_max["arrets"]
        }
    })


# --- EXERCICE 3 : GET /lignes/recherche?q=... ---

@app.route("/lignes/recherche")
def recherche_lignes():
    from flask import request
    q = request.args.get("q", "")

    if q == "":
        return jsonify({"erreur": "Parametre q manquant"}), 400

    resultats = [
        l for l in lignes
        if q.lower() in l["depart"].lower() or q.lower() in l["arrivee"].lower()
    ]

    return jsonify({
        "recherche": q,
        "nombre_resultats": len(resultats),
        "lignes": resultats
    })

if __name__ == "__main__":
    app.run(debug=True, port=5000)
