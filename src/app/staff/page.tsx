"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, Shield, User, CheckCircle2 } from "lucide-react";

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
    } catch {
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
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Toast Alert */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between ${
            feedback.type === "success"
              ? "bg-[#E7E1B1] border-[#C8D293] text-[#0D530E]"
              : "bg-red-100/70 border-red-300 text-red-900"
          }`}
        >
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-[#306D29]" />
            <span className="font-medium">{feedback.text}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-[11px] font-semibold uppercase tracking-wider hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-serif text-[#0D530E] tracking-tight font-normal">
            Team Governance & RBAC
          </h1>
          <p className="text-sm text-[#0D530E]/70 mt-1">
            Enterprise role-based access control, operator identity credentials, and tenant permission tiers.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-[#0D530E] hover:bg-[#146615] text-[#FBF5DD] text-xs font-medium rounded-xl transition-all shadow-none self-start sm:self-auto tracking-wide"
        >
          <Plus className="w-4 h-4" />
          <span>Add team member +</span>
        </button>
      </div>

      {/* Metrics Row: Thin vertical dividers matching Reference A */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 py-2 border-y border-[#D8D1A4]/60">
        <div className="pr-4 md:pr-6 border-b md:border-b-0 md:border-r border-[#D8D1A4]/60 pb-4 md:pb-0">
          <div className="text-xs text-[#0D530E]/70 font-sans">Administrators</div>
          <div className="text-2xl sm:text-3xl font-serif text-[#0D530E] mt-1 font-normal">
            {adminCount}
          </div>
          <div className="text-[11px] text-[#0D530E]/60 mt-0.5">Full root system access</div>
        </div>

        <div className="px-0 md:px-6 border-b md:border-b-0 md:border-r border-[#D8D1A4]/60 pb-4 md:pb-0">
          <div className="text-xs text-[#0D530E]/70 font-sans">Staff Operators</div>
          <div className="text-2xl sm:text-3xl font-serif text-[#306D29] mt-1 font-normal">
            {staffCount}
          </div>
          <div className="text-[11px] text-[#306D29] mt-0.5">Billing & operations agents</div>
        </div>

        <div className="pl-0 md:pl-6">
          <div className="text-xs text-[#0D530E]/70 font-sans">Customer Logins</div>
          <div className="text-2xl sm:text-3xl font-serif text-[#0D530E] mt-1 font-normal">
            {customerCount}
          </div>
          <div className="text-[11px] text-[#0D530E]/60 mt-0.5">Self-service portal users</div>
        </div>
      </div>

      {/* Control Bar: Role Tabs + Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {[
            { id: "all", label: `All Accounts (${users.length})` },
            { id: "admin", label: `Admins (${adminCount})` },
            { id: "staff", label: `Staff (${staffCount})` },
            { id: "customer", label: `Customers (${customerCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setRoleFilter(tab.id)}
              className={`px-3.5 py-1.5 text-xs font-sans rounded-lg transition-all ${
                roleFilter === tab.id
                  ? "bg-[#E7E1B1] text-[#0D530E] font-medium border border-[#C8D293]"
                  : "bg-transparent text-[#0D530E]/70 hover:bg-[#E7E1B1]/40 border border-transparent"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search team member..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs font-sans bg-white/70 border border-[#D8D1A4] rounded-xl px-3 py-2 pl-9 text-[#0D530E] placeholder:text-[#0D530E]/40 focus:outline-none focus:border-[#0D530E]"
          />
          <Search className="w-4 h-4 text-[#0D530E]/50 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Staff Table */}
      <div className="border border-[#D8D1A4] rounded-2xl overflow-hidden bg-[#FBF5DD]">
        <div className="bg-[#E7E1B1] px-6 py-4 flex items-center justify-between border-b border-[#D8D1A4]">
          <h2 className="font-serif text-lg text-[#0D530E] tracking-tight font-normal">
            Authorized System Accounts
          </h2>
          <span className="text-xs text-[#0D530E]/70 font-sans">
            {filteredUsers.length} active credentials
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#D8D1A4] font-sans text-[11px] text-[#0D530E]/70 uppercase tracking-wider bg-transparent">
                <th className="py-3 px-6">User / Identity</th>
                <th className="py-3 px-6">Work Email</th>
                <th className="py-3 px-6">Assigned Role</th>
                <th className="py-3 px-6">Associated Entity</th>
                <th className="py-3 px-6">Created On</th>
                <th className="py-3 px-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8D1A4]/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-[#0D530E]/60">
                    Loading accounts directory...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-[#0D530E]/60">
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[#E7E1B1]/25 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-medium text-[#0D530E]">{u.fullName}</div>
                      <div className="text-[11px] text-[#0D530E]/60 font-mono">{u.id.slice(0, 10)}</div>
                    </td>
                    <td className="py-4 px-6 text-[#0D530E]">
                      {u.email}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          u.role === "admin"
                            ? "bg-[#E7E1B1] text-[#0D530E] font-semibold"
                            : u.role === "staff"
                            ? "bg-[#E6F4EA] text-[#2E8540]"
                            : "bg-[#FEF7E0] text-[#B06000]"
                        }`}
                      >
                        <span className="mr-1.5">●</span>
                        <span className="capitalize">{u.role}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6 text-[#0D530E]/70">
                      {u.customer?.companyName || "Brightloop Internal"}
                    </td>
                    <td className="py-4 px-6 text-[11px] text-[#0D530E]/70">
                      {new Date(u.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] bg-[#E6F4EA] text-[#2E8540]">
                        Active
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Account Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-[#FBF5DD] rounded-2xl max-w-md w-full border border-[#D8D1A4] overflow-hidden shadow-2xl">
            <div className="bg-[#E7E1B1] px-6 py-4 flex justify-between items-center border-b border-[#D8D1A4]">
              <h3 className="font-serif text-lg text-[#0D530E] font-normal">
                Provision System Account
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#0D530E]/60 hover:text-[#0D530E] p-1 font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-sans font-medium uppercase tracking-wider text-[#0D530E]/70 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Alex Morgan"
                  className="w-full text-xs font-sans border border-[#D8D1A4] bg-white/70 rounded-xl px-3 py-2 text-[#0D530E] focus:outline-none focus:border-[#0D530E]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-sans font-medium uppercase tracking-wider text-[#0D530E]/70 mb-1">
                  Corporate Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="alex@brightloop.io"
                  className="w-full text-xs font-sans border border-[#D8D1A4] bg-white/70 rounded-xl px-3 py-2 text-[#0D530E] focus:outline-none focus:border-[#0D530E]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-sans font-medium uppercase tracking-wider text-[#0D530E]/70 mb-1">
                  Initial Password *
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full text-xs font-sans border border-[#D8D1A4] bg-white/70 rounded-xl px-3 py-2 text-[#0D530E] focus:outline-none focus:border-[#0D530E]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-sans font-medium uppercase tracking-wider text-[#0D530E]/70 mb-1">
                  Access Role Level *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full text-xs font-sans border border-[#D8D1A4] bg-white/70 rounded-xl px-3 py-2.5 text-[#0D530E] focus:outline-none focus:border-[#0D530E]"
                >
                  <option value="staff">Staff Operator (Operations & Billing)</option>
                  <option value="admin">System Administrator (Full Permissions)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-[#D8D1A4]/60">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-[#0D530E]/70 hover:text-[#0D530E]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 text-xs bg-[#0D530E] hover:bg-[#146615] text-[#FBF5DD] rounded-xl font-medium disabled:opacity-50 transition-all tracking-wide"
                >
                  {submitting ? "Deploying..." : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
