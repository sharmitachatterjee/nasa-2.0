// ABNF Multilingual i18n Matrix (English, Español, Français, हिन्दी)
const TRANSLATIONS = {
  en: {
    nav_home: "Home",
    nav_explore: "Explore",
    nav_stories: "Stories",
    nav_quiz: "Quiz",
    nav_signal: "Signal Delay",
    nav_then_now: "Then & Now",
    nav_ask: "Ask Machine",
    nav_lander: "Lander Game",
    nav_farewell: "Farewell Wall",
    nav_teachers: "Teacher Pack",
    nav_ar: "AR View",
    nav_login: "Log in",
    nav_signup: "Join mission",
    nav_dashboard: "My dashboard",
    nav_logout: "Log out",
    nav_install: "📱 Install App",

    hero_eyebrow: "THE STORIES BEYOND THE HEADLINES",
    hero_title: "Some missions end. Their stories don’t.",
    hero_copy: "Discover the spacecraft, rovers, and bold ideas left behind in humanity’s exploration of space.",
    hero_btn_explore: "Explore the map",
    hero_btn_stories: "Hear their stories",
    hero_btn_quiz: "Take the quiz",
    hero_btn_signal: "📡 Signal Delay Tool",
    hero_btn_then_now: "⏱️ Then & Now Slider",
    hero_btn_ask: "🤖 Ask the Machine",
    hero_btn_lander: "🚀 Landing Mini-Game",
    hero_btn_farewell: "💌 Farewell Wall",
    hero_btn_teachers: "📚 Educator Pack",
    hero_btn_ar: "🛰️ AR Hologram",

    signal_title: "Deep Space Signal Delay Simulator",
    signal_subtitle: "Experience the real physics of communicating across light-hours in deep space.",
    signal_target_label: "Select Spacecraft Target:",
    signal_btn_send: "Transmit Signal at Light Speed",
    signal_status_idle: "Antenna ready for transmission.",

    ask_title: "Ask the Machine",
    ask_subtitle: "Converse directly with humanity's retired and lost spacecraft, powered by AI.",
    ask_placeholder: "Type a transmission to the spacecraft...",
    ask_btn_send: "Transmit",

    then_now_title: "Then and Now",
    then_now_subtitle: "Interactive before-and-after comparisons of pioneering spacecraft and landing sites.",

    lander_title: "Lunar & Martian Lander",
    lander_subtitle: "Pilot your descent module. Balance thrust and gravity for a safe touchdown.",
    lander_btn_thrust: "FIRE THRUSTER",
    lander_btn_left: "ROTATE LEFT",
    lander_btn_right: "ROTATE RIGHT",
    lander_btn_restart: "Restart Mission",

    farewell_title: "The Farewell Wall",
    farewell_subtitle: "Leave a tribute note for the robotic pioneers that carried our dreams.",
    farewell_btn_leave: "Leave a Tribute",

    footer_tag: "ABNF · A home for forgotten space stories",
    footer_motto: "Explore. Remember. Wonder."
  },
  es: {
    nav_home: "Inicio",
    nav_explore: "Explorar",
    nav_stories: "Historias",
    nav_quiz: "Cuestionario",
    nav_signal: "Retardo de Señal",
    nav_then_now: "Antes y Ahora",
    nav_ask: "Habla con la Nave",
    nav_lander: "Juego Lunar",
    nav_farewell: "Muro de Despedida",
    nav_teachers: "Educadores",
    nav_ar: "Vista RA",
    nav_login: "Iniciar sesión",
    nav_signup: "Unirse",
    nav_dashboard: "Mi panel",
    nav_logout: "Cerrar sesión",
    nav_install: "📱 Instalar App",

    hero_eyebrow: "HISTORIAS MÁS ALLÁ DE LOS TITULARES",
    hero_title: "Algunas misiones terminan. Sus historias no.",
    hero_copy: "Descubre las naves, rovers y audaces ideas olvidadas en la exploración espacial de la humanidad.",
    hero_btn_explore: "Explorar mapa",
    hero_btn_stories: "Escuchar relatos",
    hero_btn_quiz: "Hacer cuestionario",
    hero_btn_signal: "📡 Simulador de Señal",
    hero_btn_then_now: "⏱️ Antes y Ahora",
    hero_btn_ask: "🤖 Habla con la Nave",
    hero_btn_lander: "🚀 Mini-Juego de Aterrizaje",
    hero_btn_farewell: "💌 Muro de Despedida",
    hero_btn_teachers: "📚 Recursos Educativos",
    hero_btn_ar: "🛰️ Holograma RA",

    signal_title: "Simulador de Retardo de Señal",
    signal_subtitle: "Siente la física real de comunicarte a través de horas-luz en el espacio profundo.",
    signal_target_label: "Seleccionar Nave Objetivo:",
    signal_btn_send: "Transmitir Señal a Velocidad de la Luz",
    signal_status_idle: "Antena lista para transmitir.",

    ask_title: "Pregunta a la Máquina",
    ask_subtitle: "Conversa directamente con las naves espaciales retiradas y perdidas mediante IA.",
    ask_placeholder: "Escribe una transmisión a la nave...",
    ask_btn_send: "Transmitir",

    then_now_title: "Antes y Ahora",
    then_now_subtitle: "Comparativas interactivas del antes y después de naves pioneras y sitios de aterrizaje.",

    lander_title: "Módulo de Aterrizaje Lunar y Marciano",
    lander_subtitle: "Pilota tu módulo. Equilibra empuje y gravedad para un aterrizaje seguro.",
    lander_btn_thrust: "ACTIVAR PROPULSOR",
    lander_btn_left: "GIRAR IZQ",
    lander_btn_right: "GIRAR DER",
    lander_btn_restart: "Reiniciar Misión",

    farewell_title: "El Muro de Despedida",
    farewell_subtitle: "Deja un tributo para las pioneras robóticas que llevaron nuestros sueños.",
    farewell_btn_leave: "Dejar un Tributo",

    footer_tag: "ABNF · Un hogar para las historias espaciales olvidadas",
    footer_motto: "Explora. Recuerda. Asómbrate."
  },
  fr: {
    nav_home: "Accueil",
    nav_explore: "Explorer",
    nav_stories: "Récits",
    nav_quiz: "Quiz",
    nav_signal: "Délai Signal",
    nav_then_now: "Avant & Après",
    nav_ask: "Parler à la Sonde",
    nav_lander: "Jeu Atterrisseur",
    nav_farewell: "Mur d'Hommage",
    nav_teachers: "Espace Enseignants",
    nav_ar: "Vue RA",
    nav_login: "Connexion",
    nav_signup: "Rejoindre",
    nav_dashboard: "Tableau de bord",
    nav_logout: "Déconnexion",
    nav_install: "📱 Installer l'App",

    hero_eyebrow: "LES HISTOIRES AU-DELÀ DES TITRES",
    hero_title: "Certaines missions s'achèvent. Leurs histoires perdurent.",
    hero_copy: "Découvrez les sondes, astromobiles et rêves pionniers oubliés de l'exploration spatiale.",
    hero_btn_explore: "Explorer la carte",
    hero_btn_stories: "Écouter les récits",
    hero_btn_quiz: "Participer au quiz",
    hero_btn_signal: "📡 Outil de Délai Signal",
    hero_btn_then_now: "⏱️ Curseur Avant & Après",
    hero_btn_ask: "🤖 Parler à la Machine",
    hero_btn_lander: "🚀 Mini-Jeu Atterrissage",
    hero_btn_farewell: "💌 Mur d'Hommage",
    hero_btn_teachers: "📚 Dossier Enseignants",
    hero_btn_ar: "🛰️ Hologramme RA",

    signal_title: "Simulateur de Délai de Signal Spatial",
    signal_subtitle: "Ressentez la physique des signaux traversant des heures-lumière dans l'espace.",
    signal_target_label: "Choisir la Sonde Cible :",
    signal_btn_send: "Émettre le Signal à la Vitesse de la Lumière",
    signal_status_idle: "Antenne prête à émettre.",

    ask_title: "Interroger la Machine",
    ask_subtitle: "Dialogue interactif avec les sondes spatiales disparues, propulsé par l'IA.",
    ask_placeholder: "Rédigez un message à la sonde...",
    ask_btn_send: "Émettre",

    then_now_title: "Avant et Maintenant",
    then_now_subtitle: "Comparaisons interactives avant/après de sondes emblématiques et sites lunaires.",

    lander_title: "Atterrisseur Lunaire & Martien",
    lander_subtitle: "Pilotez votre module. Maîtrisez poussée et gravité pour un atterrissage en douceur.",
    lander_btn_thrust: "PROPULSEUR",
    lander_btn_left: "PIVOT GAUCHE",
    lander_btn_right: "PIVOT DROITE",
    lander_btn_restart: "Recommencer la Mission",

    farewell_title: "Le Mur d'Adieu",
    farewell_subtitle: "Laissez un mot d'hommage aux pionniers robotiques qui ont porté nos rêves.",
    farewell_btn_leave: "Laisser un Hommage",

    footer_tag: "ABNF · Le refuge des mémoires spatiales oubliées",
    footer_motto: "Explorer. Se souvenir. S'émerveiller."
  },
  hi: {
    nav_home: "होम",
    nav_explore: "खोजें",
    nav_stories: "कहानियां",
    nav_quiz: "प्रश्नोत्तरी",
    nav_signal: "सिग्नल विलंब",
    nav_then_now: "तब और अब",
    nav_ask: "मशीन से पूछें",
    nav_lander: "लैंडर गेम",
    nav_farewell: "विदाई दीवार",
    nav_teachers: "शिक्षक पैक",
    nav_ar: "एआर दृश्य",
    nav_login: "लॉग इन",
    nav_signup: "शामिल हों",
    nav_dashboard: "मेरा डैशबोर्ड",
    nav_logout: "लॉग आउट",
    nav_install: "📱 ऐप इंस्टॉल करें",

    hero_eyebrow: "सुर्खियों से परे की कहानियां",
    hero_title: "कुछ मिशन समाप्त होते हैं। उनकी कहानियां कभी नहीं।",
    hero_copy: "मानव अंतरिक्ष अन्वेषण में पीछे छूटे अंतरिक्ष यान, रोवर और साहसिक विचारों को जानें।",
    hero_btn_explore: "मानचित्र देखें",
    hero_btn_stories: "कहानियां सुनें",
    hero_btn_quiz: "क्विज़ खेलें",
    hero_btn_signal: "📡 सिग्नल डिले टूल",
    hero_btn_then_now: "⏱️ तब और अब स्लाइडर",
    hero_btn_ask: "🤖 मशीन से बात करें",
    hero_btn_lander: "🚀 लैंडिंग मिनी-गेम",
    hero_btn_farewell: "💌 विदाई दीवार",
    hero_btn_teachers: "📚 शिक्षक किट",
    hero_btn_ar: "🛰️ एआर होलोग्राम",

    signal_title: "डीप स्पेस सिग्नल विलंब सिम्युलेटर",
    signal_subtitle: "गहरे अंतरिक्ष में प्रकाश-घंटों की दूरी पर संचार की वास्तविक भौतिकी का अनुभव करें।",
    signal_target_label: "अंतरिक्ष यान चुनें:",
    signal_btn_send: "प्रकाश की गति से सिग्नल भेजें",
    signal_status_idle: "एंटीना संदेश भेजने के लिए तैयार है।",

    ask_title: "मशीन से पूछें",
    ask_subtitle: "एआई के माध्यम से सेवानिवृत्त और खोए अंतरिक्ष यानों से सीधे बात करें।",
    ask_placeholder: "अंतरिक्ष यान के लिए संदेश लिखें...",
    ask_btn_send: "ट्रांसमिट करें",

    then_now_title: "तब और अब",
    then_now_subtitle: "अंतरिक्ष यानों और लैंडिंग साइटों की पहले और बाद की इंटरैक्टिव तुलना।",

    lander_title: "लूनर और मार्स लैंडर",
    lander_subtitle: "सुरक्षित लैंडिंग के लिए थ्रस्ट और गुरुत्वाकर्षण को संतुलित करें।",
    lander_btn_thrust: "थ्रस्टर चालू करें",
    lander_btn_left: "बाएं मुड़ें",
    lander_btn_right: "दाएं मुड़ें",
    lander_btn_restart: "पुनः प्रयास करें",

    farewell_title: "विदाई दीवार",
    farewell_subtitle: "हमारे सपनों को ले जाने वाले रोबोटिक अग्रदूतों के लिए संदेश छोड़ें।",
    farewell_btn_leave: "संदेश लिखें",

    footer_tag: "ABNF · भूली हुई अंतरिक्ष कहानियों का संगम",
    footer_motto: "खोजें। याद रखें। विस्मय करें।"
  }
};

