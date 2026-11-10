import { useEffect, useState } from "react";
import api, { getErrorMessage } from "../api/axios";
import CustomerForm from "../components/CustomerForm";
import type { Customer } from "../types";

function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadCustomers() {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/customers", {
        params: { search: search.trim(), archived: showArchived },
      });
      setCustomers(res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(loadCustomers, 300);
    return () => clearTimeout(timer);
  }, [search, showArchived]);

  async function handleArchive(customer: Customer) {
    if (!window.confirm(`Remove ${customer.name}?`)) return;
    try {
      const res = await api.delete(`/customers/${customer._id}`);
      setSuccess(res.data.message);
      loadCustomers();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleRestore(customer: Customer) {
    try {
      await api.put(`/customers/${customer._id}`, { archived: false });
      setSuccess(`${customer.name} was restored`);
      loadCustomers();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  function handleSaved() {
    setShowForm(false);
    setSuccess("Customer added");
    loadCustomers();
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Customers</h1>
        {!showForm && (
          <button className="btn" onClick={() => setShowForm(true)}>
            + Add customer
          </button>
        )}
      </div>

      {showForm && <CustomerForm onSaved={handleSaved} onCancel={() => setShowForm(false)} />}

      {success && <p className="mb-4 rounded-xl bg-green-50 p-2 text-sm text-green-600">{success}</p>}
      {error && <p className="mb-4 rounded-xl bg-red-50 p-2 text-sm text-red-500">{error}</p>}

      <div className="mb-4 flex flex-wrap items-center gap-4">
        <input
          className="input max-w-xs"
          placeholder="Search by name or phone"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
            className="accent-blush-500"
          />
          Show archived
        </label>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : customers.length === 0 ? (
        <p className="card p-4 text-slate-500">No customers found.</p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-powder-50 text-slate-500">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Phone</th>
                <th className="px-4 py-2">Address</th>
                <th className="px-4 py-2">Added on</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer._id} className="border-t border-blush-50 hover:bg-blush-50/50">
                  <td className="px-4 py-3 font-medium">{customer.name}</td>
                  <td className="px-4 py-3">{customer.phone}</td>
                  <td className="px-4 py-3">{customer.address || "-"}</td>
                  <td className="px-4 py-3">{new Date(customer.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    {customer.archived ? (
                      <button onClick={() => handleRestore(customer)} className="text-powder-600 hover:underline">
                        Restore
                      </button>
                    ) : (
                      <button onClick={() => handleArchive(customer)} className="text-blush-600 hover:underline">
                        Remove
                      </button>
                    )}
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

export default Customers;
