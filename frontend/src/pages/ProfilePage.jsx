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
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 custom-scrollbar">
          <div className="mx-auto max-w-2xl space-y-6">
            
            {/* Header Action Bar */}
            <div className="flex items-center justify-between border-b border-base-200 pb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate("/")}
                  className="btn btn-ghost btn-sm btn-circle text-base-content/70 hover:text-base-content hover:bg-base-200"
                  title="Back to App"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                  <h1 className="text-xl font-extrabold tracking-tight text-base-content flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Account Profile
                  </h1>
                  <p className="text-xs text-base-content/60">
                    Update your public identity and profile picture
                  </p>
                </div>
              </div>

              {isDirty && (
                <button
                  onClick={handleSave}
                  disabled={isUpdatingProfile}
                  className="btn btn-primary btn-sm gap-2 shadow-md shadow-primary/20 animate-in fade-in zoom-in rounded-xl"
                >
                  {isUpdatingProfile ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>Save Changes</span>
                </button>
              )}
            </div>

            {/* Profile Avatar Card */}
            <div className="bg-base-200/40 border border-base-300 rounded-2xl p-6 sm:p-8 space-y-8">
              <div className="flex flex-col items-center gap-3">
                <div className="relative group">
                  <div className="relative h-28 w-28 sm:h-36 sm:w-36">
                    <img
                      src={selectedImg || authUser?.profilePic || "/avatar.png"}
                      alt={`${authUser?.fullName || "User"} profile`}
                      onError={(e) => {
                        e.currentTarget.src = "/avatar.png";
                      }}
                      className={`h-full w-full rounded-full object-cover ring-4 ring-primary/20 shadow-xl transition-all duration-300 ${
                        isUpdatingProfile
                          ? "opacity-50 blur-[2px]"
                          : "group-hover:brightness-95"
                      }`}
                    />

                    {isUpdatingProfile && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="loading loading-spinner loading-lg text-primary"></span>
                      </div>
                    )}
                  </div>

                  <label
                    htmlFor="avatar-upload"
                    className={`absolute bottom-1 right-1 p-2.5 rounded-full bg-primary text-primary-content cursor-pointer shadow-lg transition-all duration-200 hover:scale-110 active:scale-95 ring-2 ring-base-100 ${
                      isUpdatingProfile ? "opacity-50 pointer-events-none" : ""
                    }`}
                    title="Upload new image"
                  >
                    <Camera className="h-4 w-4" />
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

                <div className="text-center space-y-1">
                  <p className="text-xs font-medium text-base-content/70 flex items-center justify-center gap-1">
                    {/* <Sparkles className="w-3.5 h-3.5 text-warning" /> */}
                    Click camera icon to change avatar
                  </p>
                  <p className="text-[10px] text-base-content/40">
                    Supports PNG, JPG, or GIF (max 5MB)
                  </p>
                </div>
              </div>

              {/* Form Input Fields */}
              <div className="space-y-4 pt-2">
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text flex items-center gap-2 font-semibold text-xs text-base-content/80">
                      <User className="h-3.5 w-3.5 text-primary" /> Full Name
                    </span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      setIsDirty(true);
                    }}
                    className="input input-bordered bg-base-100 focus:input-primary transition-all w-full text-sm rounded-xl"
                  />
                </div>

                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text flex items-center gap-2 font-semibold text-xs text-base-content/80">
                      <Mail className="h-3.5 w-3.5 text-primary" /> Email Address
                    </span>
                  </label>
                  <div className="input input-bordered bg-base-100/60 flex items-center justify-between text-sm rounded-xl text-base-content/70 cursor-not-allowed">
                    <span className="truncate">{authUser?.email}</span>
                    <span className="badge badge-xs badge-ghost text-[10px] opacity-60">Read only</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Status Card */}
            <div className="bg-base-200/40 border border-base-300 rounded-2xl p-6">
              <h2 className="text-base font-bold mb-4 flex items-center gap-2 text-base-content">
                <ShieldCheck className="w-5 h-5 text-success" />
                Verification Status
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-base-100 border border-base-200 flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-base-content/50">
                      Member Since
                    </p>
                    <p className="font-semibold text-sm text-base-content">
                      {authUser?.createdAt?.split("T")[0] || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-base-100 border border-base-200 flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-success/10 text-success">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-base-content/50">
                      Account Status
                    </p>
                    <p className="text-success font-bold text-sm">
                      Active Member
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