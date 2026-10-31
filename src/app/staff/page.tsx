"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, Shield, User } from "lucide-react";

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
          className={`p-4 rounded-md border text-xs flex items-center justify-between ${
            feedback.type === "success"
              ? "bg-[#E6F2F0] border-[#2F7D72] text-[#2F7D72]"
              : "bg-red-50 border-red-300 text-[#D9383A]"
          }`}
        >
          <span className="font-semibold">{feedback.text}</span>
          <button
            onClick={() => setFeedback(null)}
            className="font-bold hover:opacity-75 uppercase text-[10px]"
          >
            [ Dismiss ]
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E1E6E3]">
        <div>
          <h1 className="text-2xl font-bold font-display text-[#12191A] tracking-tight">
            Team & User Roles Governance
          </h1>
          <p className="text-xs text-[#5D6B6C] mt-1">
            Provision user accounts, configure Role-Based Access Control (RBAC), and manage staff credentials.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-[#2F7D72] hover:bg-[#26665D] text-white text-xs font-medium rounded-md shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Provision User</span>
        </button>
      </div>

      {/* Telemetry Metric Cards with Proper Spacing */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 border border-[#E1E6E3] rounded-lg shadow-xs space-y-2">
          <span className="text-xs font-medium text-[#5D6B6C] block">
            Administrators
          </span>
          <span className="text-2xl font-bold font-mono text-[#12191A] block">
            {adminCount}
          </span>
          <span className="text-[11px] text-[#5D6B6C] block">
            Root & billing control
          </span>
        </div>

        <div className="bg-white p-6 border border-[#E1E6E3] rounded-lg shadow-xs space-y-2">
          <span className="text-xs font-medium text-[#5D6B6C] block">
            Operations Staff
          </span>
          <span className="text-2xl font-bold font-mono text-[#2F7D72] block">
            {staffCount}
          </span>
          <span className="text-[11px] text-[#2F7D72] block">
            Quotations & lifecycle operators
          </span>
        </div>

        <div className="bg-white p-6 border border-[#E1E6E3] rounded-lg shadow-xs space-y-2">
          <span className="text-xs font-medium text-[#5D6B6C] block">
            Customer Portals
          </span>
          <span className="text-2xl font-bold font-mono text-[#2E8540] block">
            {customerCount}
          </span>
          <span className="text-[11px] text-[#2E8540] block">
            Scoped tenant access
          </span>
        </div>

        <div className="bg-white p-6 border border-[#E1E6E3] rounded-lg shadow-xs space-y-2">
          <span className="text-xs font-medium text-[#5D6B6C] block">
            Total Users
          </span>
          <span className="text-2xl font-bold font-mono text-[#12191A] block">
            {users.length}
          </span>
          <span className="text-[11px] text-[#5D6B6C] block">
            RBAC Enforced
          </span>
        </div>
      </div>

      {/* Control Bar: Filter & Search with Proper Spacing */}
      <div className="bg-white p-4 border border-[#E1E6E3] rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center space-x-2 w-full md:w-auto">
          {["all", "admin", "staff", "customer"].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize ${
                roleFilter === r
                  ? "bg-[#2F7D72] text-white"
                  : "bg-[#F8FAF9] text-[#5D6B6C] hover:text-[#12191A] border border-[#E1E6E3]"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search user name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-[#F8FAF9] border border-[#E1E6E3] rounded-md px-3 py-2 pl-9 text-[#12191A] focus:outline-none focus:border-[#2F7D72]"
          />
          <Search className="w-4 h-4 text-[#5D6B6C] absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Team Table with Proper Spacing */}
      <div className="bg-white border border-[#E1E6E3] rounded-lg shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F8FAF9] border-b border-[#E1E6E3] font-mono text-[10px] text-[#5D6B6C] uppercase">
                <th className="py-3.5 px-6">Full Name</th>
                <th className="py-3.5 px-6">Email Address</th>
                <th className="py-3.5 px-6">Role Assignment</th>
                <th className="py-3.5 px-6">Associated Organization</th>
                <th className="py-3.5 px-6">Joined Date</th>
                <th className="py-3.5 px-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E1E6E3]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#5D6B6C]">
                    Querying credentials repository...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#5D6B6C]">
                    No accounts match the current filter.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[#F8FAF9] transition-colors">
                    <td className="py-4 px-6 font-semibold text-[#12191A]">{u.fullName}</td>
                    <td className="py-4 px-6 font-mono text-[11px] text-[#5D6B6C]">{u.email}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                          u.role === "admin"
                            ? "bg-purple-50 text-purple-700 border border-purple-200"
                            : u.role === "staff"
                            ? "bg-[#E6F2F0] text-[#2F7D72] border border-[#2F7D72]/30"
                            : "bg-blue-50 text-[#2563EB] border border-blue-200"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-[#5D6B6C]">
                      {u.customer?.companyName || "Brightloop Internal HQ"}
                    </td>
                    <td className="py-4 px-6 font-mono text-[11px] text-[#5D6B6C]">
                      {new Date(u.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-mono uppercase bg-green-50 text-[#2E8540] border border-green-200 font-semibold">
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
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full border border-[#E1E6E3] p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-[#E1E6E3] pb-3">
              <h3 className="text-base font-bold text-[#12191A]">
                Provision New User Account
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
                <label className="block text-[11px] font-medium text-[#5D6B6C] uppercase mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full border border-[#E1E6E3] rounded-md px-3 py-2 text-[#12191A] focus:outline-none focus:border-[#2F7D72]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#5D6B6C] uppercase mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full font-mono border border-[#E1E6E3] rounded-md px-3 py-2 text-[#12191A] focus:outline-none focus:border-[#2F7D72]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#5D6B6C] uppercase mb-1">
                  Role Assignment *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full border border-[#E1E6E3] rounded-md px-3 py-2 text-[#12191A] focus:outline-none focus:border-[#2F7D72]"
                >
                  <option value="staff">Staff (Operational Operator)</option>
                  <option value="admin">Admin (Full System Privileges)</option>
                  <option value="customer">Customer (Tenant Portal)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#5D6B6C] uppercase mb-1">
                  Initial Password *
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full font-mono border border-[#E1E6E3] rounded-md px-3 py-2 text-[#12191A] focus:outline-none focus:border-[#2F7D72]"
                />
                <p className="text-[10px] text-[#5D6B6C] mt-1 font-mono">
                  Requirements: &gt;8 characters, 1 uppercase, 1 lowercase, 1 special character.
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-[#E1E6E3]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-[#5D6B6C] hover:text-[#12191A]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs bg-[#2F7D72] text-white rounded-md hover:bg-[#26665D] font-medium disabled:opacity-50"
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
