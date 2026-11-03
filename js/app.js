/**
 * MILLEVIE APP ENGINE v3.3
 * Logique Métier, Rendu UI, i18n, Gestion État
 */

// --- CONFIGURATION & ÉTAT ---
const STORAGE_KEY = 'millevie_v3';
let State = {
  lang: 'fr', theme: 'auto', activeProfile: 'child', mother: { name: '', commune: 'Cotonou' },
  children: [], activeChildId: null, lmp: '', conceptionDate: '',
  pantry: [], searchQuery: '', measurements: [], vaccineRecords: {}, visitRecords: {}, 
  userCenters: [], quizAnswers: {}, kickCounter: { date: '', count: 0 }, pregnancyJournal: [], sportDay: 0
};

try { const saved = localStorage.getItem(STORAGE_KEY); if(saved) State = Object.assign(State, JSON.parse(saved)); } catch(e){}
function persist(){ try { localStorage.setItem(STORAGE_KEY, JSON.stringify(State)); } catch(e){} }

// Variables Globales de Données
let RECIPES_DB = [];
let WHO_DATA = null;
let DANGER_SIGNS = { femme:[], enfant:[] };
let QUIZ_ITEMS = [];
let ACTIVITES_EVEIL = [];
let PROGRAMME_SPORT_T2 = [];
let AI_RULES = [];
let KB_AI = [];

// --- INTERNATIONALISATION (i18n) ---
const I18N = {
  fr: { 
    subtitle:"1000 jours pour bien grandir", nav_today:"Aujourd'hui", nav_cook:"Cuisiner", nav_grow:"Croissance", nav_health:"Santé", nav_more:"Plus", 
    menu_title:"Votre menu du jour", objective_label:"Objectif nutritionnel", btn_config:"Compléter mon profil", msg_no_recipe:"Aucune suggestion", loading:"Chargement..."
  },
  en: { 
    subtitle:"1000 days to grow well", nav_today:"Today", nav_cook:"Cooking", nav_grow:"Growth", nav_health:"Health", nav_more:"More", 
    menu_title:"Your Daily Menu", objective_label:"Nutritional Goal", btn_config:"Complete Profile", msg_no_recipe:"No suggestion", loading:"Loading..."
  }
};
function t(key) { return I18N[State.lang]?.[key] || key; }
function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => el.textContent = t(el.dataset.i18n));
}

// --- INITIALISATION ASYNCHRONE ---
async function initApp() {
  updateProgress(10);
  
  // 1. Charger Données Externes (avec Timeout/Fallback)
  await loadExternalData();
  updateProgress(40);

  // 2. Initialiser Données Internes Critiques (OMS, Sport, Éveil, IA)
  injectInternalCoreData();
  updateProgress(70);

  // 3. Appliquer Traductions
  applyTranslations();
  
  // 4. Démarrer Interface
  renderNav();
  setTab('today');
  hideSplashScreen();
}

function updateProgress(percent) {
  const bar = document.getElementById('load-progress');
  if(bar) bar.style.width = percent + '%';
}

function hideSplashScreen() {
  setTimeout(() => {
    const splash = document.getElementById('splash-screen');
    if(splash) splash.classList.add('hidden');
  }, 800);
}

// --- CHARGEMENT DES DONNÉES EXTERNES (Vos JSON) ---
async function loadExternalData() {
  const safeFetch = async (url, timeoutMs = 3000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const resp = await fetch(url, { signal: controller.signal });
      clearTimeout(id);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      return await resp.json();
    } catch (e) {
      console.warn(`Échec chargement ${url}:`, e.message);
      return null;
    }
  };

  // A. Recettes
  let loadedRecipes = [];
  const files = ['data/recipes_1.json','data/recipes_2.json','data/recipes_3.json','data/recipes_4.json'];
  for(let f of files) {
    const data = await safeFetch(f);
    if(Array.isArray(data)) loadedRecipes = loadedRecipes.concat(expandCompactFormat(data));
  }
  
  // FALLBACK MASSIF SI LES JSON SONT VIDES OU ABSENTS
  if(loadedRecipes.length === 0) {
    console.log("Utilisation des recettes internes de secours...");
    loadedRecipes = window.MILLEVIE_DATA.FALLBACK_RECIPES;
  }
  RECIPES_DB = loadedRecipes;

  // B. Autres données
  WHO_DATA = await safeFetch('data/who_growth.json') || { boys_wfa: window.MILLEVIE_DATA.WHO_WFA_BOYS, girls_wfa: window.MILLEVIE_DATA.WHO_WFA_GIRLS };
  DANGER_SIGNS = await safeFetch('data/danger_signs.json') || getDefaultDangerSigns();
  QUIZ_ITEMS = await safeFetch('data/quiz.json') || getDefaultQuiz();
  ACTIVITES_EVEIL = await safeFetch('data/activities.json') || window.MILLEVIE_DATA.ACTIVITES_EVEIL_SAMPLE;
}

