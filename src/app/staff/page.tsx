"use client";

import React, { useState, useEffect } from "react";

interface UserAccount {
  id: string;
  email: string;
  fullName: string;
  role: "admin" | "staff" | "customer";
  isActive: boolean;
  createdAt: string;
  customer?: {
    id: string;
    companyName: string;
  };
}

export default function StaffPage() {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "staff",
  });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/staff");
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      } else {
        setFeedback({ type: "error", text: data.error || "Failed to load team." });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setFeedback({
          type: "success",
          text: `Account for ${data.user.fullName} (${data.user.role}) created successfully!`,
        });
        setIsModalOpen(false);
        setFormData({ fullName: "", email: "", password: "", role: "staff" });
        fetchUsers();
      } else {
        setFeedback({ type: "error", text: data.error || "Failed to create account." });
      }
    } catch (err) {
      setFeedback({ type: "error", text: "Network communication error." });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const matchesSearch =
      !searchQuery ||
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const adminCount = users.filter((u) => u.role === "admin").length;
  const staffCount = users.filter((u) => u.role === "staff").length;
  const customerCount = users.filter((u) => u.role === "customer").length;

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {feedback && (
        <div
          className={`p-4 rounded-md border text-xs font-mono flex items-center justify-between ${
            feedback.type === "success"
              ? "bg-[#E6F2F0] border-[#2F7D72] text-[#2F7D72]"
              : "bg-red-50 border-red-300 text-[#D9383A]"
          }`}
        >
          <span>{feedback.text}</span>
          <button
            onClick={() => setFeedback(null)}
            className="font-bold hover:opacity-75 uppercase text-[10px]"
          >
            [ Dismiss ]
          </button>
        </div>
      )}

      {/* Telemetry Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 border border-[#E1E6E3] rounded-md shadow-sm">
          <span className="text-[10px] font-mono text-[#5D6B6C] uppercase tracking-wider block">
            System Administrators
          </span>
          <span className="text-2xl font-bold font-mono text-[#12191A] mt-1 block">
            {adminCount}
          </span>
          <span className="text-[10px] text-[#5D6B6C] mt-1 block">
            Full root & billing privileges
          </span>
        </div>

        <div className="bg-white p-4 border border-[#E1E6E3] rounded-md shadow-sm">
          <span className="text-[10px] font-mono text-[#5D6B6C] uppercase tracking-wider block">
            Operations Staff
          </span>
          <span className="text-2xl font-bold font-mono text-[#2F7D72] mt-1 block">
            {staffCount}
          </span>
          <span className="text-[10px] text-[#2F7D72] mt-1 block">
            Quotation & customer management
          </span>
        </div>

        <div className="bg-white p-4 border border-[#E1E6E3] rounded-md shadow-sm">
          <span className="text-[10px] font-mono text-[#5D6B6C] uppercase tracking-wider block">
            Customer Portals
          </span>
          <span className="text-2xl font-bold font-mono text-[#2E8540] mt-1 block">
            {customerCount}
          </span>
          <span className="text-[10px] text-[#2E8540] mt-1 block">
            Scoped tenant credentials
          </span>
        </div>

        <div className="bg-white p-4 border border-[#E1E6E3] rounded-md shadow-sm">
          <span className="text-[10px] font-mono text-[#5D6B6C] uppercase tracking-wider block">
            Total Users
          </span>
          <span className="text-2xl font-bold font-mono text-[#12191A] mt-1 block">
            {users.length}
          </span>
          <span className="text-[10px] text-[#5D6B6C] mt-1 block">
            RBAC Enforced
          </span>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-4 border border-[#E1E6E3] rounded-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono text-[#5D6B6C] uppercase mr-1">Role:</span>
          {["all", "admin", "staff", "customer"].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1 text-xs font-mono uppercase rounded transition-colors ${
                roleFilter === r
                  ? "bg-[#2F7D72] text-white font-medium"
                  : "bg-[#F3F4F3] text-[#5D6B6C] hover:bg-[#E1E6E3]"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search user name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs bg-[#F8FAF9] border border-[#E1E6E3] rounded px-3 py-1.5 pl-8 text-[#12191A] focus:outline-none focus:border-[#2F7D72] w-64"
            />
            <span className="absolute left-2.5 top-2 text-xs text-[#5D6B6C]">🔍</span>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3 py-1.5 text-xs font-mono bg-[#12191A] hover:bg-[#2C3536] text-white rounded font-medium flex items-center space-x-1 whitespace-nowrap"
          >
            <span>+</span>
            <span>Provision User</span>
          </button>
        </div>
      </div>

      {/* Team Table */}
      <div className="bg-white border border-[#E1E6E3] rounded-md overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-[#E1E6E3] bg-[#F8FAF9] flex justify-between items-center">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#12191A]">
            User Accounts & Role Permissions Directory
          </h2>
          <span className="text-[10px] font-mono text-[#5D6B6C]">
            COUNT: {filteredUsers.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E1E6E3] bg-[#F8FAF9] text-[10px] font-mono text-[#5D6B6C] uppercase">
                <th className="py-2.5 px-4">Full Name</th>
                <th className="py-2.5 px-4">Email Address</th>
                <th className="py-2.5 px-4">Role</th>
                <th className="py-2.5 px-4">Associated Entity</th>
                <th className="py-2.5 px-4">Joined Date</th>
                <th className="py-2.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E1E6E3]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs font-mono text-[#5D6B6C]">
                    Querying credentials repository...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs font-mono text-[#5D6B6C]">
                    No accounts match the current filter.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[#F8FAF9] transition-colors">
                    <td className="py-3 px-4 font-bold text-[#12191A]">{u.fullName}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[#5D6B6C]">{u.email}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                          u.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : u.role === "staff"
                            ? "bg-[#E6F2F0] text-[#2F7D72]"
                            : "bg-blue-100 text-[#2563EB]"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#5D6B6C]">
                      {u.customer?.companyName || "Brightloop Internal HQ"}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[#5D6B6C]">
                      {new Date(u.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-green-100 text-[#2E8540] font-semibold">
                        ACTIVE
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provision Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full border border-[#E1E6E3] p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-[#E1E6E3] pb-3">
              <h3 className="text-sm font-mono font-bold text-[#12191A] uppercase">
                Provision New Team Account
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-black font-mono text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-mono text-[#5D6B6C] uppercase mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full border border-[#E1E6E3] rounded px-3 py-1.5 text-[#12191A] focus:outline-none focus:border-[#2F7D72]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-[#5D6B6C] uppercase mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-[#E1E6E3] rounded px-3 py-1.5 text-[#12191A] focus:outline-none focus:border-[#2F7D72]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-[#5D6B6C] uppercase mb-1">
                  Role Assignment *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full font-mono border border-[#E1E6E3] rounded px-3 py-1.5 text-[#12191A] focus:outline-none focus:border-[#2F7D72]"
                >
                  <option value="staff">Staff (Operational Operator)</option>
                  <option value="admin">Admin (Full System Privilege)</option>
                  <option value="customer">Customer (Tenant Portal)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-[#5D6B6C] uppercase mb-1">
                  Initial Password *
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full font-mono border border-[#E1E6E3] rounded px-3 py-1.5 text-[#12191A] focus:outline-none focus:border-[#2F7D72]"
                />
                <p className="text-[10px] text-[#5D6B6C] mt-1 font-mono">
                  Requirements: &gt;8 characters, 1 uppercase, 1 lowercase, 1 special character.
                </p>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-[#E1E6E3]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 font-mono text-[#5D6B6C] hover:text-[#12191A]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 font-mono bg-[#2F7D72] text-white rounded hover:bg-[#26665D] font-medium disabled:opacity-50"
                >
                  {submitting ? "Provisioning..." : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
