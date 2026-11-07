import { useEffect, useState } from "react";
import api, { getErrorMessage } from "../api/axios";
import { useAppSelector } from "../store";
import type { DashboardData } from "../types";

function StatCard({ label, value, style }: { label: string; value: number; style: string }) {
  return (
    <div className={`rounded-2xl p-5 shadow-sm ${style}`}>
      <p className="text-sm opacity-80">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
    </div>
  );
}

const statusStyle: Record<string, string> = {
  Pending: "bg-slate-100 text-slate-600",
  "In progress": "bg-powder-100 text-powder-600",
  Ready: "bg-blush-100 text-blush-600",
  Delivered: "bg-green-50 text-green-600",
};

function Dashboard() {
  const user = useAppSelector((state) => state.auth.user);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/dashboard")
      .then((res) => setData(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-700">Welcome, {user?.name}</h1>
      <p className="mt-1 text-slate-500">
        {user?.role === "owner" ? "Here is an overview of your shop." : "Here are the orders assigned to you."}
      </p>

      {loading && <p className="mt-6 text-slate-500">Loading...</p>}
      {error && <p className="mt-6 rounded-xl bg-red-50 p-3 text-red-500">{error}</p>}

      {data && (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <StatCard label="Active orders" value={data.activeOrders} style="bg-powder-100 text-powder-600" />
            <StatCard label="Ready for pickup" value={data.readyOrders} style="bg-blush-100 text-blush-600" />
            <StatCard label="Overdue" value={data.overdueOrders} style="bg-red-50 text-red-500" />
          </div>

          <h2 className="mb-3 mt-8 text-lg font-semibold text-slate-700">Due in the next 7 days</h2>

          {data.upcoming.length === 0 ? (
            <p className="card p-4 text-slate-500">No deliveries due this week.</p>
          ) : (
            <div className="card overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-powder-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-2">Customer</th>
                    <th className="px-4 py-2">Garment</th>
                    <th className="px-4 py-2">Staff</th>
                    <th className="px-4 py-2">Due date</th>
                    <th className="px-4 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.upcoming.map((order) => (
                    <tr key={order._id} className="border-t border-blush-50 hover:bg-blush-50/50">
                      <td className="px-4 py-3">{order.customer.name}</td>
                      <td className="px-4 py-3">{order.garmentType}</td>
                      <td className="px-4 py-3">{order.assignedTo.name}</td>
                      <td className="px-4 py-3">{new Date(order.dueDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs ${statusStyle[order.status]}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Dashboard;