function expandCompactFormat(arr) {
  return arr.map(r => ({
    id: r[0], nom: r[1], categorie: r[2], tempsMin: r[3], ageMinMois: r[4], contexteFemme: (r[5]||'').split(','),
    nutrition: { kcal:r[6], protG:r[7], ferMg:r[8], calciumMg:r[9] },
    ingredients: typeof r[10]==='string'?r[10].split('|').map(x=>{const p=x.split(':');return{nom:p[0],qte:p[1]||''}}):[],
    etapes: typeof r[11]==='string'?r[11].split('|'):[]
  }));
}

function getDefaultDangerSigns() {
  return {
    femme: ["Saignements abondants", "Convulsions", "Fièvre élevée", "Bébé bouge peu"],
    enfant: ["Refuse de boire", "Vomissements en jet", "Respiration difficile", "Fièvre < 3 mois"]
  };
}
function getDefaultQuiz() {
  return [{theme:'Allaitement', q:"Besoin d'eau avant 6 mois ?", vrai:false, exp:"Non, lait maternel suffit."}];
}

// --- INJECTION DONNÉES INTERNES (Sport, IA) ---
function injectInternalCoreData() {
  // Programme Sport T2 (Extrait simplifié pour demo)
  PROGRAMME_SPORT_T2 = [
    {jour:"Lundi", focus:"Bas Corps", emoji:"❤️", duree:"15 min", exos:[{nom:"Squats Mur", rep:"3x10", detail:"Dos plaqué mur, ballon bas dos."}]},
    {jour:"Mardi", focus:"Relax", emoji:"🧘", duree:"10 min", exos:[{nom:"Dos Rond Creux", rep:"10 fois", detail:"Quatre pattes, arrondir puis creuser."}]}
  ];
  
  // IA Rules (Extrait)
  AI_RULES = [
    {keywords:['fievre','fièvre'], response:"🌡️ Fièvre bébé :\n• <3 mois = URGENCE.\n• Déshabiller, hydrater (sein).\n• Pas d'auto-médication.", actions:[['🚨 Urgences','danger']]},
    {keywords:['allaitement','sein'], response:"🤱 Allaitez à la demande (8-12x/24h). Exclusif jusqu'à 6 mois.", actions:[['📅 Menu','today']]}
  ];
  KB_AI = [{q:"recette rapide", a:"Essayez le Gari Foto ou l'Alloco."}];
}

// --- MOTEUR LOGIQUE MÉTIER ---
const MS_DAY = 86400000;
const parseD = s => s ? new Date(s+'T00:00:00') : new Date();
const diffDays = (a,b) => Math.round((b-a)/MS_DAY);
const addDays = (d,n) => new Date(d.getTime()+n*MS_DAY);
const todayISO = () => new Date().toISOString().split('T')[0];
const formatD = d => d.toLocaleDateString(State.lang==='fr'?'fr-FR':'en-US',{day:'numeric',month:'short',year:'numeric'});

function getCurrentChild() { return State.activeProfile==='child' && State.activeChildId ? State.children.find(c=>c.id===State.activeChildId) : null; }
function dateConception() {
  if(State.activeProfile==='preg') { if(State.conceptionDate) return parseD(State.conceptionDate); if(State.lmp) return addDays(parseD(State.lmp), 14); }
  else { const c=getCurrentChild(); if(c&&c.dob) return addDays(parseD(c.dob), -270); }
  return null;
}
function jourCourant() { const c=dateConception(); return c ? diffDays(c, new Date()) : -1; }
function contexteJour(j) {
  if(j<0)return 'prep'; if(j<=90)return 'grossesse_T1'; if(j<=270)return 'grossesse_T2T3'; 
  if(j<=453)return 'allaitement'; if(j<=543)return 'enfant_6_9m'; if(j<=633)return 'enfant_9_12m'; return 'enfant_12_24m';
}

// Génération Menu Intelligent (Ne laisse JAMAIS un slot vide si DB > 0)
function proposeMenuJour(j) {
  const ctx = contexteJour(j);
  const slots = {};
  const moments = ['matin','midi','soir'];
  
  moments.forEach(moment => {
    let candidates = RECIPES_DB.filter(r => recipeAgeOk(r, ctx));
    
    // Priorité catégories spécifiques
    if(moment==='matin') candidates = candidates.filter(r => ['Bouillies','Street food'].includes(r.categorie));
    else if(moment==='midi') candidates = candidates.filter(r => ['Plats complets','Sauces','Féculents'].includes(r.categorie));
    else if(moment==='soir') candidates = candidates.filter(r => ['Soupes','Sauces','Féculents'].includes(r.categorie));

    // Si trop restrictif, on prend tout ce qui convient à l'âge/contexte
    if(candidates.length === 0) candidates = RECIPES_DB.filter(r => recipeAgeOk(r, ctx));
    
    // Score basé sur le garde-manger (pantry)
    candidates.sort((a,b) => scoreIngredients(b, State.pantry) - scoreIngredients(a, State.pantry));
    
    slots[moment] = candidates[0] || null;
  });
  return { jour:j, contexte:ctx, slots };
}

