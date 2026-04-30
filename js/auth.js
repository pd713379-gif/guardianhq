// ============================================================
// GUARDIANHQ — AUTH.JS
// Firebase Authentication + Firestore + EmailJS
// ============================================================

const firebaseConfig = {
  apiKey:            "AIzaSyBfda3IcQk-bbYHOqKhU4r8wMtOCPjTztc",
  authDomain:        "guardianhq-db216.firebaseapp.com",
  projectId:         "guardianhq-db216",
  storageBucket:     "guardianhq-db216.firebasestorage.app",
  messagingSenderId: "370272351292",
  appId:             "1:370272351292:web:4496bd3fbad791e0fa7f39"
};

// ── EmailJS instellingen ──────────────────────────────────────
const EMAILJS_SERVICE_MAIN     = "service_usefhy9";
const EMAILJS_SERVICE_RESET    = "service_ztd1ojh";

const EMAILJS_TPL_WELCOME      = "template_zbd4wpc";   // Welkomstmail
const EMAILJS_TPL_CONTACT      = "template_0ncr5h7";   // Contact Us
const EMAILJS_TPL_RESET        = "template_fykspxb";   // Password Reset

const EMAILJS_KEY_MAIN         = "Kzu6sQd_AB5cDC0nU";
const EMAILJS_KEY_RESET        = "pWDzQDxhFe0LD8ZpI";

const ADMIN_EMAIL              = "info.guardianhq@gmail.com";
const SITE_URL                 = "https://guardianhq.vercel.app";

let auth          = null;
let db            = null;
let firebaseReady = false;

function initFirebase() {
  try {
    if (typeof firebase !== 'undefined') {
      if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
      auth          = firebase.auth();
      db            = firebase.firestore();
      firebaseReady = true;
      console.log("Firebase + Firestore klaar");
    }
  } catch(e) { console.warn("Firebase fout:", e); }
}

function initEmailJS() {
  try {
    if (typeof emailjs !== 'undefined') emailjs.init(EMAILJS_KEY_MAIN);
  } catch(e) {}
}

// ── Registreren ───────────────────────────────────────────────
async function registerUser(username, email, password) {
  if (!firebaseReady) throw new Error("Verbinding mislukt. Controleer je internetverbinding.");

  // Gebruikersnaam beschikbaar?
  const doc = await db.collection('usernames').doc(username.toLowerCase()).get();
  if (doc.exists) throw new Error("Deze gebruikersnaam is al in gebruik. Kies een andere naam.");

  // Account aanmaken
  let cred;
  try {
    cred = await auth.createUserWithEmailAndPassword(email, password);
    await cred.user.updateProfile({ displayName: username });
  } catch(e) {
    const msgs = {
      'auth/email-already-in-use': 'Dit e-mailadres is al in gebruik.',
      'auth/weak-password':        'Wachtwoord is te zwak (minimaal 6 tekens).',
      'auth/invalid-email':        'Ongeldig e-mailadres.',
    };
    throw new Error(msgs[e.code] || e.message);
  }

  // Sla gebruikersnaam op in Firestore
  await db.collection('usernames').doc(username.toLowerCase()).set({
    username: username, email: email,
    uid: cred.user.uid, createdAt: new Date().toISOString()
  });

  localStorage.setItem('ghq_current_user', JSON.stringify({ username, email }));
  await sendWelcomeMail(username, email);
  return { username, email };
}

// ── Inloggen ──────────────────────────────────────────────────
async function loginUser(email, password) {
  if (!firebaseReady) throw new Error("Verbinding mislukt. Controleer je internetverbinding.");
  try {
    const cred     = await auth.signInWithEmailAndPassword(email, password);
    const username = cred.user.displayName || email.split('@')[0];
    localStorage.setItem('ghq_current_user', JSON.stringify({ username, email }));
    return { username, email };
  } catch(e) {
    const msgs = {
      'auth/user-not-found':     'Geen account gevonden met dit e-mailadres.',
      'auth/wrong-password':     'Onjuist wachtwoord.',
      'auth/invalid-email':      'Ongeldig e-mailadres.',
      'auth/too-many-requests':  'Te veel pogingen. Probeer later opnieuw.',
      'auth/invalid-credential': 'E-mailadres of wachtwoord onjuist.',
    };
    throw new Error(msgs[e.code] || e.message);
  }
}

