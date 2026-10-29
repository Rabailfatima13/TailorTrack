import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api, { getErrorMessage } from "../api/axios";
import type { User } from "../types";

interface AuthState {
  user: User | null;
  checked: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  checked: false,
  loading: false,
  error: null,
};

export const fetchMe = createAsyncThunk("auth/me", async () => {
  const res = await api.get("/auth/me");
  return res.data.user as User;
});

export const login = createAsyncThunk(
  "auth/login",
  async (data: { username: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/login", data);
      return res.data.user as User;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const logout = createAsyncThunk("auth/logout", async () => {
  await api.post("/auth/logout");
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload;
        state.checked = true;
      })
      .addCase(fetchMe.rejected, (state) => {
        state.user = null;
        state.checked = true;
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
      });
  },
});

export default authSlice.reducer;
