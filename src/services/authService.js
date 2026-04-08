import {
  isFirebaseConfigured,
  signUpWithEmailFirebase,
  signInWithEmailFirebase,
  getPendingApprovalsFirebase,
  updateApprovalStatusFirebase,
  firebaseSignOut,
  wrapFirebaseError,
} from "./firebaseAuth";

// TEMP: switch frontend to local/mock auth so you can test UI without backend.
// To re-enable backend later, set: VITE_USE_BACKEND_AUTH=true
const USE_BACKEND_AUTH = import.meta.env.VITE_USE_BACKEND_AUTH === "true";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const MOCK_USERS_KEY = "mock_users";
const MOCK_SESSION_KEY = "auth_session";

const readMockUsers = () => {
  const raw = localStorage.getItem(MOCK_USERS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeMockUsers = (users) => {
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
};

const randomId = () => {
  return `u_${Date.now()}_${Math.random().toString(16).slice(2)}`;
};

const buildHeaders = (token) => {
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

const handleResponse = async (response) => {
  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      (typeof payload === "object" && (payload.message || payload.error)) ||
      (typeof payload === "string" && payload) ||
      "Request failed";
    throw new Error(message);
  }

  return payload;
};

const normalizeUser = (rawUser = {}) => {
  const role = (rawUser.role || rawUser.userRole || "CITIZEN").toString().toUpperCase();
  const approvalStatus = (
    rawUser.approvalStatus ||
    rawUser.status ||
    (rawUser.approved === true ? "APPROVED" : "PENDING")
  )
    .toString()
    .toUpperCase();

  return {
    id: rawUser.id || rawUser.userId || rawUser._id || rawUser.email,
    name: rawUser.name || rawUser.fullName || "",
    email: rawUser.email || "",
    role,
    approvalStatus,
    profilePicture: rawUser.profilePicture || rawUser.picture || null,
  };
};

export const decodeJwtPayload = (jwt) => {
  try {
    const part = jwt.split(".")[1];
    if (!part) {
      throw new Error("Invalid token");
    }
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    throw new Error("Could not read Google profile");
  }
};

/**
 * Sign in or register via Google ID token (JWT). Mock mode stores users locally.
 * With VITE_USE_BACKEND_AUTH=true, expects POST /api/auth/google { credential }.
 */
export const signInWithGoogleCredential = async (credential) => {
  if (!credential) {
    throw new Error("Missing Google credential");
  }

  if (isFirebaseConfigured()) {
    throw new Error("Use Firebase Google sign-in from the app button");
  }

  if (!USE_BACKEND_AUTH) {
    const payload = decodeJwtPayload(credential);
    const email = (payload.email || "").trim();
    if (!email) {
      throw new Error("Google did not return an email");
    }

    const users = readMockUsers();
    let user = users.find((u) => (u.email || "").toLowerCase() === email.toLowerCase());
    if (!user) {
      throw new Error("Account not found. Please sign up.");
    }

    if (payload.picture && !user.picture && !user.profilePicture) {
      user.picture = payload.picture;
      writeMockUsers(users);
    }

    const token = `mock_${randomId()}`;
    return { token, user: normalizeUser(user) };
  }

  const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify({ credential }),
  });

  const data = await handleResponse(response);
  const token = data.token || data.jwt || data.accessToken || "";

  return {
    token,
    user: normalizeUser(data.user || data),
  };
};

export const signUpWithGoogleCredential = async (credential, role = "CITIZEN") => {
  if (!credential) {
    throw new Error("Missing Google credential");
  }

  if (isFirebaseConfigured()) {
    throw new Error("Use Firebase Google sign-in from the app button");
  }

  if (!USE_BACKEND_AUTH) {
    const payload = decodeJwtPayload(credential);
    const email = (payload.email || "").trim();
    if (!email) {
      throw new Error("Google did not return an email");
    }
    const name =
      payload.name ||
      [payload.given_name, payload.family_name].filter(Boolean).join(" ") ||
      email.split("@")[0];

    const users = readMockUsers();
    const exists = users.some((u) => (u.email || "").toLowerCase() === email.toLowerCase());
    if (exists) {
      throw new Error("Account already exists. Please sign in.");
    }

    const approvalStatus = role === "CITIZEN" ? "APPROVED" : "PENDING";

    const newUser = {
      id: randomId(),
      name,
      email,
      password: "__oauth_google__",
      role: role.toUpperCase(),
      approvalStatus,
      oauthProvider: "google",
      picture: payload.picture || null,
    };
    writeMockUsers([...users, newUser]);

    const token = `mock_${randomId()}`;
    return { token, user: normalizeUser(newUser) };
  }

  // If using backend, pass role along
  const response = await fetch(`${API_BASE_URL}/api/auth/google-signup`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify({ credential, role: role.toUpperCase() }),
  });

  const data = await handleResponse(response);
  const token = data.token || data.jwt || data.accessToken || "";

  return {
    token,
    user: normalizeUser(data.user || data),
  };
};

