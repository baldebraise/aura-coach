import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  Auth
} from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

export interface StoredFirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

const CONFIG_STORAGE_KEY = 'aura_firebase_config';

export const DEFAULT_FIREBASE_CONFIG: StoredFirebaseConfig = {
  projectId: "aura-coach-18853",
  appId: "1:273202185240:web:8be6c8e341f4343ba6ef6d",
  storageBucket: "aura-coach-18853.firebasestorage.app",
  apiKey: "AIzaSyDpipGtQkMTnsvYkS0bVnauVtXpfmlUwHY",
  authDomain: "aura-coach-18853.firebaseapp.com",
  messagingSenderId: "273202185240",
};

export function getStoredFirebaseConfig(): StoredFirebaseConfig {
  try {
    const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.apiKey && parsed.authDomain && parsed.projectId) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return DEFAULT_FIREBASE_CONFIG;
}

export function saveStoredFirebaseConfig(config: StoredFirebaseConfig) {
  localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
}

let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let firestoreInstance: Firestore | null = null;

export function initializeFirebaseApp(): { app: FirebaseApp | null; auth: Auth | null; firestore: Firestore | null } {
  const config = getStoredFirebaseConfig();
  if (!config || !config.apiKey || !config.authDomain || !config.projectId) {
    return { app: null, auth: null, firestore: null };
  }

  try {
    if (!getApps().length) {
      appInstance = initializeApp(config);
    } else {
      appInstance = getApp();
    }
    authInstance = getAuth(appInstance);
    firestoreInstance = getFirestore(appInstance);
    return { app: appInstance, auth: authInstance, firestore: firestoreInstance };
  } catch (error: any) {
    console.error('Erreur initialisation Firebase:', error);
    return { app: null, auth: null, firestore: null };
  }
}

export async function checkRedirectResult(): Promise<FirebaseUser | null> {
  const { auth } = initializeFirebaseApp();
  if (!auth) return null;
  try {
    const result = await getRedirectResult(auth);
    return result ? result.user : null;
  } catch (err: any) {
    console.error('Erreur getRedirectResult:', err);
    throw err;
  }
}

export async function loginWithGoogle(): Promise<FirebaseUser> {
  const { auth } = initializeFirebaseApp();
  if (!auth) {
    throw new Error(
      "CONFIGURATION_MANQUANTE : Aucun projet Firebase n'est encore configuré. Renseignez votre configuration Firebase (apiKey, authDomain, projectId) pour activer la connexion Google officielle."
    );
  }

  const provider = new GoogleAuthProvider();
  provider.addScope('profile');
  provider.addScope('email');
  provider.setCustomParameters({ prompt: 'select_account' });

  // Detect mobile or standalone PWA environment
  const isMobileOrStandalone = 
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true;

  try {
    if (isMobileOrStandalone) {
      // Use redirect directly on mobile / PWA to guarantee 100% reliability
      await signInWithRedirect(auth, provider);
      return new Promise<FirebaseUser>(() => {});
    } else {
      const result = await signInWithPopup(auth, provider);
      return result.user;
    }
  } catch (err: any) {
    const errorCode = err.code || 'UNKNOWN_ERROR';
    let userFriendlyMessage = err.message || 'Échec de la connexion Google';

    // If popup blocked on desktop, fallback to redirect
    if (errorCode === 'auth/popup-blocked' || errorCode === 'auth/cancelled-popup-request') {
      try {
        await signInWithRedirect(auth, provider);
        return new Promise<FirebaseUser>(() => {});
      } catch (redirectErr: any) {
        throw redirectErr;
      }
    }

    if (errorCode === 'auth/popup-closed-by-user') {
      userFriendlyMessage = "La fenêtre de connexion Google a été fermée avant la fin de l'authentification.";
    } else if (errorCode === 'auth/unauthorized-domain') {
      userFriendlyMessage = `Le domaine actuel (${window.location.hostname}) n'est pas autorisé dans votre console Firebase (Authentication > Settings > Authorized Domains). Ajoutez "${window.location.hostname}" dans votre console Firebase.`;
    } else if (errorCode === 'auth/operation-not-allowed' || errorCode === 'auth/configuration-not-found') {
      userFriendlyMessage = "Le fournisseur Google Auth n'est pas encore activé dans votre console Firebase (Authentication > Sign-in method > Google > Activer).";
    } else if (errorCode === 'auth/network-request-failed') {
      userFriendlyMessage = "Erreur réseau : impossible de joindre les serveurs Google. Vérifiez votre connexion internet.";
    }

    const enhancedError = new Error(userFriendlyMessage);
    (enhancedError as any).code = errorCode;
    throw enhancedError;
  }
}

export async function logoutUser(): Promise<void> {
  const { auth } = initializeFirebaseApp();
  if (auth) {
    await signOut(auth);
  }
}

export function subscribeToAuthChanges(callback: (user: FirebaseUser | null) => void) {
  const { auth } = initializeFirebaseApp();
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}
