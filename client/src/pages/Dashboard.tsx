import { useEffect, useState } from "react";
import api, { getErrorMessage } from "../api/axios";
import { useAppSelector } from "../store";
import type { DashboardData } from "../types";

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-lg bg-white p-4 shadow">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

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
      <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
      <p className="mt-1 text-gray-500">
        {user?.role === "owner" ? "Here is an overview of your shop." : "Here are the orders assigned to you."}
      </p>

      {loading && <p className="mt-6 text-gray-500">Loading...</p>}
      {error && <p className="mt-6 rounded bg-red-50 p-3 text-red-600">{error}</p>}

      {data && (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <StatCard label="Active orders" value={data.activeOrders} color="text-indigo-700" />
            <StatCard label="Ready for pickup" value={data.readyOrders} color="text-green-600" />
            <StatCard label="Overdue" value={data.overdueOrders} color="text-red-600" />
          </div>

          <h2 className="mb-3 mt-8 text-lg font-semibold">Due in the next 7 days</h2>

          {data.upcoming.length === 0 ? (
            <p className="rounded bg-white p-4 text-gray-500 shadow">No deliveries due this week.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg bg-white shadow">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-100 text-gray-600">
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
                    <tr key={order._id} className="border-t">
                      <td className="px-4 py-2">{order.customer.name}</td>
                      <td className="px-4 py-2">{order.garmentType}</td>
                      <td className="px-4 py-2">{order.assignedTo.name}</td>
                      <td className="px-4 py-2">{new Date(order.dueDate).toLocaleDateString()}</td>
                      <td className="px-4 py-2">{order.status}</td>
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
