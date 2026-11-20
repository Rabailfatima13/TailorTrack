import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";
import StatusBadge from "../components/StatusBadge";
import { measurementFields } from "../measurements";
import type { Customer, Order } from "../types";

function CustomerDetails() {
  const { id } = useParams();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/customers/${id}`)
      .then((res) => {
        setCustomer(res.data.customer);
        setOrders(res.data.orders);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-slate-500">Loading...</p>;

  if (!customer) {
    return (
      <div>
        <p className="mb-4 rounded-xl bg-red-50 p-3 text-red-500">{error || "Customer not found"}</p>
        <Link to="/customers" className="text-powder-600 hover:underline">
          Back to customers
        </Link>
      </div>
    );
  }

  const filledSizes = measurementFields.filter((f) => customer.measurements?.[f.key] !== undefined);
  const totalSpent = orders.reduce((sum, o) => sum + o.price, 0);
  const totalDue = orders.reduce((sum, o) => sum + o.balance, 0);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">
            {customer.name}
            {customer.archived && (
              <span className="ml-3 rounded-full bg-slate-100 px-2.5 py-1 align-middle text-xs text-slate-500">
                Archived
              </span>
            )}
          </h1>
          <p className="text-sm text-slate-500">
            {customer.phone}
            {customer.address && ` · ${customer.address}`}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {!customer.archived && (
            <Link to={`/orders/new?customer=${customer._id}`} className="btn">
              + New order
            </Link>
          )}
          <Link to="/customers" className="text-sm text-powder-600 hover:underline">
            Back to customers
          </Link>
        </div>
      </div>

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-powder-100 p-5 text-powder-600 shadow-sm">
          <p className="text-sm opacity-80">Total orders</p>
          <p className="mt-1 text-3xl font-bold">{orders.length}</p>
        </div>
        <div className="rounded-2xl bg-blush-100 p-5 text-blush-600 shadow-sm">
          <p className="text-sm opacity-80">Total order value</p>
          <p className="mt-1 text-3xl font-bold">Rs {totalSpent}</p>
        </div>
        <div className="rounded-2xl bg-red-50 p-5 text-red-500 shadow-sm">
          <p className="text-sm opacity-80">Balance due</p>
          <p className="mt-1 text-3xl font-bold">Rs {totalDue}</p>
        </div>
      </div>

      <div className="card mb-5 p-5">
        <h2 className="mb-3 font-semibold text-powder-600">Saved measurements (inches)</h2>
        {filledSizes.length === 0 ? (
          <p className="text-sm text-slate-500">No measurements saved yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {filledSizes.map((field) => (
              <div key={field.key} className="rounded-xl bg-powder-50 p-3">
                <p className="text-xs text-slate-500">{field.label}</p>
                <p className="font-semibold">{customer.measurements[field.key]}</p>
              </div>
            ))}
          </div>
        )}
        {customer.measurements?.notes && (
          <p className="mt-3 text-sm text-slate-500">Notes: {customer.measurements.notes}</p>
        )}
      </div>

      <h2 className="mb-3 text-lg font-semibold">Order history</h2>
      {orders.length === 0 ? (
        <p className="card p-4 text-slate-500">This customer has no orders yet.</p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-powder-50 text-slate-500">
              <tr>
                <th className="px-4 py-2">Garment</th>
                <th className="px-4 py-2">Staff</th>
                <th className="px-4 py-2">Ordered on</th>
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
                    <Link to={`/orders/${order._id}`} className="text-powder-600 hover:underline">
                      {order.garmentType}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{order.assignedTo.name}</td>
                  <td className="px-4 py-3">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className={`px-4 py-3 ${order.isOverdue ? "font-medium text-red-500" : ""}`}>
                    {new Date(order.dueDate).toLocaleDateString()}
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

export default CustomerDetails;
