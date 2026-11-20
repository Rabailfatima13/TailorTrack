import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import api from "../api/axios";
import authReducer, { sessionExpired } from "./authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

// If the login cookie expires while the app is open, the API answers 401.
// Clear the user so ProtectedRoute sends them back to the login page.
api.interceptors.response.use(undefined, (err) => {
  const url = axios.isAxiosError(err) ? err.config?.url || "" : "";
  const isAuthCall = url.startsWith("/auth/");
  if (axios.isAxiosError(err) && err.response?.status === 401 && !isAuthCall && store.getState().auth.user) {
    store.dispatch(sessionExpired());
  }
  return Promise.reject(err);
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
