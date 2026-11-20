import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useAdminStore } from "../store/useAdminStore";
import {
  AlertTriangle,
  Clock,
  Download,
  Eye,
  Hash,
  Loader2,
  MessageSquare,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const PIE_COLORS = ["#18181b", "#71717a", "#d4d4d8"];

const AdminDashboard = () => {
  const { dashboardStats, getDashboardStats, loading } = useAdminStore();
  const [isReportLoading, setIsReportLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    getDashboardStats();
  }, [getDashboardStats]);

  const handleGenerateReport = async () => {
    setIsReportLoading(true);
    setTimeout(() => {
      const reportData = [
        ["Metric", "Value"],
        ["Total Users", dashboardStats?.totalUsers ?? 0],
        ["Total Groups", dashboardStats?.totalGroups ?? 0],
        ["Total Messages", dashboardStats?.totalMessages ?? 0],
        ["Total Reports", dashboardStats?.totalReports ?? 0],
        ["Pending Reports", dashboardStats?.pendingReports ?? 0],
      ];

      const csvContent =
        "data:text/csv;charset=utf-8," +
        reportData.map((e) => e.join(",")).join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `admin_report_${new Date().toISOString().slice(0, 10)}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsReportLoading(false);
    }, 600);
  };

  const formatGrowthData = () => {
    if (!dashboardStats?.monthlyUsers) return [];
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const userMap = {};
    const messageMap = {};

    dashboardStats.monthlyUsers?.forEach((item) => {
      userMap[item._id] = item.users;
    });
    dashboardStats.monthlyMessages?.forEach((item) => {
      messageMap[item._id] = item.messages;
    });

    return months.map((month, index) => ({
      name: month,
      users: userMap[index + 1] || 0,
      messages: messageMap[index + 1] || 0,
    }));
  };

  const growthData = formatGrowthData();

  const pieData = [
    { name: "Users", value: dashboardStats?.totalUsers || 0, color: PIE_COLORS[0] },
    { name: "Groups", value: dashboardStats?.totalGroups || 0, color: PIE_COLORS[1] },
    { name: "Reports", value: dashboardStats?.totalReports || 0, color: PIE_COLORS[2] },
  ].filter((item) => item.value > 0);

  const totalEntities =
    (dashboardStats?.totalUsers || 0) +
    (dashboardStats?.totalGroups || 0) +
    (dashboardStats?.totalReports || 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-zinc-200/80 pb-5 sm:flex-row sm:items-center dark:border-zinc-800/80">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            Dashboard overview
          </h1>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            Real-time platform statistics and activity metrics.
          </p>
        </div>

        <button
          type="button"
          onClick={handleGenerateReport}
          disabled={isReportLoading}
          className="inline-flex h-9 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-md bg-zinc-900 px-3.5 text-xs font-medium text-white transition-colors hover:bg-zinc-800 disabled:pointer-events-none disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          {isReportLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin stroke-[1.75]" />
          ) : (
            <Download className="h-3.5 w-3.5 stroke-[1.75]" />
          )}
          <span>{isReportLoading ? "Generating..." : "Export report"}</span>
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard
          title="Total users"
          value={dashboardStats?.totalUsers}
          icon={Users}
          loading={loading}
          trend="+12%"
        />
        <StatCard
          title="Total groups"
          value={dashboardStats?.totalGroups}
          icon={Hash}
          loading={loading}
        />
        <StatCard
          title="Total messages"
          value={dashboardStats?.totalMessages}
          icon={MessageSquare}
          loading={loading}
        />
        <StatCard
          title="Total reports"
          value={dashboardStats?.totalReports}
          icon={AlertTriangle}
          loading={loading}
        />
        <StatCard
          title="Pending reports"
          value={dashboardStats?.pendingReports}
          icon={Clock}
          loading={loading}
          isWarning={(dashboardStats?.pendingReports || 0) > 0}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* User Growth Area Chart */}
        <div className="flex flex-col rounded-xl border border-zinc-200/90 bg-white p-5 lg:col-span-2 dark:border-zinc-800/90 dark:bg-[#141313]">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
                User growth
              </h3>
              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                Monthly user acquisition across {new Date().getFullYear()}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowDetails(true)}
              className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 hover:text-zinc-950 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
            >
              <Eye className="h-3.5 w-3.5 stroke-[1.75]" />
              <span>View details</span>
            </button>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={growthData}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="zincUsersFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#71717a" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#71717a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e4e4e7"
                  strokeOpacity={0.6}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#71717a" }}
                  dy={8}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #27272a",
                    backgroundColor: "#141313",
                    color: "#fafafa",
                    fontSize: "12px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                  }}
                  itemStyle={{ color: "#e4e4e7" }}
                  labelStyle={{ color: "#a1a1aa", marginBottom: "2px" }}
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="#52525b"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#zincUsersFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Entity Distribution Donut Chart */}
        <div className="flex flex-col rounded-xl border border-zinc-200/90 bg-white p-5 dark:border-zinc-800/90 dark:bg-[#141313]">
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
              Platform distribution
            </h3>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              Breakdown of active records
            </p>
          </div>

          <div className="relative my-4 h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={56}
                  outerRadius={78}
                  paddingAngle={3}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                >
                  {pieData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={entry.color}
                      stroke="transparent"
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #27272a",
                    backgroundColor: "#141313",
                    color: "#fafafa",
                    fontSize: "12px",
                  }}
                  itemStyle={{ color: "#e4e4e7" }}
                />
              </PieChart>
            </ResponsiveContainer>

            {!loading && (
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-semibold tracking-tight text-zinc-950 tabular-nums dark:text-zinc-50">
                  {totalEntities.toLocaleString()}
                </span>
                <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  Total records
                </span>
              </div>
            )}
          </div>

          <div className="mt-auto space-y-2">
            <LegendItem
              color={PIE_COLORS[0]}
              label="Users"
              value={dashboardStats?.totalUsers}
            />
            <LegendItem
              color={PIE_COLORS[1]}
              label="Groups"
              value={dashboardStats?.totalGroups}
            />
            <LegendItem
              color={PIE_COLORS[2]}
              label="Reports"
              value={dashboardStats?.totalReports}
            />
          </div>
        </div>
      </div>

      {/* Growth Analytics Modal */}
      {showDetails &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]"
            onClick={() => setShowDetails(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-zinc-200/90 bg-white shadow-xl dark:border-zinc-800/90 dark:bg-[#141313]"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between gap-3 border-b border-zinc-200/80 px-5 py-4 dark:border-zinc-800/80">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
                    <TrendingUp className="h-4 w-4 stroke-[1.75]" />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
                      Growth analytics
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Monthly breakdown for {new Date().getFullYear()}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowDetails(false)}
                  aria-label="Close modal"
                  className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800/70 dark:hover:text-zinc-200"
                >
                  <X className="h-4 w-4 stroke-[1.75]" />
                </button>
              </div>

              {/* Table */}
              <div className="flex-1 overflow-y-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-zinc-200/80 bg-zinc-50/70 text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:border-zinc-800/80 dark:bg-zinc-900/40 dark:text-zinc-400">
                      <th className="px-5 py-2.5">Month</th>
                      <th className="px-5 py-2.5 text-right">New users</th>
                      <th className="px-5 py-2.5 text-right">Messages</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 text-xs dark:divide-zinc-800/70">
                    {growthData.map((row) => (
                      <tr
                        key={row.name}
                        className="transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40"
                      >
                        <td className="px-5 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                          {row.name}
                        </td>
                        <td className="px-5 py-3 text-right font-mono tabular-nums text-zinc-700 dark:text-zinc-300">
                          {row.users.toLocaleString()}
                        </td>
                        <td className="px-5 py-3 text-right font-mono tabular-nums text-zinc-700 dark:text-zinc-300">
                          {row.messages.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between gap-3 border-t border-zinc-200/80 bg-zinc-50/60 px-5 py-3 dark:border-zinc-800/80 dark:bg-zinc-900/30">
                <span className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Live platform telemetry
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDetails(false)}
                    className="inline-flex h-8 cursor-pointer items-center justify-center rounded-md border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerateReport}
                    className="inline-flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-md bg-zinc-900 px-3 text-xs font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200"
                  >
                    <Download className="h-3.5 w-3.5 stroke-[1.75]" />
                    <span>Export CSV</span>
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

const LegendItem = ({ color, label, value }) => (
  <div className="flex items-center justify-between rounded-lg border border-zinc-100 bg-zinc-50/60 px-3 py-2 text-xs dark:border-zinc-800/70 dark:bg-zinc-900/40">
    <div className="flex items-center gap-2">
      <span
        className="h-2.5 w-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="font-medium text-zinc-600 dark:text-zinc-400">
        {label}
      </span>
    </div>
    <span className="font-mono font-medium tabular-nums text-zinc-900 dark:text-zinc-100">
      {value?.toLocaleString() ?? 0}
    </span>
  </div>
);

const StatCard = ({ title, value, icon: Icon, loading, trend, isWarning }) => {
  if (loading) {
    return (
      <div className="h-28 w-full animate-pulse rounded-xl border border-zinc-200/80 bg-zinc-100/70 dark:border-zinc-800/80 dark:bg-zinc-900/50" />
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200/90 bg-white p-4 transition-colors hover:border-zinc-300 dark:border-zinc-800/90 dark:bg-[#141313] dark:hover:border-zinc-700">
      <div className="flex items-center justify-between gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
          <Icon className="h-4 w-4 stroke-[1.75]" />
        </span>

        {trend && (
          <span className="rounded border border-emerald-200/80 bg-emerald-50/80 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-400">
            {trend}
          </span>
        )}
      </div>

      <div className="mt-3">
        <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
          {title}
        </p>
        <p
          className={`mt-0.5 text-2xl font-semibold tracking-tight tabular-nums ${
            isWarning
              ? "text-red-600 dark:text-red-400"
              : "text-zinc-950 dark:text-zinc-50"
          }`}
        >
          {value?.toLocaleString() ?? 0}
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;