export const signup = async (payload) => {
  if (isFirebaseConfigured()) {
    try {
      return await signUpWithEmailFirebase(payload);
    } catch (err) {
      throw wrapFirebaseError(err);
    }
  }

  if (!USE_BACKEND_AUTH) {
    const users = readMockUsers();
    const exists = users.some((u) => (u.email || "").toLowerCase() === payload.email.toLowerCase());
    if (exists) {
      throw new Error("Email already exists");
    }

    const role = (payload.role || "CITIZEN").toString().toUpperCase();
    const approvalStatus = role === "CITIZEN" ? "APPROVED" : "PENDING";

    const newUser = {
      id: randomId(),
      name: payload.name || "",
      email: payload.email,
      // NOTE: plaintext password stored only for local testing.
      password: payload.password || "",
      role,
      approvalStatus,
    };

    writeMockUsers([...users, newUser]);

    return {
      message: "Signup successful (mock)",
      user: normalizeUser(newUser),
    };
  }

  const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await handleResponse(response);
  return {
    message: data.message || "Signup successful",
    user: normalizeUser(data.user || payload),
  };
};

export const signin = async (payload) => {
  if (isFirebaseConfigured()) {
    try {
      return await signInWithEmailFirebase(payload);
    } catch (err) {
      throw wrapFirebaseError(err);
    }
  }

  if (!USE_BACKEND_AUTH) {
    const users = readMockUsers();
    const user = users.find(
      (u) => (u.email || "").toLowerCase() === payload.email.toLowerCase() && (u.password || "") === payload.password
    );

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const token = `mock_${randomId()}`;
    const normalized = normalizeUser(user);
    return { token, user: normalized };
  }

  const response = await fetch(`${API_BASE_URL}/api/auth/signin`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await handleResponse(response);
  const token = data.token || data.jwt || data.accessToken || "";

  return {
    token,
    user: normalizeUser(data.user || data),
  };
};

export const getPendingApprovals = async (token) => {
  if (isFirebaseConfigured()) {
    try {
      return await getPendingApprovalsFirebase();
    } catch (err) {
      throw wrapFirebaseError(err);
    }
  }

  if (!USE_BACKEND_AUTH) {
    const users = readMockUsers();
    return users
      .filter((u) => u.approvalStatus === "PENDING" && u.role !== "ADMIN")
      .map(normalizeUser);
  }

  const response = await fetch(`${API_BASE_URL}/api/admin/pending-approvals`, {
    method: "GET",
    headers: buildHeaders(token),
  });

  const data = await handleResponse(response);
  const list = Array.isArray(data) ? data : data.users || data.pendingUsers || [];
  return list.map(normalizeUser);
};

export const updateApprovalStatus = async (userId, status, token) => {
  if (isFirebaseConfigured()) {
    try {
      return await updateApprovalStatusFirebase(userId, status);
    } catch (err) {
      throw wrapFirebaseError(err);
    }
  }

  if (!USE_BACKEND_AUTH) {
    const users = readMockUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) {
      throw new Error("User not found");
    }

    const next = { ...users[idx], approvalStatus: status.toUpperCase() };
    users[idx] = next;
    writeMockUsers(users);
    return normalizeUser(next);
  }

  const response = await fetch(`${API_BASE_URL}/api/admin/approvals/${userId}`, {
    method: "PATCH",
    headers: buildHeaders(token),
    body: JSON.stringify({ status }),
  });

  const data = await handleResponse(response);
  return normalizeUser(data.user || data);
};

export const logout = async () => {
  if (isFirebaseConfigured()) {
    try {
      await firebaseSignOut();
    } catch (err) {
      console.error(err);
    }
  }
  authStorage.clearSession();
};

export const authStorage = {
  setSession(session) {
    localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(session));
    try {
      window.dispatchEvent(new Event("auth_session_updated"));
    } catch {
      // no-op (SSR/older browsers)
    }
  },
  getSession() {
    const raw = localStorage.getItem(MOCK_SESSION_KEY);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
  updateUser(user) {
    const session = this.getSession();
    if (session) {
      session.user = { ...session.user, ...user };
      this.setSession(session);
    }
  },
  clearSession() {
    localStorage.removeItem(MOCK_SESSION_KEY);
    try {
      window.dispatchEvent(new Event("auth_session_cleared"));
    } catch {
      // no-op
    }
  },
};
