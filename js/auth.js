// ============================================================
// GUARDIANHQ — AUTH.JS
// Firebase Authentication + Firestore + EmailJS
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyBfda3IcQk-bbYHOqKhU4r8wMtOCPjTztc",
  authDomain: "guardianhq-db216.firebaseapp.com",
  projectId: "guardianhq-db216",
  storageBucket: "guardianhq-db216.firebasestorage.app",
  messagingSenderId: "370272351292",
  appId: "1:370272351292:web:4496bd3fbad791e0fa7f39"
};

const EMAILJS_SERVICE_ID          = "service_usefhy9";
const EMAILJS_TEMPLATE_ID         = "template_kq2yx3d";   // Registratie-email
const EMAILJS_CONTACT_TEMPLATE_ID = "template_0ncr5h7";   // Contact-formulier (guardianhq_contact)
const EMAILJS_PUBLIC_KEY          = "Kzu6sQd_AB5cDC0nU";
const ADMIN_EMAIL                 = "info.guardianhq@gmail.com";

let auth = null;
let db   = null;
let firebaseReady = false;

function initFirebase() {
  try {
    if (typeof firebase !== 'undefined') {
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      auth = firebase.auth();
      db   = firebase.firestore();
      firebaseReady = true;
      console.log("Firebase + Firestore klaar");
    }
  } catch(e) {
    console.warn("Firebase fout:", e);
  }
}

function initEmailJS() {
  try {
    if (typeof emailjs !== 'undefined') {
      emailjs.init(EMAILJS_PUBLIC_KEY);
    }
  } catch(e) {}
}

async function registerUser(username, email, password) {

  if (!firebaseReady) {
    throw new Error("Verbinding met de server mislukt. Controleer je internetverbinding en probeer het opnieuw.");
  }

  // Check gebruikersnaam in Firestore
  const doc = await db.collection('usernames').doc(username.toLowerCase()).get();
  if (doc.exists) {
    throw new Error("Deze gebruikersnaam is al in gebruik. Kies een andere naam.");
  }

  // Firebase account aanmaken
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

  // Gebruikersnaam opslaan in Firestore
  await db.collection('usernames').doc(username.toLowerCase()).set({
    username:  username,
    email:     email,
    uid:       cred.user.uid,
    createdAt: new Date().toISOString()
  });

  localStorage.setItem('ghq_current_user', JSON.stringify({ username, email }));
  await sendRegistrationEmail(username, email);
  return { username, email };
}

async function loginUser(email, password) {
  if (!firebaseReady) {
    throw new Error("Verbinding met de server mislukt. Controleer je internetverbinding en probeer het opnieuw.");
  }

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

async function sendRegistrationEmail(username, email) {
  try {
    if (typeof emailjs === 'undefined') return;
    const siteUrl = "https://genuine-semolina-78d633.netlify.app";
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      to_email: email, to_name: username, from_name: "GuardianHQ",
      reply_to: ADMIN_EMAIL, subject: "Welkom bij GuardianHQ!",
      gebruikersnaam: username, emailadres: email, site_url: siteUrl,
    });
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      to_email: ADMIN_EMAIL, to_name: "Admin", from_name: "GuardianHQ Systeem",
      reply_to: email, subject: "Nieuwe registratie: " + username,
      gebruikersnaam: username, emailadres: email, site_url: siteUrl,
    });
  } catch(e) {
    console.warn("E-mail fout:", e);
  }
}

// ── Contact formulier ─────────────────────────────────────────
// Variabelen die matchen met emailtemplate_contact.html:
//   {{from_name}}  — naam van de afzender
//   {{reply_to}}   — e-mailadres van de afzender
//   {{subject}}    — onderwerp
//   {{message}}    — berichttekst
async function sendContactEmail({ from_name, reply_to, subject, message }) {
  if (typeof emailjs === 'undefined') throw new Error("EmailJS niet geladen.");
  await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_CONTACT_TEMPLATE_ID, {
    from_name,
    reply_to,
    subject,
    message,
    to_email:  ADMIN_EMAIL,
    site_name: "GuardianHQ",
  });
}

function logoutUser() {
  localStorage.removeItem('ghq_current_user');
  if (firebaseReady && auth) auth.signOut().catch(() => {});
  window.location.href = 'index.html';
}

function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem('ghq_current_user')); }
  catch { return null; }
}

function getNavAvatarHtml(user) {
  const type  = localStorage.getItem('ghq_avatar_type') || 'icon';
  const photo = localStorage.getItem('ghq_avatar_photo');
  const emoji = localStorage.getItem('ghq_avatar') || '';
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
  const navSpacer = document.getElementById('navSpacer');
  if (!navAuth) return;

  // Destiny 2 en Profiel alleen zichtbaar als ingelogd
  const navLinks = document.querySelectorAll('.nav-center a');
  navLinks.forEach(link => {
    const href = link.getAttribute('href') || '';
    const isProtected = href.includes('destiny.html') || href.includes('profile.html');
    if (isProtected) {
      link.style.display = user ? '' : 'none';
    }
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