let currentLang = localStorage.getItem("abnf_lang") || "en";

function setLanguage(lang) {
  if (!TRANSLATIONS[lang]) lang = "en";
  currentLang = lang;
  localStorage.setItem("abnf_lang", lang);
  document.documentElement.lang = lang;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    if (TRANSLATIONS[lang][key]) {
      el.textContent = TRANSLATIONS[lang][key];
    }
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.dataset.i18nPlaceholder;
    if (TRANSLATIONS[lang][key]) {
      el.placeholder = TRANSLATIONS[lang][key];
    }
  });

  // Update language select elements
  document.querySelectorAll(".lang-select").forEach((sel) => {
    sel.value = lang;
  });

  window.dispatchEvent(new CustomEvent("abnf-language-changed", { detail: { lang } }));
}

function initI18n() {
  // Inject or wire up language selector in header
  const header = document.querySelector(".site-header");
  if (header && !document.querySelector(".lang-selector-wrapper")) {
    const wrapper = document.createElement("div");
    wrapper.className = "lang-selector-wrapper";
    wrapper.innerHTML = `
      <select class="lang-select" aria-label="Choose Language">
        <option value="en">🇺🇸 EN</option>
        <option value="es">🇪🇸 ES</option>
        <option value="fr">🇫🇷 FR</option>
        <option value="hi">🇮🇳 HI</option>
      </select>
    `;
    const actions = header.querySelector(".header-actions");
    if (actions) {
      actions.prepend(wrapper);
    } else {
      header.appendChild(wrapper);
    }

    wrapper.querySelector(".lang-select").addEventListener("change", (e) => {
      setLanguage(e.target.value);
    });
  }

  setLanguage(currentLang);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initI18n);
} else {
  initI18n();
}

window.abnfI18n = {
  setLanguage,
  getLanguage: () => currentLang,
  t: (key) => TRANSLATIONS[currentLang]?.[key] || TRANSLATIONS.en[key] || key
};
