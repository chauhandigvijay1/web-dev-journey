import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  type StoredUser,
  readStoredAuth,
  writeStoredAuth,
  clearStoredAuth,
} from "@/lib/authStorage";

type AuthState = {
  user: StoredUser | null;
  token: string | null;
  isAuthenticated: boolean;
  hydrated: boolean;
};

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  hydrated: false,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    hydrate(state, action: PayloadAction<{ user: StoredUser | null; token: string | null }>) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = Boolean(action.payload.token && action.payload.user);
      state.hydrated = true;
    },
    login(state, action: PayloadAction<{ user: StoredUser; token: string }>) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
    setUser(state, action: PayloadAction<StoredUser>) {
      state.user = action.payload;
    },
  },
});

export const { hydrate, login, logout, setUser } = authSlice.actions;
export default authSlice.reducer;

export function hydrateFromStorage() {
  const { token, user } = readStoredAuth();
  return hydrate({ token, user });
}

export function loginWithStorage(payload: { user: StoredUser; token: string }) {
  writeStoredAuth(payload.token, payload.user);
  return login(payload);
}

export function logoutAndClear() {
  clearStoredAuth();
  return logout();
}

export function setUserWithStorage(user: StoredUser, token: string | null) {
  if (token) {
    writeStoredAuth(token, user);
  }
  return setUser(user);
}
