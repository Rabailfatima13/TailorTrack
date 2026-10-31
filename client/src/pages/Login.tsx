import { useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { login } from "../store/authSlice";
import { useAppDispatch, useAppSelector } from "../store";

function Login() {
  const dispatch = useAppDispatch();
  const { user, loading, error } = useAppSelector((state) => state.auth);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");

  if (user) return <Navigate to="/" replace />;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password) {
      setFormError("Please enter your username and password");
      return;
    }
    setFormError("");
    dispatch(login({ username, password }));
  }

  const message = formError || error;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-lg bg-white p-6 shadow">
        <h1 className="mb-1 text-center text-2xl font-bold text-indigo-700">TailorTrack</h1>
        <p className="mb-6 text-center text-sm text-gray-500">Sign in to your shop account</p>

        {message && <p className="mb-4 rounded bg-red-50 p-2 text-sm text-red-600">{message}</p>}

        <label className="mb-1 block text-sm font-medium">Username</label>
        <input
          className="input mb-4"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoFocus
        />

        <label className="mb-1 block text-sm font-medium">Password</label>
        <div className="relative mb-6">
          <input
            type={showPassword ? "text" : "password"}
            className="input pr-16"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-indigo-600"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <button type="submit" className="btn w-full" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}

export default Login;
