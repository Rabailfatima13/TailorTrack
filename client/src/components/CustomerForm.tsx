import { useState, type FormEvent } from "react";
import api, { getErrorMessage } from "../api/axios";
import { measurementFields } from "../measurements";

interface Props {
  onSaved: () => void;
  onCancel: () => void;
}

function CustomerForm({ onSaved, onCancel }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [sizes, setSizes] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!name.trim() || !phone.trim()) {
      setError("Name and phone number are required");
      return;
    }
    if (!/^[0-9+\- ]{7,15}$/.test(phone.trim())) {
      setError("Phone number is not valid");
      return;
    }

    const measurements: Record<string, number | string> = {};
    for (const field of measurementFields) {
      const value = sizes[field.key];
      if (value) {
        if (Number(value) < 0) {
          setError(`${field.label} cannot be negative`);
          return;
        }
        measurements[field.key] = Number(value);
      }
    }
    if (notes.trim()) measurements.notes = notes.trim();

    setSaving(true);
    setError("");
    try {
      await api.post("/customers", { name, phone, address, measurements });
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card mb-6 p-5">
      <h2 className="mb-4 text-lg font-semibold">New customer</h2>

      {error && <p className="mb-4 rounded-xl bg-red-50 p-2 text-sm text-red-500">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium">Name *</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Phone *</label>
          <input
            className="input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0300-1234567"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Address</label>
          <input className="input" value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>
      </div>

      <h3 className="mb-2 mt-5 text-sm font-semibold text-powder-600">Measurements (inches)</h3>
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

      <label className="mb-1 mt-4 block text-sm font-medium">Notes</label>
      <input className="input" value={notes} onChange={(e) => setNotes(e.target.value)} />

      <div className="mt-5 flex gap-3">
        <button type="submit" className="btn" disabled={saving}>
          {saving ? "Saving..." : "Save customer"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-slate-200 px-4 py-2 text-slate-600 hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default CustomerForm;
