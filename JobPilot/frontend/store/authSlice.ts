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
    hydrate(state) {
      const { token, user } = readStoredAuth();
      state.token = token;
      state.user = user;
      state.isAuthenticated = Boolean(token && user);
      state.hydrated = true;
    },
    login(state, action: PayloadAction<{ user: StoredUser; token: string }>) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      writeStoredAuth(action.payload.token, action.payload.user);
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      clearStoredAuth();
    },
    setUser(state, action: PayloadAction<StoredUser>) {
      state.user = action.payload;
      if (state.token) {
        writeStoredAuth(state.token, action.payload);
      }
    },
  },
});

export const { hydrate, login, logout, setUser } = authSlice.actions;
export default authSlice.reducer;
