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
    isActive
      ? "rounded-full bg-blush-100 px-3 py-1 font-medium text-blush-600"
      : "rounded-full px-3 py-1 text-slate-500 hover:bg-powder-50 hover:text-powder-600";

  return (
    <div className="min-h-screen">
      <header className="no-print border-b border-blush-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-6">
            <span className="text-xl font-bold text-blush-500">TailorTrack</span>
            <nav className="flex gap-2 text-sm">
              <NavLink to="/" end className={linkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/orders" className={linkClass}>
                {user?.role === "owner" ? "Orders" : "My Orders"}
              </NavLink>
              {user?.role === "owner" && (
                <NavLink to="/customers" className={linkClass}>
                  Customers
                </NavLink>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <span>
              {user?.name}{" "}
              <span className="rounded-full bg-powder-100 px-2 py-0.5 text-xs capitalize text-powder-600">
                {user?.role}
              </span>
            </span>
            <button
              onClick={handleLogout}
              className="rounded-full border border-blush-200 px-3 py-1 text-blush-600 hover:bg-blush-50"
            >
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