// ── Wachtwoord resetten ───────────────────────────────────────
async function resetPassword(email) {
  if (!firebaseReady) throw new Error("Verbinding mislukt.");
  if (!email) throw new Error("Vul je e-mailadres in.");

  // Firebase stuurt eigen reset link — wij sturen via EmailJS ook een nette mail
  try {
    await auth.sendPasswordResetEmail(email, {
      url: SITE_URL + '/login.html',
    });
  } catch(e) {
    const msgs = {
      'auth/user-not-found': 'Geen account gevonden met dit e-mailadres.',
      'auth/invalid-email':  'Ongeldig e-mailadres.',
    };
    throw new Error(msgs[e.code] || e.message);
  }

  // Stuur ook onze eigen stijlvolle EmailJS mail
  try {
    if (typeof emailjs !== 'undefined') {
      emailjs.init(EMAILJS_KEY_RESET);
      await emailjs.send(EMAILJS_SERVICE_RESET, EMAILJS_TPL_RESET, {
        to_email:  email,
        to_name:   email.split('@')[0],
        from_name: "GuardianHQ",
        reply_to:  ADMIN_EMAIL,
        site_url:  SITE_URL,
        login_url: SITE_URL + '/login.html',
      }, EMAILJS_KEY_RESET);
      // Zet main key terug
      emailjs.init(EMAILJS_KEY_MAIN);
    }
  } catch(e) {
    console.warn("Reset EmailJS fout:", e);
    // Niet gooien — Firebase reset werkt al
  }
}

// ── Welkomstmail ──────────────────────────────────────────────
async function sendWelcomeMail(username, email) {
  try {
    if (typeof emailjs === 'undefined') return;
    // Mail naar gebruiker
    await emailjs.send(EMAILJS_SERVICE_MAIN, EMAILJS_TPL_WELCOME, {
      to_email:       email,
      to_name:        username,
      from_name:      "GuardianHQ",
      reply_to:       ADMIN_EMAIL,
      gebruikersnaam: username,
      emailadres:     email,
      site_url:       SITE_URL,
    });
    // Notificatie naar admin
    await emailjs.send(EMAILJS_SERVICE_MAIN, EMAILJS_TPL_WELCOME, {
      to_email:       ADMIN_EMAIL,
      to_name:        "Admin",
      from_name:      "GuardianHQ Systeem",
      reply_to:       email,
      gebruikersnaam: username,
      emailadres:     email,
      site_url:       SITE_URL,
    });
  } catch(e) { console.warn("Welkomstmail fout:", e); }
}

// ── Contact formulier ─────────────────────────────────────────
async function sendContactEmail({ from_name, reply_to, subject, message }) {
  if (typeof emailjs === 'undefined') throw new Error("EmailJS niet geladen.");
  await emailjs.send(EMAILJS_SERVICE_MAIN, EMAILJS_TPL_CONTACT, {
    from_name, reply_to, subject, message,
    to_email:  ADMIN_EMAIL,
    site_name: "GuardianHQ",
  });
}

// ── Uitloggen ─────────────────────────────────────────────────
function logoutUser() {
  localStorage.removeItem('ghq_current_user');
  if (firebaseReady && auth) auth.signOut().catch(() => {});
  window.location.href = 'index.html';
}

function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem('ghq_current_user')); }
  catch { return null; }
}

function isBungieLinked() {
  return !!localStorage.getItem('bungie_access_token');
}

// ── Nav avatar ────────────────────────────────────────────────
function getNavAvatarHtml(user) {
  const type    = localStorage.getItem('ghq_avatar_type') || 'icon';
  const photo   = localStorage.getItem('ghq_avatar_photo');
  const emoji   = localStorage.getItem('ghq_avatar') || '';
  const initials = user ? user.username.slice(0,2).toUpperCase() : '?';
  if (type === 'photo' && photo) {
    return `<div class="nav-avatar" style="padding:0;overflow:hidden"><img src="${photo}" style="width:100%;height:100%;object-fit:cover;border-radius:50%"></div>`;
  } else if (emoji && emoji !== '⬡') {
    return `<div class="nav-avatar" style="font-size:0.95rem">${emoji}</div>`;
  } else {
    return `<div class="nav-avatar">${initials}</div>`;
  }
}

function updateNav() {
  const user    = getCurrentUser();
  const navAuth = document.getElementById('navAuth');
  if (!navAuth) return;

  const navLinks = document.querySelectorAll('.nav-center a');
  navLinks.forEach(link => {
    const href        = link.getAttribute('href') || '';
    const isProtected = href.includes('destiny.html') || href.includes('profile.html');
    if (isProtected) link.style.display = user ? '' : 'none';
  });

  if (user) {
    navAuth.innerHTML = `
      <div class="nav-user">
        ${getNavAvatarHtml(user)}
        <span class="nav-username">${user.username}</span>
      </div>
      <button class="btn btn-ghost" onclick="logoutUser()">Uitloggen</button>`;
  } else {
    navAuth.innerHTML = `
      <a href="login.html" class="btn btn-ghost">Inloggen</a>
      <a href="register.html" class="btn btn-solid">Registreren</a>`;
  }
}

function requireLogin(redirectTo) {
  const user = getCurrentUser();
  if (!user) { window.location.href = redirectTo || 'login.html'; return false; }
  return true;
}

function showToast(msg) {
  let t = document.getElementById('ghq-toast');
  if (!t) { t = document.createElement('div'); t.id = 'ghq-toast'; t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3500);
}

window.addEventListener('DOMContentLoaded', () => {
  initFirebase();
  initEmailJS();
  updateNav();
});
