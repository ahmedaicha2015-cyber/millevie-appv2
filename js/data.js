/**
 * MILLEVIE DATA ENGINE v3.3
 * Contient toutes les bases de données statiques et les fallbacks critiques.
 */

// --- 1. BASE DE DONNÉES RECETTES (FALLBACK INTERNE) ---
// Si data/recipes_*.json échoue, on utilise cette liste minimale mais complète
const FALLBACK_RECIPES = [
  // Matin (Bouillies/Snacks)
  {id:"FB01", nom:"Bouillie Enrichie Force Maman", categorie:"Bouillies", tempsMin:20, ageMinMois:6, contexteFemme:["grossesse","allaitement"], nutrition:{kcal:320, protG:14, ferMg:9, calciumMg:220}, ingredients:[{nom:"Farine maïs",qte:"300g"},{nom:"Arachide",qte:"2cs"},{nom:"Moringa",qte:"1cc"}], etapes:["Délayer farine","Cuire 10min","Ajouter arachide/moringa"]},
  {id:"FB02", nom:"Akara (Beignets Niébé)", categorie:"Street food", tempsMin:50, ageMinMois:12, contexteFemme:["allaitement"], nutrition:{kcal:280, protG:14, ferMg:5, calciumMg:80}, ingredients:[{nom:"Niébé",qte:"300g"},{nom:"Oignon",qte:"1"},{nom:"Huile palme",qte:"1L"}], etapes:["Tremper niébé nuit","Mixer fouetter","Frire 3min"]},
  {id:"FB03", nom:"Gari Foto Rapide", categorie:"Street food", tempsMin:15, ageMinMois:12, contexteFemme:["grossesse","allaitement"], nutrition:{kcal:320, protG:12, ferMg:3, calciumMg:50}, ingredients:[{nom:"Gari",qte:"200g"},{nom:"Œufs",qte:"3"},{nom:"Tomate/Oignon",qte:"100g"}], etapes:["Revenir oignon/tomate","Brouiller œufs","Ajouter gari/eau chaude"]},
  
  // Midi (Plats Complets)
  {id:"FB04", nom:"Riz Gras Béninois", categorie:"Plats complets", tempsMin:50, ageMinMois:12, contexteFemme:["grossesse","allaitement"], nutrition:{kcal:420, protG:15, ferMg:4, calciumMg:70}, ingredients:[{nom:"Riz",qte:"350g"},{nom:"Tomates",qte:"400g"},{nom:"Bouillon poulet",qte:"700ml"}], etapes:["Rincer riz","Base tomate huile palme","Cuire couvert 20min"]},
  {id:"FB05", nom:"Igname Pilée & Sauce Graine", categorie:"Plats complets", tempsMin:90, ageMinMois:12, contexteFemme:["grossesse","allaitement"], nutrition:{kcal:450, protG:28, ferMg:6, calciumMg:120}, ingredients:[{nom:"Igname",qte:"1.5kg"},{nom:"Noix palme",qte:"1kg"},{nom:"Poulet",qte:"1.5kg"}], etapes:["Extraire lait palme","Cuisson sauce 45min","Piler igname cuite"]},
  {id:"FB06", nom:"Poulet Braisé Maquis", categorie:"Plats complets", tempsMin:60, ageMinMois:12, contexteFemme:["grossesse","allaitement"], nutrition:{kcal:380, protG:35, ferMg:4, calciumMg:60}, ingredients:[{nom:"Poulet local",qte:"1.2kg"},{nom:"Marinade épices",qte:"1 bol"}], etapes:["Mariner 2h+","Braisser charbon 40min"]},
  {id:"FB07", nom:"Alloco Plantain Frit", categorie:"Street food", tempsMin:30, ageMinMois:10, contexteFemme:["grossesse","allaitement"], nutrition:{kcal:350, protG:3, ferMg:2, calciumMg:40}, ingredients:[{nom:"Plantains mûrs",qte:"800g"},{nom:"Huile palme",qte:"500ml"}], etapes:["Couper tranches","Frire 3-4min/côté"]},
  {id:"FB08", nom:"Soupe de Gombo", categorie:"Soupes", tempsMin:50, ageMinMois:10, contexteFemme:["grossesse","allaitement"], nutrition:{kcal:380, protG:25, ferMg:7, calciumMg:150}, ingredients:[{nom:"Gombos",qte:"400g"},{nom:"Poisson fumé",qte:"200g"},{nom:"Afitin",qte:"1cs"}], etapes:["Trancher gombos fin","Base tomate/oignon","Mijoter 20min gluant"]},
  {id:"FB09", nom:"Sauce Arachide Poulet", categorie:"Sauces", tempsMin:50, ageMinMois:12, contexteFemme:["grossesse","allaitement"], nutrition:{kcal:450, protG:32, ferMg:6, calciumMg:90}, ingredients:[{nom:"Pâte arachide",qte:"400g"},{nom:"Poulet",qte:"1.2kg"},{nom:"Eau tiède",qte:"800ml"}], etapes:["Dorer poulet","Base tomate","Diluer arachide eau tiède","Mijoter 45min"]},
  {id:"FB10", nom:"Adalu (Haricots-Maïs)", categorie:"Plats complets", tempsMin:50, ageMinMois:12, contexteFemme:["grossesse","allaitement"], nutrition:{kcal:350, protG:18, ferMg:7, calciumMg:120}, ingredients:[{nom:"Niébé",qte:"1bol"},{nom:"Maïs",qte:"1bol"},{nom:"Crevettes séchées",qte:"poignée"}], etapes:["Tremper haricots","Cuire tendre","Ajouter maïs/base épicée"]}
];

