import { useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";
import StatusBadge from "../components/StatusBadge";
import { measurementFields } from "../measurements";
import { useAppSelector } from "../store";
import type { Order, OrderStatus } from "../types";

const nextStatus: Record<OrderStatus, OrderStatus[]> = {
  Pending: ["In progress"],
  "In progress": ["Pending", "Ready"],
  Ready: ["In progress", "Delivered"],
  Delivered: [],
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString();
}

function OrderDetails() {
  const { id } = useParams();
  const user = useAppSelector((state) => state.auth.user);
  const isOwner = user?.role === "owner";

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  async function loadOrder() {
    try {
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrder();
  }, [id]);

  async function changeStatus(status: OrderStatus) {
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      await api.patch(`/orders/${id}/status`, { status });
      setSuccess(`Status changed to ${status}`);
      await loadOrder();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function addPayment(e: FormEvent) {
    e.preventDefault();
    if (!order) return;

    const value = Number(amount);
    if (!value || value <= 0) {
      setError("Enter a payment amount greater than 0");
      return;
    }
    if (value > order.balance) {
      setError(`Payment cannot be more than the balance (Rs ${order.balance})`);
      return;
    }

    setBusy(true);
    setError("");
    setSuccess("");
    try {
      await api.post(`/orders/${id}/payments`, { amount: value, note });
      setAmount("");
      setNote("");
      setSuccess("Payment recorded");
      await loadOrder();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <p className="text-slate-500">Loading...</p>;

  if (!order) {
    return (
      <div>
        <p className="mb-4 rounded-xl bg-red-50 p-3 text-red-500">{error || "Order not found"}</p>
        <Link to="/orders" className="text-powder-600 hover:underline">
          Back to orders
        </Link>
      </div>
    );
  }

  const allowed = nextStatus[order.status].filter((s) => isOwner || s !== "Delivered");
  const filledSizes = measurementFields.filter((f) => order.measurements?.[f.key] !== undefined);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{order.garmentType}</h1>
          <p className="text-sm text-slate-500">Order placed on {formatDate(order.createdAt)}</p>
        </div>
        <Link to="/orders" className="no-print text-sm text-powder-600 hover:underline">
          Back to orders
        </Link>
      </div>

      {success && <p className="no-print mb-4 rounded-xl bg-green-50 p-2 text-sm text-green-600">{success}</p>}
      {error && <p className="no-print mb-4 rounded-xl bg-red-50 p-2 text-sm text-red-500">{error}</p>}

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <div className="card grid gap-4 p-5 sm:grid-cols-2">
            <div>
              <p className="text-xs text-slate-400">Customer</p>
              <p className="font-medium">{order.customer.name}</p>
              <p className="text-sm text-slate-500">{order.customer.phone}</p>
              {order.customer.address && <p className="text-sm text-slate-500">{order.customer.address}</p>}
            </div>
            <div>
              <p className="text-xs text-slate-400">Assigned to</p>
              <p className="font-medium">{order.assignedTo.name}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Due date</p>
              <p className={order.isOverdue ? "font-medium text-red-500" : "font-medium"}>
                {formatDate(order.dueDate)} {order.isOverdue && "(Overdue)"}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Status</p>
              <StatusBadge status={order.status} />
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs text-slate-400">Instructions</p>
              <p>{order.instructions || "None"}</p>
            </div>
          </div>

          <div className="card p-5">
            <h2 className="mb-3 font-semibold text-powder-600">Measurements (inches)</h2>
            {filledSizes.length === 0 ? (
              <p className="text-sm text-slate-500">No measurements saved for this order.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {filledSizes.map((field) => (
                  <div key={field.key} className="rounded-xl bg-powder-50 p-3">
                    <p className="text-xs text-slate-500">{field.label}</p>
                    <p className="font-semibold">{order.measurements[field.key]}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {allowed.length > 0 && (
            <div className="card no-print p-5">
              <h2 className="mb-3 font-semibold">Update status</h2>
              <div className="flex flex-wrap gap-3">
                {allowed.map((status) => (
                  <button
                    key={status}
                    onClick={() => changeStatus(status)}
                    disabled={busy}
                    className="rounded-xl border border-blush-200 px-4 py-2 text-blush-600 hover:bg-blush-50 disabled:opacity-60"
                  >
                    Mark as {status}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="card h-fit p-5">
          <h2 className="mb-3 font-semibold">Payment</h2>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Price</span>
              <span>Rs {order.price}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Advance</span>
              <span>Rs {order.advance}</span>
            </div>
            {order.payments.map((p) => (
              <div key={p._id} className="flex justify-between">
                <span className="text-slate-500">
                  {formatDate(p.date)} {p.note && `(${p.note})`}
                </span>
                <span>Rs {p.amount}</span>
              </div>
            ))}
            <div className="flex justify-between border-t border-blush-100 pt-2">
              <span className="text-slate-500">Total paid</span>
              <span>Rs {order.totalPaid}</span>
            </div>
            <div className="flex justify-between text-base font-semibold">
              <span>Balance</span>
              <span className={order.balance > 0 ? "text-blush-600" : "text-green-600"}>
                {order.balance > 0 ? `Rs ${order.balance}` : "Paid"}
              </span>
            </div>
          </div>

          {isOwner && order.balance > 0 && (
            <form onSubmit={addPayment} className="no-print mt-5 space-y-3">
              <input
                type="number"
                min="1"
                className="input"
                placeholder="Amount (Rs)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <input
                className="input"
                placeholder="Note (optional)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <button type="submit" className="btn w-full" disabled={busy}>
                Add payment
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrderDetails;