function recipeAgeOk(rec, ctx) {
  if(ctx.startsWith('enfant')) {
    const monthsNeeded = ctx==='enfant_6_9m'?7 : ctx==='enfant_9_12m'?10 : 18;
    return (rec.ageMinMois||0) <= monthsNeeded;
  }
  return (rec.contexteFemme||[]).some(tag => tag.includes('grossesse') || tag.includes('allaitement'));
}
function scoreIngredients(rec, pantry) {
  if(!rec.ingredients?.length) return 0;
  const names = rec.ingredients.map(i=>i.nom.toLowerCase());
  const p = pantry.map(x=>x.toLowerCase());
  let matches = 0;
  names.forEach(n => { if(p.some(pp => n.includes(pp) || pp.includes(n))) matches++; });
  return matches / names.length;
}

// --- INTERFACE UTILISATEUR (RENDERING) ---
let currentView = 'today';
const NAV_CONFIG = [
  {id:'today', icon:'home'}, {id:'cook', icon:'chef'}, {id:'grow', icon:'chart'}, 
  {id:'health', icon:'heart'}, {id:'more', icon:'dots'}
];

function getIconSVG(name) {
  const icons = {
    home:'<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    chef:'<path d="M6 13.87A4 4 0 0 1 7.41 6.41a5.5 5.5 0 0 1 9.18 0A4 4 0 0 1 18 13.87V21H6z"/>',
    chart:'<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
    heart:'<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
    dots:'<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>'
  };
  return `<svg viewBox="0 0 24 24">${icons[name]}</svg>`;
}

function renderNav() {
  const nav = document.getElementById('nav');
  nav.innerHTML = NAV_CONFIG.map(item => `
    <button class="${currentView===item.id?'on':''}" onclick="setTab('${item.id}')">
      ${getIconSVG(item.icon)}
      <span>${t('nav_'+item.id)}</span>
    </button>`).join('');
}

function setTab(view) {
  currentView = view;
  renderNav();
  const main = document.getElementById('m');
  main.innerHTML = ''; 
  
  const wrapper = document.createElement('div');
  wrapper.className = 'anim-up';
  main.appendChild(wrapper);
  
  switch(view) {
    case 'today': wrapper.innerHTML = ViewToday(); break;
    case 'cook': wrapper.innerHTML = ViewCook(); break;
    case 'grow': wrapper.innerHTML = ViewGrow(); break;
    case 'health': wrapper.innerHTML = ViewHealth(); break;
    case 'more': wrapper.innerHTML = ViewMore(); break;
    default: wrapper.innerHTML = ViewToday();
  }
  window.scrollTo(0,0);
}

// --- VUES PRINCIPALES ---
function ViewToday() {
  const j = jourCourant();
  if(j < 0) return `<div class="card warn"><h3>Profil requis</h3><button class="btn full" onclick="setTab('profile')">${t('btn_config')}</button></div>`;
  
  const menu = proposeMenuJour(j);
  const ctxLabel = getContextLabel(menu.contexte);
  
  let html = `
    <div class="card card-hero anim-bounce">
      <small>Jour ${j}/1000 · ${ctxLabel}</small>
      <div class="big-num">${Math.floor(j/7)} SA</div>
      <small>Nutrition personnalisée active</small>
    </div>
    <h2>${t('menu_title')}</h2>
  `;
  
  ['matin','midi','soir'].forEach(m => {
    const rec = menu.slots[m];
    html += `
      <div class="slot-card ${m}" onclick="showRecipeDetail('${rec?rec.id:''}')">
        <div class="slot-emoji">${rec?getEmojiCat(rec.categorie):'❓'}</div>
        <div class="slot-content">
          <div style="font-size:12px;color:var(--txt-mu);text-transform:uppercase;font-weight:800;margin-bottom:4px;">${m.toUpperCase()}</div>
          <h3>${rec ? rec.nom : t('msg_no_recipe')}</h3>
          ${rec ? `<div><span class="tag">${rec.nutrition.kcal} kcal</span></div>` : ''}
        </div>
      </div>`;
  });
  
  html += `
    <div class="tiles-grid">
      <button class="tile" onclick="setTab('ai')"><span class="tile-emoji">🤖</span>Assistant IA</button>
      <button class="tile" onclick="setTab('stim')"><span class="tile-emoji">🧸</span>Éveil Bébé</button>
      <button class="tile" onclick="setTab('danger')"><span class="tile-emoji">🚨</span>Urgences</button>
    </div>`;
    
  return html;
}

