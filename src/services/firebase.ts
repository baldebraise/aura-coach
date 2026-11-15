import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
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

export function getStoredFirebaseConfig(): StoredFirebaseConfig | null {
  try {
    const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
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

  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (err: any) {
    const errorCode = err.code || 'UNKNOWN_ERROR';
    let userFriendlyMessage = err.message || 'Échec de la connexion Google';

    if (errorCode === 'auth/popup-blocked') {
      userFriendlyMessage = "Le navigateur de votre téléphone a bloqué la fenêtre popup Google. Veuillez autoriser les fenêtres popups dans les paramètres de votre navigateur.";
    } else if (errorCode === 'auth/popup-closed-by-user') {
      userFriendlyMessage = "La fenêtre de connexion Google a été fermée avant la fin de l'authentification.";
    } else if (errorCode === 'auth/unauthorized-domain') {
      userFriendlyMessage = `Le domaine actuel (${window.location.hostname}) n'est pas autorisé dans votre console Firebase (Authentication > Settings > Authorized Domains). Ajoutez "${window.location.hostname}" dans votre console Firebase.`;
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
