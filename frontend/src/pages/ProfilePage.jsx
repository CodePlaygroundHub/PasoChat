import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import {
  ArrowLeft,
  Camera,
  Mail,
  User,
  Save,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const navigate = useNavigate();

  const [selectedImg, setSelectedImg] = useState(null);
  const [fullName, setFullName] = useState("");
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (authUser) setFullName(authUser.fullName || "");
  }, [authUser]);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
      setSelectedImg(reader.result);
      setIsDirty(true);
    };
  };

  const handleSave = async () => {
    if (!isDirty) return;

    await updateProfile({
      fullName,
      profilePic: selectedImg,
    });

    setIsDirty(false);
    setSelectedImg(null);
  };

  return (
    <div className="flex h-full w-full bg-base-200 overflow-hidden items-center justify-center p-0 md:p-3 lg:p-4">
      <div className="flex flex-col h-full w-full max-w-6xl bg-base-100 md:rounded-2xl shadow-xl overflow-hidden border border-base-300">

        {/* Top Navbar */}
        <Navbar />

        {/* Scrollable Main Area */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-8 bg-zinc-50 dark:bg-[#100F0F] custom-scrollbar">
          <div className="mx-auto max-w-2xl space-y-6">
            {/* Header Action Bar */}
            <div className="flex items-center justify-between gap-4 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-4">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  aria-label="Back to App"
                  title="Back to App"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4 stroke-[1.75]" />
                </button>

                <div className="min-w-0">
                  <h1 className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
                    Account profile
                  </h1>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                    Manage your display name and profile picture.
                  </p>
                </div>
              </div>

              {isDirty && (
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isUpdatingProfile}
                  className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md bg-zinc-900 dark:bg-zinc-100 px-3 text-xs font-medium text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:pointer-events-none transition-colors cursor-pointer"
                >
                  {isUpdatingProfile ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5 stroke-[1.75]" />
                  )}
                  <span>Save changes</span>
                </button>
              )}
            </div>

            {/* Profile Avatar & Details */}
            <div className="rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-[#141313] p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-5 pb-6 border-b border-zinc-100 dark:border-zinc-800/70">
                <div className="relative mx-auto sm:mx-0 h-20 w-20 shrink-0">
                  <img
                    src={selectedImg || authUser?.profilePic || "/avatar.png"}
                    alt={`${authUser?.fullName || "User"} profile`}
                    onError={(e) => {
                      e.currentTarget.src = "/avatar.png";
                    }}
                    className={`h-20 w-20 rounded-full object-cover border border-zinc-200 dark:border-zinc-700 transition-opacity ${isUpdatingProfile ? "opacity-40" : "opacity-100"
                      }`}
                  />

                  {isUpdatingProfile && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin text-zinc-700 dark:text-zinc-200" />
                    </div>
                  )}

                  <label
                    htmlFor="avatar-upload"
                    title="Upload new image"
                    className={`absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer ${isUpdatingProfile ? "opacity-50 pointer-events-none" : ""
                      }`}
                  >
                    <Camera className="h-3.5 w-3.5 stroke-[1.75]" />
                    <input
                      id="avatar-upload"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageSelect}
                      disabled={isUpdatingProfile}
                    />
                  </label>
                </div>

                <div className="text-center sm:text-left space-y-1">
                  <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                    Profile photo
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Select a square image for the sharpest display across chats.
                  </p>
                  <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                    PNG, JPG, or GIF up to 5MB
                  </p>
                </div>
              </div>

              {/* Form Input Fields */}
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="profile-fullname"
                    className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
                  >
                    Full name
                  </label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 dark:text-zinc-500 stroke-[1.75]" />
                    <input
                      id="profile-fullname"
                      type="text"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        setIsDirty(true);
                      }}
                      className="h-9 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 pl-9 pr-3 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-zinc-400 dark:focus:border-zinc-600 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Email address
                  </label>
                  <div className="relative flex h-9 w-full items-center justify-between rounded-md border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/40 pl-9 pr-3 text-xs text-zinc-500 dark:text-zinc-400">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 dark:text-zinc-500 stroke-[1.75]" />
                    <span className="truncate">{authUser?.email}</span>
                    <span className="ml-2 shrink-0 text-[11px] text-zinc-400 dark:text-zinc-500">
                      Read only
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Status */}
            <div className="rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-[#141313] p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="h-4 w-4 text-zinc-500 dark:text-zinc-400 stroke-[1.75]" />
                <h2 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  Verification status
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-lg border border-zinc-200/70 dark:border-zinc-800/70 bg-zinc-50/70 dark:bg-zinc-900/40 p-3.5 flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400">
                    <Calendar className="h-4 w-4 stroke-[1.75]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Member since
                    </p>
                    <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100 tabular-nums mt-0.5">
                      {authUser?.createdAt?.split("T")[0] || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border border-zinc-200/70 dark:border-zinc-800/70 bg-zinc-50/70 dark:bg-zinc-900/40 p-3.5 flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4 stroke-[1.75]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Account status
                    </p>
                    <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100 mt-0.5">
                      Active member
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage; 