// --- 2. COURBES OMS (WEIGHT FOR AGE) ---
// Données simplifiées mais précises pour les zones critiques (-3SD, -2SD, Médiane, +2SD, +3SD)
// Format: [Mois] -> [z3, z2, Med, z2+, z3+]
const WHO_WFA_BOYS = {
  0:[2.5,2.9,3.3,3.9,4.4], 1:[3.4,4.0,4.5,5.3,6.0], 2:[4.4,5.0,5.6,6.6,7.5],
  3:[5.0,5.7,6.4,7.5,8.5], 4:[5.6,6.4,7.0,8.3,9.4], 5:[6.0,6.9,7.5,8.9,10.1],
  6:[6.4,7.3,7.9,9.4,10.6], 7:[6.7,7.6,8.3,9.8,11.1], 8:[6.9,7.9,8.6,10.2,11.5],
  9:[7.1,8.1,8.9,10.5,11.9], 10:[7.4,8.4,9.2,10.9,12.3], 11:[7.6,8.6,9.4,11.2,12.7],
  12:[7.8,8.9,9.6,11.5,13.0], 18:[9.1,10.3,11.2,13.3,15.0], 24:[10.5,11.8,12.8,15.1,17.0]
};
const WHO_WFA_GIRLS = {
  0:[2.4,2.8,3.2,3.8,4.3], 1:[3.2,3.8,4.2,5.0,5.7], 2:[4.2,4.8,5.3,6.3,7.2],
  3:[4.8,5.5,6.1,7.2,8.2], 4:[5.3,6.0,6.6,7.9,9.0], 5:[5.7,6.5,7.1,8.5,9.7],
  6:[6.0,6.8,7.5,8.9,10.2], 7:[6.3,7.2,7.8,9.3,10.7], 8:[6.5,7.4,8.1,9.7,11.1],
  9:[6.7,7.7,8.4,10.0,11.5], 10:[6.9,7.9,8.6,10.3,11.9], 11:[7.1,8.1,8.9,10.6,12.2],
  12:[7.3,8.4,9.1,10.9,12.6], 18:[8.6,9.8,10.8,12.8,14.6], 24:[9.9,11.2,12.3,14.5,16.5]
};

// --- 3. ACTIVITÉS ÉVEIL (EXTRAIT CLÉ POUR TEST) ---
const ACTIVITES_EVEIL_SAMPLE = [
  {id:'a01', ageMin:0, ageMax:3, type:"Lien", emoji:"🤱", titre:"Peau à peau", duree:20, desc:"Contact direct poitrine bébé nue.", objectifs:["Température","Attachement"], etapes:["Déshabiller bébé","Poser sur poitrine","Couvrir","Parler doucement"]},
  {id:'a02', ageMin:0, ageMax:4, type:"Motricité", emoji:"💪", titre:"Tummy Time", duree:5, desc:"Sur le ventre sous surveillance.", objectifs:["Cou/Dos"], etapes:["Nattek propre","Ventredessus","Jouet devant","2min/jour"]},
  {id:'a05', ageMin:6, ageMax:12, type:"Jeu", emoji:"🙈", titre:"Coucou-Caché", duree:10, desc:"Visage caché puis révélé.", objectifs:["Permanence objet"], etapes:["Cacher mains/pagne","Dire 'Où?'","Révéler 'Coucou!'","Répéter"]}
];

// --- EXPORTATION VERS GLOBAL SCOPE ---
window.MILLEVIE_DATA = {
  FALLBACK_RECIPES,
  WHO_WFA_BOYS,
  WHO_WFA_GIRLS,
  ACTIVITES_EVEIL_SAMPLE
};
