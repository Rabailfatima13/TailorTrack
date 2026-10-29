import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { logout } from "../store/authSlice";
import { useAppDispatch, useAppSelector } from "../store";

function Layout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);

  async function handleLogout() {
    await dispatch(logout());
    navigate("/login");
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? "font-semibold text-indigo-700" : "text-gray-600 hover:text-indigo-700";

  return (
    <div className="min-h-screen">
      <header className="no-print border-b bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-6">
            <span className="text-xl font-bold text-indigo-700">TailorTrack</span>
            <nav className="flex gap-4 text-sm">
              <NavLink to="/" end className={linkClass}>
                Dashboard
              </NavLink>
            </nav>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <span>
              {user?.name} <span className="text-gray-400">({user?.role})</span>
            </span>
            <button onClick={handleLogout} className="rounded border px-3 py-1 hover:bg-gray-100">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
