import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useAdminStore } from "../store/useAdminStore";
import {
  Bot,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  Loader2,
  Mail,
  Search,
  ShieldAlert,
  Trash2,
  UserCheck,
  X,
} from "lucide-react";

const AdminUsers = () => {
  const { users, getUsers, deleteUser, loading } = useAdminStore();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    getUsers(page, search, roleFilter);
  }, [page, roleFilter, getUsers]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    getUsers(1, search, roleFilter);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      await deleteUser(userToDelete._id);
      setUserToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading && page === 1 && users.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-zinc-400 dark:text-zinc-500">
        <Loader2 className="h-5 w-5 animate-spin stroke-[1.75]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header & Controls */}
      <div className="flex flex-col justify-between gap-4 border-b border-zinc-200/80 pb-5 xl:flex-row xl:items-end dark:border-zinc-800/80">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-md border border-zinc-200/90 bg-zinc-50 px-2.5 py-1 text-[11px] font-medium text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-400">
            <span className="font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
              {users.length}
            </span>
            <span>accounts on page {page}</span>
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            User management
          </h1>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            Audit accounts, filter roles, and manage platform access.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Role Filter */}
          <div className="relative flex items-center">
            <Filter className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 stroke-[1.75] text-zinc-400 dark:text-zinc-500" />
            <select
              aria-label="Filter by role"
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="h-9 cursor-pointer rounded-md border border-zinc-200 bg-white pl-8 pr-7 text-xs font-medium text-zinc-700 transition-colors hover:border-zinc-300 focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-[#141313] dark:text-zinc-200 dark:hover:border-zinc-700 dark:focus:border-zinc-600"
            >
              <option value="">All roles</option>
              <option value="user">Users</option>
              <option value="admin">Admins</option>
            </select>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative flex items-center">
              <Search className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 stroke-[1.75] text-zinc-400 dark:text-zinc-500" />
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-52 rounded-md border border-zinc-200 bg-zinc-50/70 pl-8 pr-7 text-xs text-zinc-900 placeholder:text-zinc-400 transition-colors focus:border-zinc-400 focus:bg-white focus:outline-none sm:w-64 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-600 dark:focus:bg-zinc-900"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setPage(1);
                    getUsers(1, "", roleFilter);
                  }}
                  aria-label="Clear search"
                  className="absolute right-1.5 flex h-5 w-5 cursor-pointer items-center justify-center rounded text-zinc-400 transition-colors hover:bg-zinc-200/70 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                >
                  <X className="h-3 w-3 stroke-[1.75]" />
                </button>
              )}
            </div>

            <button
              type="submit"
              className="inline-flex h-9 shrink-0 cursor-pointer items-center justify-center rounded-md bg-zinc-900 px-3.5 text-xs font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Users Table Card */}
      <div className="overflow-hidden rounded-xl border border-zinc-200/90 bg-white dark:border-zinc-800/90 dark:bg-[#141313]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-zinc-200/80 bg-zinc-50/70 text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:border-zinc-800/80 dark:bg-zinc-900/40 dark:text-zinc-400">
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-100 text-xs dark:divide-zinc-800/70">
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-10 text-center text-xs text-zinc-500 dark:text-zinc-400"
                  >
                    No users found matching your filter.
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const isMetaAI = user.email === "ai@chat.app";
                  const isAdmin = user.role === "admin";
                  const canDelete =
                    !isMetaAI &&
                    !(isAdmin && user.email !== "your-email@admin.com");

                  return (
                    <tr
                      key={user._id}
                      className="group transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40"
                    >
                      {/* User Details */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            {user.profilePic && !isMetaAI ? (
                              <img
                                src={user.profilePic}
                                alt={user.fullName || "User"}
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                                className="h-9 w-9 rounded-full border border-zinc-200 object-cover dark:border-zinc-800"
                              />
                            ) : (
                              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-zinc-100 text-xs font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
                                {isMetaAI ? (
                                  <Bot className="h-4 w-4 stroke-[1.75]" />
                                ) : (
                                  user.fullName?.charAt(0)?.toUpperCase() || "U"
                                )}
                              </div>
                            )}

                            {user.isOnline && (
                              <span
                                title="Online"
                                className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#141313]"
                              />
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="truncate font-medium text-zinc-900 dark:text-zinc-100">
                                {user.fullName}
                              </p>
                              {isMetaAI && (
                                <span className="shrink-0 rounded border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                                  System AI
                                </span>
                              )}
                            </div>
                            <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-zinc-500 dark:text-zinc-400">
                              <Mail className="h-3 w-3 shrink-0 stroke-[1.75]" />
                              <span className="truncate">{user.email}</span>
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium capitalize ${
                            isAdmin
                              ? "border-zinc-300 bg-zinc-100 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                              : "border-zinc-200/80 bg-zinc-50 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        {user.isBanned ? (
                          <span className="inline-flex items-center gap-1 rounded-md border border-red-200/80 bg-red-50/70 px-2 py-0.5 text-[11px] font-medium text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
                            <ShieldAlert className="h-3 w-3 stroke-[1.75]" />
                            Banned
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md border border-zinc-200/80 bg-zinc-50/70 px-2 py-0.5 text-[11px] font-medium text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-300">
                            <UserCheck className="h-3 w-3 stroke-[1.75] text-emerald-600 dark:text-emerald-400" />
                            Active
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setSelectedUser(user)}
                            title="Inspect user"
                            aria-label={`Inspect ${user.fullName}`}
                            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/70 dark:hover:text-zinc-100"
                          >
                            <Eye className="h-3.5 w-3.5 stroke-[1.75]" />
                          </button>

                          <button
                            type="button"
                            disabled={!canDelete}
                            onClick={() => setUserToDelete(user)}
                            title={
                              canDelete ? "Delete user" : "Protected account"
                            }
                            aria-label={`Delete ${user.fullName}`}
                            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:pointer-events-none disabled:opacity-30 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                          >
                            <Trash2 className="h-3.5 w-3.5 stroke-[1.75]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-zinc-200/80 bg-zinc-50/60 px-4 py-3 dark:border-zinc-800/80 dark:bg-zinc-900/30">
          <span className="text-[11px] font-medium tabular-nums text-zinc-500 dark:text-zinc-400">
            Page {page}
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              aria-label="Previous page"
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-700 transition-colors hover:bg-zinc-100 disabled:pointer-events-none disabled:opacity-40 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <ChevronLeft className="h-4 w-4 stroke-[1.75]" />
            </button>

            <span className="flex h-8 min-w-[2rem] items-center justify-center rounded-md border border-zinc-200/80 bg-zinc-100/70 px-2.5 text-xs font-medium tabular-nums text-zinc-900 dark:border-zinc-800 dark:bg-zinc-800/70 dark:text-zinc-100">
              {page}
            </span>

            <button
              type="button"
              disabled={users.length === 0}
              onClick={() => setPage((prev) => prev + 1)}
              aria-label="Next page"
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-700 transition-colors hover:bg-zinc-100 disabled:pointer-events-none disabled:opacity-40 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <ChevronRight className="h-4 w-4 stroke-[1.75]" />
            </button>
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]"
            onClick={() => setSelectedUser(null)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm overflow-hidden rounded-xl border border-zinc-200/90 bg-white shadow-xl dark:border-zinc-800/90 dark:bg-[#141313]"
            >
              <div className="flex items-center justify-between border-b border-zinc-200/80 px-5 py-3.5 dark:border-zinc-800/80">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  Account details
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  aria-label="Close modal"
                  className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800/70 dark:hover:text-zinc-200"
                >
                  <X className="h-4 w-4 stroke-[1.75]" />
                </button>
              </div>

              <div className="p-5">
                <div className="flex flex-col items-center text-center">
                  {selectedUser.profilePic ? (
                    <img
                      src={selectedUser.profilePic}
                      alt={selectedUser.fullName || "User"}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                      className="mb-3 h-16 w-16 rounded-full border border-zinc-200 object-cover dark:border-zinc-800"
                    />
                  ) : (
                    <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full border border-zinc-200 bg-zinc-100 text-lg font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
                      {selectedUser.fullName?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                  )}

                  <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                    {selectedUser.fullName}
                  </h3>
                  <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                    {selectedUser.email}
                  </p>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-2.5 text-left">
                  <div className="rounded-lg border border-zinc-200/80 bg-zinc-50/70 p-3 dark:border-zinc-800 dark:bg-zinc-900/40">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                      Role
                    </p>
                    <p className="mt-0.5 text-xs font-medium capitalize text-zinc-900 dark:text-zinc-100">
                      {selectedUser.role}
                    </p>
                  </div>

                  <div className="rounded-lg border border-zinc-200/80 bg-zinc-50/70 p-3 dark:border-zinc-800 dark:bg-zinc-900/40">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                      Presence
                    </p>
                    <p className="mt-0.5 text-xs font-medium capitalize text-zinc-900 dark:text-zinc-100">
                      {selectedUser.isOnline ? "Online" : "Offline"}
                    </p>
                  </div>

                  <div className="col-span-2 rounded-lg border border-zinc-200/80 bg-zinc-50/70 p-3 dark:border-zinc-800 dark:bg-zinc-900/40">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                      Member since
                    </p>
                    <p className="mt-0.5 text-xs font-medium text-zinc-900 dark:text-zinc-100">
                      {selectedUser.createdAt
                        ? new Date(selectedUser.createdAt).toLocaleDateString(
                            "en-US",
                            { month: "long", year: "numeric" },
                          )
                        : "—"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="mt-5 inline-flex h-9 w-full cursor-pointer items-center justify-center rounded-md border border-zinc-200 bg-white text-xs font-medium text-zinc-800 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* Delete Confirmation Modal */}
      {userToDelete &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]"
            onClick={() => !isDeleting && setUserToDelete(null)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm overflow-hidden rounded-xl border border-zinc-200/90 bg-white shadow-xl dark:border-zinc-800/90 dark:bg-[#141313]"
            >
              <div className="flex items-center justify-between border-b border-zinc-200/80 px-5 py-3.5 dark:border-zinc-800/80">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <ShieldAlert className="h-4 w-4 stroke-[1.75]" />
                  <h3 className="text-xs font-semibold">Delete account</h3>
                </div>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setUserToDelete(null)}
                  aria-label="Close delete modal"
                  className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800/70 dark:hover:text-zinc-200"
                >
                  <X className="h-4 w-4 stroke-[1.75]" />
                </button>
              </div>

              <div className="p-5">
                <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                  Permanently remove{" "}
                  <span className="font-semibold text-zinc-950 dark:text-zinc-100">
                    {userToDelete.fullName}
                  </span>{" "}
                  and their associated account data? This action cannot be
                  undone.
                </p>

                <div className="mt-5 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => setUserToDelete(null)}
                    className="inline-flex h-8 cursor-pointer items-center justify-center rounded-md border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={handleConfirmDelete}
                    className="inline-flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-md bg-red-600 px-3 text-xs font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50 dark:bg-red-600 dark:hover:bg-red-500"
                  >
                    {isDeleting && (
                      <Loader2 className="h-3.5 w-3.5 animate-spin stroke-[1.75]" />
                    )}
                    <span>{isDeleting ? "Deleting..." : "Delete"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default AdminUsers;