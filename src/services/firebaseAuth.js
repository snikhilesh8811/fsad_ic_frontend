import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

const PROFILE_COLLECTION = "userProfiles";

const firebaseConfig = () => ({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
});

export function isFirebaseConfigured() {
  const c = firebaseConfig();
  return Boolean(c.apiKey && c.authDomain && c.projectId);
}

function getApp() {
  if (!isFirebaseConfigured()) return null;
  const cfg = firebaseConfig();
  if (!getApps().length) {
    return initializeApp(cfg);
  }
  return getApps()[0];
}

export function getFirebaseAuthAndDb() {
  const app = getApp();
  if (!app) return null;
  return { auth: getAuth(app), db: getFirestore(app) };
}

function toAppUser(uid, data, emailFallback) {
  const role = (data.role || "CITIZEN").toString().toUpperCase();
  const approvalStatus = (data.approvalStatus || "APPROVED").toString().toUpperCase();
  return {
    id: uid,
    name: data.name || "",
    email: (data.email || emailFallback || "").trim(),
    role,
    approvalStatus,
  };
}

export async function buildSessionFromFirebaseUser(firebaseUser) {
  const el = getFirebaseAuthAndDb();
  if (!el) throw new Error("Firebase is not configured");
  const { db } = el;
  const token = await firebaseUser.getIdToken();
  const ref = doc(db, PROFILE_COLLECTION, firebaseUser.uid);
  const snap = await getDoc(ref);

  let data;
  if (!snap.exists()) {
    data = {
      name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
      email: firebaseUser.email || "",
      role: "CITIZEN",
      approvalStatus: "APPROVED",
      createdAt: new Date().toISOString(),
    };
    await setDoc(ref, data);
  } else {
    data = snap.data();
  }

  return {
    token,
    user: toAppUser(firebaseUser.uid, data, firebaseUser.email),
  };
}

export async function signInWithGooglePopup() {
  const el = getFirebaseAuthAndDb();
  if (!el) throw new Error("Firebase is not configured");
  const { auth } = el;
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const result = await signInWithPopup(auth, provider);
  return buildSessionFromFirebaseUser(result.user);
}

export async function signUpWithEmailFirebase(payload) {
  const el = getFirebaseAuthAndDb();
  if (!el) throw new Error("Firebase is not configured");
  const { auth, db } = el;

  const email = payload.email.trim();
  const password = payload.password;
  const name = payload.name.trim();
  const role = (payload.role || "CITIZEN").toString().toUpperCase();
  const approvalStatus = role === "CITIZEN" ? "APPROVED" : "PENDING";

  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (name) {
    await updateProfile(cred.user, { displayName: name });
  }

  const ref = doc(db, PROFILE_COLLECTION, cred.user.uid);
  const profile = {
    name: name || cred.user.displayName || email.split("@")[0],
    email,
    role,
    approvalStatus,
    createdAt: new Date().toISOString(),
  };
  await setDoc(ref, profile);
  // Match email/password signup UX: user completes sign-in on the sign-in page.
  await signOut(auth);

  return {
    message: "Signup successful",
    user: toAppUser(cred.user.uid, profile, email),
  };
}

export async function signInWithEmailFirebase(payload) {
  const el = getFirebaseAuthAndDb();
  if (!el) throw new Error("Firebase is not configured");
  const { auth, db } = el;

  const email = payload.email.trim();
  const password = payload.password;
  const cred = await signInWithEmailAndPassword(auth, email, password);

  const ref = doc(db, PROFILE_COLLECTION, cred.user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const profile = {
      name: cred.user.displayName || email.split("@")[0],
      email,
      role: "CITIZEN",
      approvalStatus: "APPROVED",
      createdAt: new Date().toISOString(),
    };
    await setDoc(ref, profile);
  }

  return buildSessionFromFirebaseUser(cred.user);
}

export async function firebaseSignOut() {
  const el = getFirebaseAuthAndDb();
  if (!el) return;
  await signOut(el.auth);
}

export async function getPendingApprovalsFirebase() {
  const el = getFirebaseAuthAndDb();
  if (!el) throw new Error("Firebase is not configured");
  const { db } = el;
  const q = query(collection(db, PROFILE_COLLECTION), where("approvalStatus", "==", "PENDING"));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => toAppUser(d.id, d.data(), d.data().email))
    .filter((u) => u.role !== "ADMIN");
}

export async function updateApprovalStatusFirebase(userId, status) {
  const el = getFirebaseAuthAndDb();
  if (!el) throw new Error("Firebase is not configured");
  const { db } = el;
  const ref = doc(db, PROFILE_COLLECTION, userId);
  await updateDoc(ref, { approvalStatus: status.toUpperCase() });
  const snap = await getDoc(ref);
  return toAppUser(userId, snap.data(), snap.data()?.email);
}

function mapFirebaseAuthError(err) {
  const code = err?.code || "";
  const map = {
    "auth/email-already-in-use": "Email already exists",
    "auth/invalid-email": "Invalid email address",
    "auth/weak-password": "Password is too weak",
    "auth/user-not-found": "Invalid email or password",
    "auth/wrong-password": "Invalid email or password",
    "auth/invalid-credential": "Invalid email or password",
    "auth/popup-closed-by-user": "Sign-in popup was closed",
    "auth/cancelled-popup-request": "Sign-in was cancelled",
  };
  return new Error(map[code] || err?.message || "Authentication failed");
}

export function wrapFirebaseError(err) {
  return mapFirebaseAuthError(err);
}
