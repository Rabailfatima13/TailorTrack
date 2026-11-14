import { useEffect, useState, type FormEvent } from "react";
import api, { getErrorMessage } from "../api/axios";
import type { StaffSummary, User } from "../types";

function Staff() {
  const [staff, setStaff] = useState<User[]>([]);
  const [summary, setSummary] = useState<StaffSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadStaff() {
    setLoading(true);
    setError("");
    try {
      const [staffRes, summaryRes] = await Promise.all([
        api.get("/users/staff"),
        api.get("/users/staff/summary"),
      ]);
      setStaff(staffRes.data);
      setSummary(summaryRes.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStaff();
  }, []);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !username.trim() || !password) {
      setError("Name, username and password are required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await api.post("/users/staff", { name, username, password, phone });
      setName("");
      setUsername("");
      setPassword("");
      setPhone("");
      setShowForm(false);
      setSuccess("Staff member added");
      loadStaff();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(person: User) {
    try {
      await api.put(`/users/staff/${person._id}`, { active: !person.active });
      setSuccess(`${person.name} was ${person.active ? "deactivated" : "activated"}`);
      loadStaff();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  function statsFor(id: string) {
    return summary.find((s) => s.staffId === id);
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Staff</h1>
        {!showForm && (
          <button className="btn" onClick={() => setShowForm(true)}>
            + Add staff
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="card mb-6 grid gap-3 p-5 sm:grid-cols-2">
          <h2 className="text-lg font-semibold sm:col-span-2">New staff member</h2>
          <input className="input" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="input" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <input className="input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <input className="input" placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <div className="flex gap-2 sm:col-span-2">
            <button className="btn" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
            <button type="button" className="rounded-full border border-blush-200 px-4 py-1 text-blush-600" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {success && <p className="mb-4 rounded-xl bg-green-50 p-2 text-sm text-green-600">{success}</p>}
      {error && <p className="mb-4 rounded-xl bg-red-50 p-2 text-sm text-red-500">{error}</p>}

      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : staff.length === 0 ? (
        <p className="card p-4 text-slate-500">No staff members yet.</p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-powder-50 text-slate-500">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Username</th>
                <th className="px-4 py-2">Phone</th>
                <th className="px-4 py-2">Completed orders</th>
                <th className="px-4 py-2">Earned</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {staff.map((person) => {
                const stats = statsFor(person._id);
                return (
                  <tr key={person._id} className="border-t border-blush-50 hover:bg-blush-50/50">
                    <td className="px-4 py-3 font-medium">{person.name}</td>
                    <td className="px-4 py-3">{person.username}</td>
                    <td className="px-4 py-3">{person.phone || "-"}</td>
                    <td className="px-4 py-3">{stats?.completedOrders ?? 0}</td>
                    <td className="px-4 py-3">{(stats?.earned ?? 0).toLocaleString()}</td>
                    <td className="px-4 py-3">{person.active ? "Active" : "Inactive"}</td>
                    <td className="px-4 py-3 text-right">
                      <button className="text-powder-600 hover:underline" onClick={() => toggleActive(person)}>
                        {person.active ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Staff;
