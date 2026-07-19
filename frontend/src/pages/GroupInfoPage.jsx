import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import AddMemberModal from "../components/AddMemberModal";
import ChangeGroupInfoModal from "../components/ChangeGroupInfoModal";
import GroupMembersList from "../components/GroupMembersList";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/useAuthStore";

const GroupInfoPage = () => {
  const { id: groupId } = useParams();
  const navigate = useNavigate();
  const { authUser } = useAuthStore();

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showEditGroup, setShowEditGroup] = useState(false);

  const isAdmin =
    group?.members?.some((m) => {
      const memberId = typeof m.userId === "string" ? m.userId : m.userId?._id;
      return (
        memberId?.toString() === authUser?._id?.toString() && m.role === "admin"
      );
    }) || false;

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const res = await axiosInstance.get(`/groups/${groupId}`);
        setGroup(res.data);
      } catch (error) {
        toast.error("Failed to load group");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [groupId]);

  const handleLeaveGroup = async () => {
    try {
      await axiosInstance.post(`/groups/${groupId}/leave`);
      toast.success("You left the group");
      navigate("/");
    } catch {
      toast.error("Failed to leave group");
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!group) return null;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setShowEditGroup(true)}
            className="relative"
          >
            <img
              src={group?.avatar || "/group.png"}
              alt={group?.name || "Group"}
              className="h-16 w-16 rounded-full object-cover border"
            />
            <span className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-xs">
              ✎
            </span>
          </button>

          {showEditGroup && (
            <ChangeGroupInfoModal
              group={group}
              onClose={() => setShowEditGroup(false)}
              onUpdateGroup={setGroup}
            />
          )}

          <div>
            <h1 className="text-2xl font-bold">{group.name}</h1>
            <p className="text-sm opacity-60">{group.members.length} members</p>
          </div>
        </div>
      </div>

      <GroupMembersList
        group={group}
        isAdmin={isAdmin}
        onUpdateGroup={setGroup}
      />

      <div className="flex gap-3">
        {isAdmin && (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowAddMember(true)}
          >
            Add Members
          </button>
        )}

        <button
          className="btn btn-error btn-sm btn-outline"
          onClick={handleLeaveGroup}
        >
          Leave Group
        </button>
      </div>

      {showAddMember && (
        <AddMemberModal
          group={group}
          onClose={() => setShowAddMember(false)}
          onUpdateGroup={setGroup}
        />
      )}
    </div>
  );
};

export default GroupInfoPage;
