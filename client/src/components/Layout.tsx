import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { logout } from "../store/authSlice";
import { useAppDispatch, useAppSelector } from "../store";

function Layout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppSelector((state) => state.auth.user);
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile menu after moving to another page
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  async function handleLogout() {
    await dispatch(logout());
    navigate("/login");
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "rounded-full bg-blush-100 px-3 py-1 font-medium text-blush-600"
      : "rounded-full px-3 py-1 text-slate-500 hover:bg-powder-50 hover:text-powder-600";

  const links = (
    <>
      <NavLink to="/" end className={linkClass}>
        Dashboard
      </NavLink>
      <NavLink to="/orders" className={linkClass}>
        {user?.role === "owner" ? "Orders" : "My Orders"}
      </NavLink>
      {user?.role === "owner" && (
        <>
          <NavLink to="/customers" className={linkClass}>
            Customers
          </NavLink>
          <NavLink to="/staff" className={linkClass}>
            Staff
          </NavLink>
        </>
      )}
    </>
  );

  const account = (
    <>
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
    </>
  );

  return (
    <div className="min-h-screen">
      <header className="no-print border-b border-blush-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-6">
            <span className="text-xl font-bold text-blush-500">TailorTrack</span>
            <nav className="hidden gap-2 text-sm md:flex">{links}</nav>
          </div>

          <div className="hidden items-center gap-3 text-sm md:flex">{account}</div>

          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-label="Toggle menu"
            className="rounded-xl border border-blush-200 px-3 py-1.5 text-sm text-blush-600 md:hidden"
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-blush-100 px-4 py-3 md:hidden">
            <nav className="flex flex-col gap-1 text-sm">{links}</nav>
            <div className="mt-3 flex items-center justify-between gap-3 border-t border-blush-50 pt-3 text-sm">
              {account}
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
