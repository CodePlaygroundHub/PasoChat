import { useEffect, useState } from "react";
import { useAdminStore } from "../store/useAdminStore";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  Filter,
  Flag,
  Loader2,
  MessageSquare,
  ShieldAlert,
  Trash2,
} from "lucide-react";

const AdminReports = () => {
  const {
    reports,
    getReports,
    updateReportStatus,
    banUserFromReport,
    deleteReportedMessage,
    deleteReport,
    loading,
  } = useAdminStore();

  const [filter, setFilter] = useState("");

  useEffect(() => {
    getReports(filter);
  }, [filter, getReports]);

  const getStatusBadge = (status) => {
    const styles = {
      pending:
        "border-amber-200/80 bg-amber-50/70 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-400",
      reviewed:
        "border-zinc-300 bg-zinc-100 text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200",
      resolved:
        "border-emerald-200/80 bg-emerald-50/70 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-400",
      rejected:
        "border-red-200/80 bg-red-50/70 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400",
    };

    return (
      <span
        className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium capitalize ${
          styles[status] ||
          "border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
        }`}
      >
        {status || "unknown"}
      </span>
    );
  };

  if (loading && reports.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-zinc-400 dark:text-zinc-500">
        <Loader2 className="h-5 w-5 animate-spin stroke-[1.75]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header & Status Filter */}
      <div className="flex flex-col justify-between gap-4 border-b border-zinc-200/80 pb-5 sm:flex-row sm:items-center dark:border-zinc-800/80">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
            <Flag className="h-4 w-4 stroke-[1.75]" />
          </span>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
              Reports
            </h1>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              Moderation queue and user safety actions.
            </p>
          </div>
        </div>

        <div className="relative flex items-center">
          <Filter className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 stroke-[1.75] text-zinc-400 dark:text-zinc-500" />
          <select
            aria-label="Filter reports by status"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="h-9 cursor-pointer rounded-md border border-zinc-200 bg-white pl-8 pr-7 text-xs font-medium text-zinc-700 transition-colors hover:border-zinc-300 focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-[#141313] dark:text-zinc-200 dark:hover:border-zinc-700 dark:focus:border-zinc-600"
          >
            <option value="">All reports</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Reports Table Card */}
      <div className="overflow-hidden rounded-xl border border-zinc-200/90 bg-white dark:border-zinc-800/90 dark:bg-[#141313]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-zinc-200/80 bg-zinc-50/70 text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:border-zinc-800/80 dark:bg-zinc-900/40 dark:text-zinc-400">
                <th className="px-4 py-3">Entities</th>
                <th className="px-4 py-3">Reason & content</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-100 text-xs dark:divide-zinc-800/70">
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-14 text-center">
                    <div className="mx-auto flex max-w-xs flex-col items-center justify-center text-center">
                      <span className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                        <CheckCircle2 className="h-4 w-4 stroke-[1.75]" />
                      </span>
                      <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        All clear
                      </p>
                      <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                        No reports match the selected status filter.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                reports.map((report) => {
                  const reporterName = report.reporter?.fullName || "Unknown";
                  const targetName =
                    report.reportedUser?.fullName || "Chat message";
                  const targetEmail =
                    report.reportedUser?.email || "Content report";

                  return (
                    <tr
                      key={report._id}
                      className="transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40"
                    >
                      {/* Reporter -> Target */}
                      <td className="px-4 py-3.5 align-top">
                        <div className="flex flex-wrap items-center gap-3">
                          {/* Reporter */}
                          <div className="min-w-0">
                            <span className="block text-[10px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                              Reporter
                            </span>
                            <div className="mt-1 flex items-center gap-2">
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-zinc-100 text-[11px] font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
                                {reporterName.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate font-medium text-zinc-900 dark:text-zinc-100">
                                  {reporterName}
                                </p>
                                {report.reporter?.email && (
                                  <p className="truncate font-mono text-[10px] text-zinc-500 dark:text-zinc-400">
                                    {report.reporter.email}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          <ArrowRight className="h-3.5 w-3.5 shrink-0 stroke-[1.75] text-zinc-400 dark:text-zinc-600" />

                          {/* Target */}
                          <div className="min-w-0">
                            <span className="block text-[10px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                              Target
                            </span>
                            <div className="mt-1 flex items-center gap-2">
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-[11px] font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
                                {targetName.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate font-medium text-zinc-900 dark:text-zinc-100">
                                  {targetName}
                                </p>
                                <p className="truncate font-mono text-[10px] text-zinc-500 dark:text-zinc-400">
                                  {targetEmail}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Reason & Message Snippet */}
                      <td className="max-w-md px-4 py-3.5 align-top">
                        <div className="space-y-2">
                          <div className="flex items-start gap-1.5">
                            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 stroke-[1.75] text-zinc-500 dark:text-zinc-400" />
                            <p className="leading-relaxed text-zinc-800 dark:text-zinc-200">
                              {report.reason}
                            </p>
                          </div>

                          {report.reportedMessage?.text && (
                            <div className="rounded-lg border border-zinc-200/80 bg-zinc-50/80 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900/50">
                              <div className="mb-1 flex items-center gap-1 text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
                                <MessageSquare className="h-3 w-3 stroke-[1.75]" />
                                <span>Reported message</span>
                              </div>
                              <p className="truncate text-[11px] italic text-zinc-600 dark:text-zinc-400">
                                "{report.reportedMessage.text}"
                              </p>
                            </div>
                          )}

                          <p className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500">
                            ID: {report._id}
                          </p>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 align-top">
                        {getStatusBadge(report.status)}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right align-top">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          {report.status === "pending" ? (
                            <div className="inline-flex items-center gap-1 rounded-lg border border-zinc-200/80 bg-zinc-50/70 p-1 dark:border-zinc-800 dark:bg-zinc-900/50">
                              <button
                                type="button"
                                title="Mark as reviewed"
                                aria-label="Mark as reviewed"
                                onClick={() =>
                                  updateReportStatus(report._id, "reviewed")
                                }
                                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-white hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                              >
                                <Eye className="h-3.5 w-3.5 stroke-[1.75]" />
                              </button>

                              {report.reportedMessage && (
                                <button
                                  type="button"
                                  title="Delete reported message"
                                  aria-label="Delete reported message"
                                  onClick={() =>
                                    deleteReportedMessage(report._id)
                                  }
                                  className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-amber-50 hover:text-amber-700 dark:text-zinc-400 dark:hover:bg-amber-950/30 dark:hover:text-amber-400"
                                >
                                  <Trash2 className="h-3.5 w-3.5 stroke-[1.75]" />
                                </button>
                              )}

                              {report.reportedUser && (
                                <button
                                  type="button"
                                  title="Ban reported user"
                                  aria-label="Ban reported user"
                                  onClick={() => banUserFromReport(report._id)}
                                  className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-zinc-400 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                                >
                                  <ShieldAlert className="h-3.5 w-3.5 stroke-[1.75]" />
                                </button>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-md border border-zinc-200/80 bg-zinc-50/70 px-2 py-1 text-[10px] font-medium text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
                              <CheckCircle2 className="h-3 w-3 stroke-[1.75] text-emerald-600 dark:text-emerald-400" />
                              Logged
                            </span>
                          )}

                          <button
                            type="button"
                            title="Delete report"
                            aria-label="Delete report"
                            onClick={() => deleteReport(report._id)}
                            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
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
      </div>
    </div>
  );
};

export default AdminReports;