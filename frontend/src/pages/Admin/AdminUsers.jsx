import React, { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  useGetAdminUsersQuery,
  useCreateAdminUserMutation,
  useDeleteAdminUserMutation,
  usePatchAdminUserRoleMutation,
} from "../../redux/api/admin.js";

const ROLES = ["visitor", "artist", "curator", "superadmin"];

const AdminUsers = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { data: users, isLoading, isError, refetch } = useGetAdminUsersQuery();
  const [createUser, { isLoading: creating }] = useCreateAdminUserMutation();
  const [deleteUser, { isLoading: deleting }] = useDeleteAdminUserMutation();
  const [patchRole] = usePatchAdminUserRoleMutation();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("visitor");

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createUser({ username, email, password, role }).unwrap();
      toast.success("User created");
      setUsername("");
      setEmail("");
      setPassword("");
      setRole("visitor");
    } catch (err) {
      toast.error(err?.data?.errors?.[0]?.msg || "Could not create user");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user permanently?")) return;
    try {
      await deleteUser(id).unwrap();
      toast.success("User removed");
    } catch (err) {
      toast.error(err?.data?.errors?.[0]?.msg || "Could not delete user");
    }
  };

  const handleRoleChange = async (id, nextRole) => {
    try {
      await patchRole({ id, role: nextRole }).unwrap();
      toast.success("Role updated");
    } catch (err) {
      toast.error(err?.data?.errors?.[0]?.msg || "Could not update role");
    }
  };

  if (isLoading) {
    return (
      <p className="text-zinc-500 dark:text-white/50 text-sm">Loading users…</p>
    );
  }
  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/30 p-4 text-sm text-red-800 dark:text-red-200">
        Could not load users.{" "}
        <button
          type="button"
          onClick={() => refetch()}
          className="underline font-medium"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white tracking-tight">
          Users
        </h1>
        <p className="text-sm text-zinc-500 dark:text-white/45 mt-1">
          Create accounts, assign roles, or remove users.
        </p>
      </div>

      <form
        onSubmit={handleCreate}
        className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white/90 dark:bg-zinc-900/70 p-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 items-end"
      >
        <div>
          <label className="block text-xs font-medium text-zinc-500 dark:text-white/50 mb-1">
            Username
          </label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-500 dark:text-white/50 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-500 dark:text-white/50 mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
            required
            minLength={8}
          />
        </div>
        <div className="flex gap-2 flex-wrap sm:col-span-2 lg:col-span-1">
          <div className="flex-1 min-w-[120px]">
            <label className="block text-xs font-medium text-zinc-500 dark:text-white/50 mb-1">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={creating}
            className="self-end h-[42px] px-4 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-50"
          >
            {creating ? "…" : "Add user"}
          </button>
        </div>
      </form>

      <div className="rounded-2xl border border-zinc-200 dark:border-white/10 overflow-hidden bg-white/90 dark:bg-zinc-900/70">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-100/80 dark:bg-white/5 text-zinc-600 dark:text-white/60 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium w-48">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-white/8">
              {(users || []).map((u) => (
                <tr key={u._id} className="hover:bg-zinc-50/80 dark:hover:bg-white/[0.03]">
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-white">
                    {u.username}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-white/60">
                    {u.email}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      disabled={String(u._id) === String(userInfo?._id)}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      className="rounded-lg border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-950 px-2 py-1 text-xs"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      disabled={
                        deleting || String(u._id) === String(userInfo?._id)
                      }
                      onClick={() => handleDelete(u._id)}
                      className="text-xs font-medium text-red-600 dark:text-red-400 hover:underline disabled:opacity-40"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
