import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";
import { measurementFields } from "../measurements";
import type { Customer, Order, User } from "../types";

const garmentTypes = ["Shalwar Kameez", "Kurta", "Waistcoat", "Suit", "Sherwani", "Lehenga", "Shirt", "Trousers"];

function toDateInput(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function OrderForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const presetCustomer = searchParams.get("customer");

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [staffList, setStaffList] = useState<User[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [garmentType, setGarmentType] = useState("");
  const [price, setPrice] = useState("");
  const [advance, setAdvance] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [originalDueDate, setOriginalDueDate] = useState("");
  const [workRate, setWorkRate] = useState("");
  const [instructions, setInstructions] = useState("");
  const [sizes, setSizes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/customers").then((res) => setCustomers(res.data));
    api.get("/users/staff").then((res) => setStaffList(res.data));
  }, []);

  useEffect(() => {
    if (!id) return;
    api
      .get(`/orders/${id}`)
      .then((res) => {
        const order: Order = res.data;
        const due = toDateInput(new Date(order.dueDate));
        setCustomerId(order.customer._id);
        setCustomerName(`${order.customer.name} (${order.customer.phone})`);
        setAssignedTo(order.assignedTo._id);
        setGarmentType(order.garmentType);
        setPrice(String(order.price));
        setAdvance(String(order.advance));
        setDueDate(due);
        setOriginalDueDate(due);
        setWorkRate(String(order.workRate));
        setInstructions(order.instructions || "");

        const copied: Record<string, string> = {};
        measurementFields.forEach((field) => {
          const value = order.measurements?.[field.key];
          if (value !== undefined) copied[field.key] = String(value);
        });
        setSizes(copied);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  // When opened from a customer's page, select that customer and copy their measurements
  useEffect(() => {
    if (isEdit || !presetCustomer || customerId) return;
    if (customers.some((c) => c._id === presetCustomer)) {
      handleCustomerChange(presetCustomer);
    }
  }, [customers, presetCustomer]);

  function handleCustomerChange(customerId: string) {
    setCustomerId(customerId);
    const customer = customers.find((c) => c._id === customerId);
    const copied: Record<string, string> = {};
    if (customer) {
      measurementFields.forEach((field) => {
        const value = customer.measurements?.[field.key];
        if (value !== undefined) copied[field.key] = String(value);
      });
    }
    setSizes(copied);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!customerId || !assignedTo || !garmentType.trim() || !price || !dueDate) {
      setError("Please fill in all required fields");
      return;
    }
    if (Number(price) <= 0) {
      setError("Price must be greater than 0");
      return;
    }
    if (Number(advance) < 0 || Number(advance) > Number(price)) {
      setError("Advance must be between 0 and the price");
      return;
    }
    if (Number(workRate) < 0) {
      setError("Work rate cannot be negative");
      return;
    }
    if (dueDate !== originalDueDate && dueDate < toDateInput(new Date())) {
      setError("Due date cannot be in the past");
      return;
    }

    const measurements: Record<string, number> = {};
    for (const field of measurementFields) {
      if (sizes[field.key]) measurements[field.key] = Number(sizes[field.key]);
    }

    const body = {
      assignedTo,
      garmentType,
      price: Number(price),
      advance: Number(advance) || 0,
      dueDate,
      workRate: Number(workRate) || 0,
      instructions,
      measurements,
    };

    setSaving(true);
    setError("");
    try {
      if (isEdit) {
        await api.put(`/orders/${id}`, body);
        navigate(`/orders/${id}`);
      } else {
        await api.post("/orders", { ...body, customerId });
        navigate("/orders", { state: { message: "Order created" } });
      }
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  }

  if (loading) return <p className="text-slate-500">Loading...</p>;

  const staffOptions = staffList.filter((s) => s.active || s._id === assignedTo);

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{isEdit ? "Edit order" : "New order"}</h1>
        <Link
          to={isEdit ? `/orders/${id}` : presetCustomer ? `/customers/${presetCustomer}` : "/orders"}
          className="text-sm text-powder-600 hover:underline"
        >
          {isEdit ? "Back to order" : presetCustomer ? "Back to customer" : "Back to orders"}
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="card p-5">
        {error && <p className="mb-4 rounded-xl bg-red-50 p-2 text-sm text-red-500">{error}</p>}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Customer *</label>
            {isEdit ? (
              <input className="input bg-slate-50" value={customerName} disabled />
            ) : (
              <select className="input" value={customerId} onChange={(e) => handleCustomerChange(e.target.value)}>
                <option value="">Select customer</option>
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} ({c.phone})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Assign to *</label>
            <select className="input" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
              <option value="">Select staff</option>
              {staffOptions.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Garment type *</label>
            <input
              className="input"
              list="garment-types"
              value={garmentType}
              onChange={(e) => setGarmentType(e.target.value)}
            />
            <datalist id="garment-types">
              {garmentTypes.map((g) => (
                <option key={g} value={g} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Due date *</label>
            <input
              type="date"
              className="input"
              min={isEdit ? undefined : toDateInput(new Date())}
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Price (Rs) *</label>
            <input type="number" min="1" className="input" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Advance paid (Rs)</label>
            <input
              type="number"
              min="0"
              className="input"
              value={advance}
              onChange={(e) => setAdvance(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Staff work rate (Rs)</label>
            <input
              type="number"
              min="0"
              className="input"
              value={workRate}
              onChange={(e) => setWorkRate(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Instructions</label>
            <input className="input" value={instructions} onChange={(e) => setInstructions(e.target.value)} />
          </div>
        </div>

        <h3 className="mb-1 mt-6 text-sm font-semibold text-powder-600">Measurements (inches)</h3>
        <p className="mb-3 text-xs text-slate-400">
          {isEdit
            ? "These belong to this order only. The customer profile is not changed."
            : "Copied from the customer profile. Changes here only apply to this order."}
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {measurementFields.map((field) => (
            <div key={field.key}>
              <label className="mb-1 block text-xs text-slate-500">{field.label}</label>
              <input
                type="number"
                min="0"
                step="0.25"
                className="input"
                value={sizes[field.key] || ""}
                onChange={(e) => setSizes({ ...sizes, [field.key]: e.target.value })}
              />
            </div>
          ))}
        </div>

        <button type="submit" className="btn mt-6" disabled={saving}>
          {saving ? "Saving..." : isEdit ? "Save changes" : "Create order"}
        </button>
      </form>
    </div>
  );
}

export default OrderForm;
