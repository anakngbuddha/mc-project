import { useState, useEffect } from "react";

const HISTORY_URL = "http://localhost:4000";

export type CloudAccount = {
  id: string;
  name: string;
  provider: "aws" | "huawei" | "azure";
  config: Record<string, any>;
  enabled: boolean;
  createdAt: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onAccountsUpdated?: () => void;
};

export default function CloudAccountsModal({ isOpen, onClose, onAccountsUpdated }: Props) {
  const [accounts, setAccounts] = useState<CloudAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [provider, setProvider] = useState<"aws" | "huawei" | "azure">("huawei");
  const [name, setName] = useState("");
  const [ak, setAk] = useState("");
  const [sk, setSk] = useState("");
  const [region, setRegion] = useState("");
  const [projectId, setProjectId] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [subscriptionId, setSubscriptionId] = useState("");

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${HISTORY_URL}/cloud-accounts`);
      if (resp.ok) {
        const data = await resp.json();
        setAccounts(data);
      }
    } catch (err: any) {
      setError("Failed to connect to history-service");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadAccounts();
      setError(null);
      setSuccessMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    let credentials: Record<string, any> = {};

    if (provider === "huawei") {
      if (!name || !ak || !sk || !projectId) {
        setError("Please fill in Name, AK, SK, and Project ID.");
        return;
      }
      credentials = { ak, sk, projectId, region: region || "cn-north-4" };
    } else if (provider === "aws") {
      if (!name || !ak || !sk) {
        setError("Please fill in Name, Access Key ID, and Secret Access Key.");
        return;
      }
      credentials = { ak, sk, region: region || "us-east-1" };
    } else if (provider === "azure") {
      if (!name || !tenantId || !clientId || !clientSecret || !subscriptionId) {
        setError("Please fill in all Azure credentials.");
        return;
      }
      credentials = { tenantId, clientId, clientSecret, subscriptionId };
    }

    try {
      const resp = await fetch(`${HISTORY_URL}/cloud-accounts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, provider, credentials }),
      });

      if (!resp.ok) {
        const res = await resp.json();
        throw new Error(res.error || "Failed to save cloud account");
      }

      setSuccessMsg(`Account "${name}" added successfully with AES-256 encrypted keys!`);
      setName("");
      setAk("");
      setSk("");
      setProjectId("");
      setRegion("");
      setTenantId("");
      setClientId("");
      setClientSecret("");
      setSubscriptionId("");

      loadAccounts();
      onAccountsUpdated?.();
    } catch (err: any) {
      setError(err.message || "Failed to save account");
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await fetch(`${HISTORY_URL}/cloud-accounts/${id}/toggle`, {
        method: "PATCH",
      });
      loadAccounts();
      onAccountsUpdated?.();
    } catch (err) {
      setError("Failed to toggle status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this cloud account?")) return;
    try {
      await fetch(`${HISTORY_URL}/cloud-accounts/${id}`, {
        method: "DELETE",
      });
      loadAccounts();
      onAccountsUpdated?.();
    } catch (err) {
      setError("Failed to delete account");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl text-slate-100 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white text-xl font-bold p-1 leading-none"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
          <span>☁️ Cloud Accounts & Key Management</span>
        </h2>
        <p className="text-xs text-slate-400 mb-6">
          Connect your AWS, Huawei Cloud, or Azure accounts. All secret keys are automatically encrypted with AES-256-GCM before database storage.
        </p>

        {error && (
          <div className="bg-rose-950/80 border border-rose-700 text-rose-200 text-sm px-3 py-2 rounded-lg mb-4">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-sm px-3 py-2 rounded-lg mb-4">
            {successMsg}
          </div>
        )}

        {/* Existing Accounts Section */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-2 uppercase tracking-wide">
            Connected Accounts ({accounts.length})
          </h3>
          {loading && <p className="text-xs text-slate-500">Loading accounts...</p>}
          {!loading && accounts.length === 0 && (
            <div className="p-3 bg-slate-950/50 rounded-lg border border-slate-800 text-xs text-slate-400">
              No cloud accounts added yet. (Collector is running in synthetic mock mode).
            </div>
          )}
          <div className="space-y-2">
            {accounts.map((acc) => (
              <div
                key={acc.id}
                className="flex items-center justify-between p-3 bg-slate-950/70 border border-slate-800/80 rounded-lg text-sm"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-200">{acc.name}</span>
                    <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded font-mono font-bold ${
                      acc.provider === "huawei" ? "bg-red-950 text-red-300 border border-red-800" :
                      acc.provider === "aws" ? "bg-amber-950 text-amber-300 border border-amber-800" :
                      "bg-blue-950 text-blue-300 border border-blue-800"
                    }`}>
                      {acc.provider}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                      acc.enabled ? "bg-emerald-950 text-emerald-300 border border-emerald-800" : "bg-slate-800 text-slate-400"
                    }`}>
                      {acc.enabled ? "ACTIVE" : "DISABLED"}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1 font-mono">
                    {acc.provider === "huawei" && `AK: ${acc.config.ak || "—"} | Project: ${acc.config.projectId || "—"}`}
                    {acc.provider === "aws" && `AK: ${acc.config.ak || "—"} | Region: ${acc.config.region || "—"}`}
                    {acc.provider === "azure" && `Tenant: ${acc.config.tenantId || "—"} | ClientID: ${acc.config.clientId || "—"}`}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggle(acc.id)}
                    className="text-xs px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  >
                    {acc.enabled ? "Disable" : "Enable"}
                  </button>
                  <button
                    onClick={() => handleDelete(acc.id)}
                    className="text-xs px-2 py-1 rounded bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add Account Form */}
        <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
          <h3 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wide">
            Add New Cloud Account
          </h3>

          {/* Provider Tabs */}
          <div className="flex gap-2 mb-4">
            {(["huawei", "aws", "azure"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setProvider(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                  provider === p
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                    : "bg-slate-900 text-slate-400 hover:bg-slate-800"
                }`}
              >
                {p === "huawei" ? "Huawei Cloud" : p === "aws" ? "AWS" : "Azure"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Account Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Production Cluster / HK Region"
                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {provider === "huawei" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Access Key (AK)</label>
                    <input
                      type="text"
                      value={ak}
                      onChange={(e) => setAk(e.target.value)}
                      placeholder="e.g. A9B8C7..."
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Secret Key (SK)</label>
                    <input
                      type="password"
                      value={sk}
                      onChange={(e) => setSk(e.target.value)}
                      placeholder="Secret Key"
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Project ID</label>
                    <input
                      type="text"
                      value={projectId}
                      onChange={(e) => setProjectId(e.target.value)}
                      placeholder="e.g. 04b98c..."
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Region</label>
                    <input
                      type="text"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      placeholder="cn-north-4 / ap-southeast-3"
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </>
            )}

            {provider === "aws" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Access Key ID</label>
                    <input
                      type="text"
                      value={ak}
                      onChange={(e) => setAk(e.target.value)}
                      placeholder="e.g. AKIA..."
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Secret Access Key</label>
                    <input
                      type="password"
                      value={sk}
                      onChange={(e) => setSk(e.target.value)}
                      placeholder="Secret Key"
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Region</label>
                  <input
                    type="text"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    placeholder="e.g. us-east-1"
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </>
            )}

            {provider === "azure" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Tenant ID</label>
                    <input
                      type="text"
                      value={tenantId}
                      onChange={(e) => setTenantId(e.target.value)}
                      placeholder="Tenant GUID"
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Client ID</label>
                    <input
                      type="text"
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      placeholder="App Client ID"
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Client Secret</label>
                    <input
                      type="password"
                      value={clientSecret}
                      onChange={(e) => setClientSecret(e.target.value)}
                      placeholder="Client Secret"
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Subscription ID</label>
                    <input
                      type="text"
                      value={subscriptionId}
                      onChange={(e) => setSubscriptionId(e.target.value)}
                      placeholder="Subscription GUID"
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-lg transition shadow-md shadow-indigo-600/20"
              >
                Save Account & Encrypt Keys
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
