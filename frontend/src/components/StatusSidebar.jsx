import { useEffect, useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { useStatusStore } from "../store/useStatusStore";
import { useAuthStore } from "../store/useAuthStore";
import AddStatusModal from "./AddStatusModal";

const StatusSidebar = ({ setActiveTab }) => {
  const { authUser } = useAuthStore();
  const { statuses, getStatuses, viewStatus, isStatusLoading } =
    useStatusStore();

  const [showAddStatus, setShowAddStatus] = useState(false);

  useEffect(() => {
    getStatuses();
  }, [getStatuses]);

  // Group statuses by user
  const groupedStatuses = statuses.reduce((acc, status) => {
    if (!status?.user?._id) return acc;
    const userId = status.user._id;
    if (!acc[userId]) {
      acc[userId] = {
        user: status.user,
        statuses: [],
      };
    }
    acc[userId].statuses.push(status);
    return acc;
  }, {});

  const statusGroups = Object.values(groupedStatuses);

  return (
    <>
      <div className="flex h-full w-full flex-col overflow-y-auto bg-white dark:bg-[#100F0F]">
        {/* Header */}
        <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-zinc-200/80 dark:border-zinc-800/80 px-3.5">
          <button
            type="button"
            onClick={() => setActiveTab("chats")}
            aria-label="Back to chats"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 stroke-[1.75]" />
          </button>
          <h2 className="text-sm font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            Status
          </h2>
        </div>

        {/* My Status */}
        <div className="border-b border-zinc-100 dark:border-zinc-800/80 px-2 py-2">
          <button
            type="button"
            onClick={() => setShowAddStatus(true)}
            className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors cursor-pointer"
          >
            <div className="relative shrink-0">
              <img
                src={authUser?.profilePic || "/avatar.png"}
                alt="My status"
                onError={(e) => {
                  e.currentTarget.src = "/avatar.png";
                }}
                className="h-10 w-10 rounded-full border border-zinc-200 dark:border-zinc-800 object-cover"
              />
              <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-white dark:border-[#100F0F] bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950">
                <Plus className="h-2.5 w-2.5 stroke-[2.5]" />
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-zinc-900 dark:text-zinc-100">
                My status
              </p>
              <p className="truncate text-[11px] text-zinc-500 dark:text-zinc-400">
                Tap to add status
              </p>
            </div>
          </button>
        </div>

        {/* Recent Updates */}
        <div className="flex-1 px-2 py-2">
          <p className="px-2.5 pb-1.5 text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
            Recent updates
          </p>

          {isStatusLoading && statusGroups.length === 0 && (
            <div className="px-2.5 py-4 text-xs text-zinc-500 dark:text-zinc-400">
              Loading statuses...
            </div>
          )}

          {!isStatusLoading && statusGroups.length === 0 && (
            <div className="px-2.5 py-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
              No recent status updates
            </div>
          )}

          <div className="space-y-0.5">
            {statusGroups.map(({ user, statuses: userStatuses }) => (
              <button
                key={user?._id}
                type="button"
                onClick={() => viewStatus(userStatuses[0])}
                className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors cursor-pointer"
              >
                <div className="relative shrink-0 rounded-full ring-2 ring-zinc-900/75 dark:ring-zinc-100/75 ring-offset-2 ring-offset-white dark:ring-offset-[#100F0F]">
                  <img
                    src={user.profilePic || "/avatar.png"}
                    alt={user?.fullName || "User"}
                    onError={(e) => {
                      e.currentTarget.src = "/avatar.png";
                    }}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-xs font-medium text-zinc-900 dark:text-zinc-100">
                      {user?.fullName}
                    </p>
                    {userStatuses.length > 1 && (
                      <span className="shrink-0 text-[10px] text-zinc-400 dark:text-zinc-500 tabular-nums">
                        {userStatuses.length}
                      </span>
                    )}
                  </div>
                  <p className="truncate text-[11px] text-zinc-500 dark:text-zinc-400 tabular-nums">
                    {new Date(userStatuses[0].createdAt).toLocaleTimeString(
                      [],
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {showAddStatus && (
        <AddStatusModal onClose={() => setShowAddStatus(false)} />
      )}
    </>
  );
};

export default StatusSidebar;