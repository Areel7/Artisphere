import React, { useState } from "react";
import {
  CheckCircle,
  XCircle,
  User,
  Mail,
  Clock,
  Palette,
  Building2,
  Inbox,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  useGetRequestsQuery,
  useApproveRequestMutation,
  useRejectRequestMutation,
} from "../../redux/api/request";
import Loader from "../../components/Loader";

const ROLE_META = {
  artist: {
    label: "Artist",
    icon: Palette,
    bg: "bg-violet-500/10 dark:bg-violet-500/10",
    text: "text-violet-700 dark:text-violet-400",
    border: "border-violet-200 dark:border-violet-500/20",
  },
  curator: {
    label: "Curator",
    icon: Building2,
    bg: "bg-sky-500/10 dark:bg-sky-500/10",
    text: "text-sky-700 dark:text-sky-400",
    border: "border-sky-200 dark:border-sky-500/20",
  },
};

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const RequestCard = ({ req, onApprove, onReject, approving, rejecting }) => {
  const meta = ROLE_META[req.role] || ROLE_META.artist;
  const RoleIcon = meta.icon;

  return (
    <div className="group relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-zinc-300 dark:hover:border-white/20 transition-all duration-200">
      {/* Role badge */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${meta.bg} ${meta.text} ${meta.border}`}
        >
          <RoleIcon className="w-3.5 h-3.5" />
          {meta.label} Request
        </span>
        <span className="flex items-center gap-1 text-[11px] text-zinc-400 dark:text-white/30">
          <Clock className="w-3 h-3" />
          {formatDate(req.createdAt)}
        </span>
      </div>

      {/* Applicant info */}
      <div className="space-y-2 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {req.username?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div>
            <p className="font-semibold text-zinc-900 dark:text-white text-sm">
              {req.username}
            </p>
            <p className="text-xs text-zinc-500 dark:text-white/40 flex items-center gap-1 mt-0.5">
              <Mail className="w-3 h-3" />
              {req.email}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          id={`approve-req-${req._id}`}
          onClick={() => onApprove(req._id, req.username, req.role)}
          disabled={approving || rejecting}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors disabled:opacity-60 disabled:pointer-events-none"
        >
          <CheckCircle className="w-4 h-4" />
          Approve
        </button>
        <button
          id={`reject-req-${req._id}`}
          onClick={() => onReject(req._id, req.username)}
          disabled={approving || rejecting}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500 border border-rose-500/30 hover:border-rose-500 text-rose-600 dark:text-rose-400 hover:text-white text-sm font-semibold transition-all disabled:opacity-60 disabled:pointer-events-none"
        >
          <XCircle className="w-4 h-4" />
          Reject
        </button>
      </div>
    </div>
  );
};

const AdminRequests = () => {
  const { data: requests = [], isLoading, isError, refetch } = useGetRequestsQuery();
  const [approveRequest] = useApproveRequestMutation();
  const [rejectRequest] = useRejectRequestMutation();
  const [processingId, setProcessingId] = useState(null);
  const [action, setAction] = useState(null); // 'approve' | 'reject'

  const handleApprove = async (id, name, role) => {
    setProcessingId(id);
    setAction("approve");
    try {
      const res = await approveRequest(id).unwrap();
      toast.success(res.msg || `${name} approved as ${role}!`);
    } catch (err) {
      const msg =
        err?.data?.errors?.[0]?.msg || err?.data?.message || "Failed to approve";
      toast.error(msg);
    } finally {
      setProcessingId(null);
      setAction(null);
    }
  };

  const handleReject = async (id, name) => {
    setProcessingId(id);
    setAction("reject");
    try {
      const res = await rejectRequest(id).unwrap();
      toast.success(res.msg || `${name}'s request has been rejected.`);
    } catch (err) {
      const msg =
        err?.data?.errors?.[0]?.msg || err?.data?.message || "Failed to reject";
      toast.error(msg);
    } finally {
      setProcessingId(null);
      setAction(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Role Requests
          </h1>
          <p className="text-sm text-zinc-500 dark:text-white/40 mt-1">
            Approve or reject artist &amp; curator applications.
          </p>
        </div>
        <button
          onClick={refetch}
          className="text-xs px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-white/50 hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* States */}
      {isLoading && (
        <div className="flex justify-center py-16">
          <Loader />
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-rose-500 font-medium">Failed to load requests.</p>
          <button
            onClick={refetch}
            className="mt-3 text-sm text-zinc-500 underline hover:text-zinc-700 dark:hover:text-white"
          >
            Try again
          </button>
        </div>
      )}

      {!isLoading && !isError && requests.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-white/5 flex items-center justify-center mb-4">
            <Inbox className="w-8 h-8 text-zinc-400 dark:text-white/30" />
          </div>
          <p className="font-semibold text-zinc-700 dark:text-white/70">
            No pending requests
          </p>
          <p className="text-sm text-zinc-400 dark:text-white/30 mt-1">
            New artist &amp; curator applications will appear here.
          </p>
        </div>
      )}

      {!isLoading && !isError && requests.length > 0 && (
        <>
          <p className="text-xs text-zinc-400 dark:text-white/30 mb-4">
            {requests.length} pending{" "}
            {requests.length === 1 ? "request" : "requests"}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {requests.map((req) => (
              <RequestCard
                key={req._id}
                req={req}
                onApprove={handleApprove}
                onReject={handleReject}
                approving={processingId === req._id && action === "approve"}
                rejecting={processingId === req._id && action === "reject"}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminRequests;