function ViewCook() {
  return `
    <h2>Cuisine & Pantry</h2>
    <input type="search" placeholder="Rechercher une recette..." oninput="handleSearch(this.value)" style="width:100%;padding:12px;border-radius:12px;border:1px solid var(--bord);margin-bottom:15px;">
    <p class="mu">Cochez vos ingrédients :</p>
    <div class="chips" style="margin-bottom:20px;">
      ${['Maïs','Igname','Poisson','Tomate','Huile palme','Œuf'].map(i => `<button class="chip" onclick="this.classList.toggle('on')">${i}</button>`).join('')}
    </div>
    <h3>Suggestions adaptées :</h3>
    <div id="recipe-list">${renderRecipeList(RECIPES_DB.slice(0,10))}</div>
  `;
}

function ViewGrow() {
  if(!WHO_DATA) return "<p>Données OMS indisponibles.</p>";
  const child = getCurrentChild();
  if(!child) return `<button class="btn full" onclick="setTab('profile')">Ajouter un enfant</button>`;
  
  return `
    <h2>Courbe de Croissance (OMS)</h2>
    <div class="card" style="height:300px;display:flex;align-items:center;justify-content:center;background:var(--vert-pale);">
       <p>Graphique interactif OMS<br>(Basé sur ${State.measurements.length} mesures)</p>
    </div>
    <button class="btn full" onclick="promptMeasure()">➕ Nouvelle Pesée</button>
  `;
}

function ViewHealth() { return `<h2>Santé & Vaccins</h2><p class="mu">Calendrier PEV Bénin actif.</p>`; }
function ViewMore() { return `<h2>Plus d'options</h2><div class="tiles-grid"><button class="tile" onclick="setTab('profile')">👤 Profil</button><button class="tile" onclick="setTab('about')">ℹ️ À propos</button></div>`; }

// --- FONCTIONS UTILITAIRES & HELPERS ---
function toggleDropdown() { document.getElementById('dropdown').classList.toggle('open'); }
function closeDropdown() { document.getElementById('dropdown').classList.remove('open'); }
document.addEventListener('click', e => { if(!e.target.closest('.header-right')&&!e.target.closest('.dropdown')) closeDropdown(); });

function toast(msg, type='') {
  const c = document.getElementById('toasts');
  const el = document.createElement('div');
  el.className = 'toast '+type;
  el.innerText = msg;
  c.appendChild(el);
  setTimeout(()=>el.remove(), 3000);
}

function showRecipeDetail(id) {
  const r = RECIPES_DB.find(x=>x.id===id);
  if(!r) return;
  alert(`Fiche Détaillée:\n\n${r.nom}\nKcal: ${r.nutrition.kcal}\nIngrédients:\n${r.ingredients.map(i=>`- ${i.nom}`).join('\n')}`);
}

function handleSearch(q) {
  const filtered = RECIPES_DB.filter(r => r.nom.toLowerCase().includes(q.toLowerCase()));
  document.getElementById('recipe-list').innerHTML = renderRecipeList(filtered);
}

function renderRecipeList(list) {
  return list.map(r => `
    <div class="slot-card" onclick="showRecipeDetail('${r.id}')">
      <div class="slot-emoji">${getEmojiCat(r.categorie)}</div>
      <div class="slot-content"><h3>${r.nom}</h3><span class="tag">${r.tempsMin} min</span></div>
    </div>`).join('');
}

function getEmojiCat(cat) {
  const map = {'Bouillies':'🥣','Plats complets':'🍲','Sauces':'🥘','Soupes':'🍜','Street food':'🌮','Boissons':'🥤'};
  return map[cat] || '🍽️';
}

function getContextLabel(ctx) {
  const labels = { prep:"Préparation", grossesse_T1:"1er Trim.", grossesse_T2T3:"2e/3e Trim.", allaitement:"Allaitement", enfant_6_9m:"6-9 Mois", enfant_9_12m:"9-12 Mois", enfant_12_24m:"12-24 Mois" };
  return labels[ctx] || ctx;
}

function promptMeasure() {
  const w = prompt("Entrez le poids actuel (kg):");
  if(w && !isNaN(parseFloat(w))) {
    State.measurements.push({date: todayISO(), weight: parseFloat(w)});
    persist();
    toast("Mesure enregistrée", "ok");
    setTab('grow');
  }
}

function toggleLang() {
  State.lang = State.lang === 'fr' ? 'en' : 'fr';
  persist();
  applyTranslations();
  renderNav(); // Re-render nav for labels
  toast(State.lang === 'fr' ? '🇫 Français activé' : '🇬 English enabled', 'ok');
}

// Lancement Application
window.onload = initApp;
