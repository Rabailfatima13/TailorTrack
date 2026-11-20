import { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";
import StatusBadge from "../components/StatusBadge";
import { useAppSelector } from "../store";
import type { Order, User } from "../types";

const statuses = ["Pending", "In progress", "Ready", "Delivered"];

function Orders() {
  const user = useAppSelector((state) => state.auth.user);
  const isOwner = user?.role === "owner";
  const location = useLocation();
  const [message] = useState(location.state?.message);

  // Filters live in the URL so they survive a refresh and can be linked to
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get("status") || "";
  const staff = searchParams.get("staff") || "";
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";
  const overdue = searchParams.get("overdue") === "true";
  const search = searchParams.get("search") || "";
  const [searchText, setSearchText] = useState(search);

  const [orders, setOrders] = useState<Order[]>([]);
  const [staffList, setStaffList] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (location.state) window.history.replaceState({}, "");
  }, []);

  useEffect(() => {
    if (isOwner) {
      api.get("/users/staff").then((res) => setStaffList(res.data));
    }
  }, [isOwner]);

  useEffect(() => {
    setLoading(true);
    setError("");
    api
      .get("/orders", { params: { status, staff, from, to, search, overdue: overdue || undefined } })
      .then((res) => setOrders(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [status, staff, from, to, search, overdue]);

  // Wait until the user stops typing before searching
  useEffect(() => {
    if (searchText.trim() === search) return;
    const timer = setTimeout(() => setFilter("search", searchText.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchText]);

  function setFilter(name: string, value: string) {
    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev);
        if (value) params.set(name, value);
        else params.delete(name);
        return params;
      },
      { replace: true }
    );
  }

  function clearFilters() {
    setSearchText("");
    setSearchParams({}, { replace: true });
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">{isOwner ? "Orders" : "My Orders"}</h1>
        {isOwner && (
          <Link to="/orders/new" className="btn">
            + New order
          </Link>
        )}
      </div>

      {message && <p className="mb-4 rounded-xl bg-green-50 p-2 text-sm text-green-600">{message}</p>}

      <div className="card mb-5 flex flex-wrap items-end gap-4 p-4">
        <div>
          <label className="mb-1 block text-xs text-slate-500">Customer</label>
          <input
            className="input"
            placeholder="Name or phone"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-slate-500">Status</label>
          <select className="input" value={status} onChange={(e) => setFilter("status", e.target.value)} disabled={overdue}>
            <option value="">All</option>
            <option value="active">Active (not delivered)</option>
            {statuses.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>

        {isOwner && (
          <div>
            <label className="mb-1 block text-xs text-slate-500">Staff</label>
            <select className="input" value={staff} onChange={(e) => setFilter("staff", e.target.value)}>
              <option value="">All staff</option>
              {staffList.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="mb-1 block text-xs text-slate-500">Due from</label>
          <input type="date" className="input" value={from} onChange={(e) => setFilter("from", e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-500">Due to</label>
          <input type="date" className="input" value={to} onChange={(e) => setFilter("to", e.target.value)} />
        </div>

        <label className="flex items-center gap-2 pb-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={overdue}
            onChange={(e) => setFilter("overdue", e.target.checked ? "true" : "")}
            className="accent-blush-500"
          />
          Overdue only
        </label>

        <button onClick={clearFilters} className="pb-2 text-sm text-powder-600 hover:underline">
          Clear
        </button>
      </div>

      {error && <p className="mb-4 rounded-xl bg-red-50 p-2 text-sm text-red-500">{error}</p>}

      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : orders.length === 0 ? (
        <p className="card p-4 text-slate-500">No orders found.</p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-powder-50 text-slate-500">
              <tr>
                <th className="px-4 py-2">Customer</th>
                <th className="px-4 py-2">Garment</th>
                {isOwner && <th className="px-4 py-2">Staff</th>}
                <th className="px-4 py-2">Due date</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2 text-right">Price</th>
                <th className="px-4 py-2 text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="border-t border-blush-50 hover:bg-blush-50/50">
                  <td className="px-4 py-3">
                    <p className="font-medium">{order.customer.name}</p>
                    <p className="text-xs text-slate-400">{order.customer.phone}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Link to={`/orders/${order._id}`} className="text-powder-600 hover:underline">
                      {order.garmentType}
                    </Link>
                  </td>
                  {isOwner && <td className="px-4 py-3">{order.assignedTo.name}</td>}
                  <td className="px-4 py-3">
                    <span className={order.isOverdue ? "font-medium text-red-500" : ""}>
                      {new Date(order.dueDate).toLocaleDateString()}
                    </span>
                    {order.isOverdue && <p className="text-xs text-red-400">Overdue</p>}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-right">Rs {order.price}</td>
                  <td className="px-4 py-3 text-right">
                    {order.balance > 0 ? `Rs ${order.balance}` : <span className="text-green-600">Paid</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Orders;
