import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { getCurrentUserIdSync } from "@/utils/getCurrentUser";
import { ToastContainer, CloseNoteModal, FilePreviewModal } from "./components";
import type {
  LeadThread,
  Task,
  TaskStatusObject,
  ToastKind,
  ToastMsg,
  FileAttachment,
  PinnedMessage,
  GroupChat,
  Message,
  ReceivedInfo,
  WorkType,
  ChecklistItem,
  TaskLogMessage,
} from "./types";
import { WorkspaceView } from "./workspace/WorkspaceView";
import { TeamMonitorView } from "./lead/TeamMonitorView";
import { MainSidebar } from "./components/MainSidebar";
import { ViewModeSwitcher } from "@/features/portal/components/ViewModeSwitcher";

import { DepartmentTransferSheet } from "@/components/sheet/DepartmentTransferSheet";
import { AssignTaskSheet } from "@/components/sheet/AssignTaskSheet";
import { GroupTransferSheet } from "@/components/sheet/GroupTransferSheet";
import type { ChecklistTemplateMap, ChecklistTemplateItem } from "./types";
import { TaskLogThreadSheet } from "./workspace/TaskLogThreadSheet";
import { usePinnedMessages } from "@/hooks/queries/usePinnedMessages";
import { usePinMessage, useUnpinMessage } from "@/hooks/mutations/usePinMessage";
import { useStarMessage, useUnstarMessage } from "@/hooks/mutations/useStarMessage";
import { useGroups, flattenGroups } from "@/hooks/queries/useGroups";
import { useConversationMembers } from "@/hooks/queries/useConversationMembers";
import { WorkTypeManagerDialog } from './components/WorkTypeManagerDialog';

type PortalMode = "desktop" | "mobile";

interface PortalWireframesProps {
  portalMode?: PortalMode;
}

export default function PortalWireframes({
  portalMode = "desktop",
}: PortalWireframesProps) {
  // ---------- auth & navigation ----------
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  // ---------- shared UI state ----------
  const [tab, setTab] = useState<"info" | "order" | "tasks">("info");
  const [mode, setMode] = useState<"CSKH" | "THUMUA">("CSKH");
  const [leftTab, setLeftTab] = useState<"contacts" | "messages">("messages");
  const [showAvail, setShowAvail] = useState(false);
  const [showMyWork, setShowMyWork] = useState(false);
  const [view, setView] = useState<"workspace" | "lead">("workspace");
  const [workspaceMode, setWorkspaceMode] = useState<"default" | "pinned">(
    "default"
  );
  const [showRight, setShowRight] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [q, setQ] = useState("");
  // const [showPinned, setShowPinned] = useState(false);
  const [viewMode, setViewMode] = React.useState<"lead" | "staff">("lead");

  const [receivedInfos, setReceivedInfos] = useState<ReceivedInfo[]>([]);

  const [transferSheet, setTransferSheet] = useState({
    open: false,
    info: undefined as ReceivedInfo | undefined,
  });

  const [groupTransferSheet, setGroupTransferSheet] = useState<{
    open: boolean;
    info?: ReceivedInfo;
  }>({
    open: false,
  });

  // WorkType Manager state
  const [showWorkTypeManager, setShowWorkTypeManager] = useState(false);
 

  // sẽ tính workTypes theo selectedGroup bên dưới
  // const workTypesFull = mockGroup_VH_Kho.workTypes ?? [];
  // const workTypes = workTypesFull.map(w => ({ id: w.id, name: w.name }));

  // const [selectedWorkTypeId, setSelectedWorkTypeId] = React.useState<string>(
  //   mockGroup_VH_Kho.defaultWorkTypeId || workTypesFull[0]?.id
  // );

  // const defaultWorkTypeId =
  //   mockGroup_VH_Kho.defaultWorkTypeId ?? workTypesFull[0]?.id ?? "wt_default";

  // const mockGroups = [mockGroup_VH_Kho, mockGroup_VH_TaiXe];

  // const [selectedGroup, setSelectedGroup] = React.useState(mockGroup_VH_Kho);
  // Groups will be loaded from API - start with empty array
  const groupsMerged: GroupChat[] = React.useMemo(() => {
    // TODO: Replace with API data from useGroups() hook
    // For now, return empty to avoid showing mock data
    return [];
  }, []);

  const [selectedGroup, setSelectedGroup] = React.useState<
    GroupChat | undefined
  >(undefined);
  const [selectedWorkTypeId, setSelectedWorkTypeId] =
    React.useState<string>("wt_default");

  // Danh sách "dạng checklist" (sub work type) của work type được chọn
  const checklistVariants =
    selectedGroup?.workTypes?.find((w) => w.id === selectedWorkTypeId)
      ?.checklistVariants ?? [];
  const defaultChecklistVariantId =
    checklistVariants.find((v) => v.isDefault)?.id ||
    checklistVariants[0]?.id ||
    undefined;

  // Messages will be loaded from API - start with empty array
  // TODO: Replace with useMessages() hook when conversation is selected
  const [messages, setMessages] = React.useState<Message[]>([]);

  // (1) Groups and contacts will be loaded from API
  const [groups] = React.useState(groupsMerged); // Empty until API loads
  const [contacts] = React.useState<
    Array<{
      id: string;
      name: string;
      role: "Leader" | "Member";
      online: boolean;
      lastMessage?: string;
      lastTime?: string;
      unreadCount?: number;
    }>
  >([]); // Empty until API loads

  // --- keyboard refs & shortcuts ---
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // --- Toast store ---
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  // --- Task log (nhật ký công việc) ---
  const [taskLogSheet, setTaskLogSheet] = useState<{
    open: boolean;
    taskId?: string;
  }>({ open: false });

  const [taskLogs, setTaskLogs] = useState<Record<string, TaskLogMessage[]>>(
    {}
  );
  const pushToast = (msg: string, kind: ToastKind = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, kind, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2500);
  };
  const removeToast = (id: string) =>
    setToasts((t) => t.filter((x) => x.id !== id));

  // const filteredMessages = React.useMemo(
  //   () => messages.filter(m => !selectedWorkTypeId || m.workTypeId === selectedWorkTypeId),
  //   [messages, selectedWorkTypeId]
  // );

  // ---------- mock data & wiring ----------

  // When useApiChat=true, selectedChat is set by ConversationListSidebar when API data loads
  // Initialize to null so that ConversationListSidebar can auto-select the first API group
  const [selectedChat, setSelectedChat] = React.useState<{
    type: "group" | "dm";
    id: string;
  } | null>(null);

  const onClearSelectedChat = () => setSelectedChat(null);
  const nowIso = () => new Date().toISOString();

  // Checklist Template theo WorkType + Variant
  const [checklistTemplates, setChecklistTemplates] =
    React.useState<ChecklistTemplateMap>({});

  // Tasks state - will be populated from API
  // TODO: Implement useTasks() hook to fetch tasks from API
  const [tasks, setTasks] = React.useState<Task[]>([]);

  /**
   * Get current user's display name
   * @returns The display name of the current user
   */
  const getCurrentUserName = (): string => {
    const user = useAuthStore.getState().user;
    if (user?.identifier) {
      return user.identifier;
    }
    // Fallback based on viewMode for backward compatibility
    return viewMode === 'lead' ? 'Thanh Trúc' : 'Diễm Chi';
  };

  // Dynamic user based on viewMode
  const currentUser = getCurrentUserName();
  const currentUserId = viewMode === 'lead' ? getCurrentUserIdSync() : 'u_diem_chi';
  const currentUserDepartment = viewMode === 'lead' ? 'Quản lý vận hành' : 'Nhân viên kho';

  //const now = new Date().toISOString();

  // Available tasks - will be populated from API
  // TODO: Fetch available/unassigned tasks from API
  const [available, setAvailable] = useState<Task[]>([]);

  // const [available, setAvailable] = useState<Task[]>([
  //   { id: 'PO1246', title: 'PO#1246 – Nhận hàng', status: 'waiting', createdAt: '15’ trước' },
  //   { id: 'PO1247', title: 'PO#1247 – Trả hàng', status: 'waiting', createdAt: '10’ trước' },
  //   { id: 'CSKH002', title: 'Vựa', status: 'waiting', createdAt: '8’ trước' },
  // ]);

  // My work tasks - will be populated from API
  // TODO: Fetch current user's assigned tasks from API
  const [myWork, setMyWork] = useState<Task[]>([]);
  // const [myWork, setMyWork] = useState<Task[]>([
  //   { id: 'PO1245', title: 'PO#1245 – Nhận hàng', status: 'processing', updatedAt: '2 phút trước' },
  //   { id: 'CSKH001', title: 'CSKH – Lên đơn', status: 'waiting', updatedAt: '15 phút trước' },
  // ]);

  // Lead threads - will be populated from API
  // TODO: Fetch team threads/tasks from API for leader view
  const [leadThreads, setLeadThreads] = useState<LeadThread[]>([]);

  const [assignOpenId, setAssignOpenId] = useState<string | null>(null);

  // --- Close note modal state ---
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closeNote, setCloseNote] = useState("");
  const [closeTargetId, setCloseTargetId] = useState<string | null>(null);

  // --- File preview modal state ---
  const [showPreview, setShowPreview] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileAttachment | null>(null);

  // -- Pinned messages (API integration) ---
  const [showPinnedToast, setShowPinnedToast] = useState(false);

  const onShowPinnedToast = () => {
    setShowPinnedToast(true);
    setTimeout(() => setShowPinnedToast(false), 2000);
  };

  // Get current conversation ID for pinned messages query
  const currentConversationId =
    selectedChat?.type === "group" ? selectedChat.id : undefined;

  // Fetch pinned messages from API
  const { data: pinnedMessagesData } = usePinnedMessages({
    conversationId: currentConversationId || "",
    enabled: !!currentConversationId,
  });

  // Transform API data to legacy PinnedMessage format for UI compatibility
  const pinnedMessages: PinnedMessage[] = React.useMemo(() => {
    if (!pinnedMessagesData || !selectedGroup) return [];

    return pinnedMessagesData.map((pinned) => ({
      id: pinned.messageId,
      chatId: selectedGroup.id,
      groupName: selectedGroup.name,
      workTypeName: "", // Can be derived from message if needed
      sender: pinned.message.senderName,
      type:
        pinned.message.contentType === "IMG"
          ? "image"
          : pinned.message.contentType === "FILE"
          ? "file"
          : "text",
      content: pinned.message.content || "",
      preview: pinned.message.content || "",
      time: pinned.pinnedAt,
      fileInfo: pinned.message.attachments?.[0]
        ? {
            name: pinned.message.attachments[0].fileName || "",
            type: pinned.message.contentType === "IMG" ? "image" : "other",
            url: `/api/files/${pinned.message.attachments[0].fileId}`, // Construct file URL
            size: pinned.message.attachments[0].fileSize.toString(),
          }
        : undefined,
    }));
  }, [pinnedMessagesData, selectedGroup]);

  // Pin/Unpin mutations
  const pinMessageMutation = usePinMessage({
    conversationId: currentConversationId || "",
    onSuccess: () => {
      pushToast("Đã ghim tin nhắn", "success");
      onShowPinnedToast();
    },
    onError: (error) => {
      pushToast(`Lỗi khi ghim tin nhắn: ${error.message}`, "error");
    },
  });

  const unpinMessageMutation = useUnpinMessage({
    conversationId: currentConversationId || "",
    onSuccess: () => {
      pushToast("Đã bỏ ghim tin nhắn", "success");
    },
    onError: (error) => {
      pushToast(`Lỗi khi bỏ ghim: ${error.message}`, "error");
    },
  });

  // Star/Unstar mutations
  const starMessageMutation = useStarMessage({
    conversationId: currentConversationId,
    onSuccess: () => {
      pushToast("Đã đánh dấu tin nhắn", "success");
    },
    onError: (error) => {
      pushToast(`Lỗi khi đánh dấu: ${error.message}`, "error");
    },
  });

  const unstarMessageMutation = useUnstarMessage({
    conversationId: currentConversationId,
    onSuccess: () => {
      pushToast("Đã bỏ đánh dấu tin nhắn", "success");
    },
    onError: (error) => {
      pushToast(`Lỗi khi bỏ đánh dấu: ${error.message}`, "error");
    },
  });

  // Xử lý mở tin nhắn đã ghim
  const [scrollToMessageId, setScrollToMessageId] = React.useState<
    string | undefined
  >(undefined);

  const handleUnpinMessage = (id: string) => {
    unpinMessageMutation.mutate({ messageId: id });
  };

  // Handle pin/unpin toggle from message bubble
  const handleTogglePin = (msg: Message) => {
    if (msg.isPinned) {
      unpinMessageMutation.mutate({ messageId: msg.id });
    } else {
      pinMessageMutation.mutate({ messageId: msg.id });
    }
  };

  // Handle star/unstar toggle from message bubble
  const handleToggleStar = (msg: Message) => {
    // Note: Message type from API doesn't have isStarred property
    // This would need to be updated based on actual API response
    starMessageMutation.mutate({ messageId: msg.id });
  };

  // Simple handlers for API-based components (accept messageId and current state)
  const handleTogglePinById = (messageId: string, isPinned: boolean) => {
    if (isPinned) {
      unpinMessageMutation.mutate({ messageId });
    } else {
      pinMessageMutation.mutate({ messageId });
    }
  };

  const handleToggleStarById = (messageId: string, isStarred: boolean) => {
    if (isStarred) {
      unstarMessageMutation.mutate({ messageId });
    } else {
      starMessageMutation.mutate({ messageId });
    }
  };

  const handleOpenPinnedMessage = (pin: PinnedMessage) => {
    // 1) mở đúng hội thoại (group/private) theo chatId
    setSelectedChat({ type: "group", id: pin.chatId }); // nếu có chat cá nhân thì phân nhánh ở đây

    // 2) đóng panel pin
    setWorkspaceMode("default");

    // 3) xác định messageId để ChatMain cuộn tới
    // tuỳ cấu trúc replyTo của bạn; dùng fallback an toàn:
    const targetId = pin.id;
    //   (pin.replyTo as any)?.id ||
    //   (pin.replyTo as any)?.messageId ||
    //   undefined;
    if (targetId) setScrollToMessageId(targetId);
  };

  // Dùng chung cho các nơi muốn "xem tin nhắn gốc"
  // (pinned message, xem từ tab Thông tin, v.v.)
  const handleOpenSourceMessage = React.useCallback(
    (messageId: string) => {
      setScrollToMessageId(messageId);
    },
    []
  );

  // Callback to reset scroll state (called from ChatMain after scroll completes)
  const handleScrollComplete = React.useCallback(() => {
    setScrollToMessageId(undefined);
  }, []);

  // Khi scrollToMessageId thay đổi -> cuộn tới tin nhắn tương ứng
  // React.useEffect(() => {
  //   if (!scrollToMessageId) return;

  //   const el = document.getElementById(`msg-${scrollToMessageId}`);
  //   if (el) {
  //     // Cuộn vào giữa màn hình
  //     el.scrollIntoView({ behavior: "smooth", block: "center" });

  //     // Thêm highlight giống pinned
  //     el.classList.add("pinned-highlight");
  //     window.setTimeout(() => {
  //       el.classList.remove("pinned-highlight");
  //     }, 2000);
  //   }

  //   // reset để lần sau click lại vẫn trigger được
  //   setScrollToMessageId(undefined);
  // }, [scrollToMessageId]);

  // helpers
  const setThreadOwner = (id: string, owner: string) =>
    setLeadThreads((rows) =>
      rows.map((r) => (r.id === id ? { ...r, owner, at: "vừa xong" } : r))
    );
  const setThreadStatus = (id: string, label: LeadThread["st"]) =>
    setLeadThreads((rows) =>
      rows.map((r) => (r.id === id ? { ...r, st: label, at: "vừa xong" } : r))
    );

  function enrichTasks(tasks: Task[], workTypes: WorkType[]) {
    return tasks.map((t) => {
      const wt = workTypes.find((w) => w.id === t.workTypeId);
      return {
        ...t,
        workTypeName: wt?.name ?? t.workTypeId, // fallback ID
        progressText: t.checklist?.length
          ? `${t.checklist.filter((c) => c.done).length}/${
              t.checklist.length
            } mục`
          : "Không có checklist",
      };
    });
  }

  // React.useEffect(() => {
  //   setTasks(prev => enrichTasks(prev, selectedGroup?.workTypes ?? []));
  // }, [selectedGroup]);

  React.useEffect(() => {
    setTasks((prev) =>
      prev.map((t) => {
        const wt = selectedGroup?.workTypes?.find((w) => w.id === t.workTypeId);
        return {
          ...t,
          workTypeName: wt?.name ?? t.workTypeId,
          progressText: t.checklist?.length
            ? `${t.checklist.filter((c) => c.done).length}/${
                t.checklist.length
              } mục`
            : "Không có checklist",
        };
      })
    );
  }, [selectedGroup]);

  // Fetch conversation members from API
  const { data: conversationMembersData } = useConversationMembers({
    conversationId: currentConversationId || "",
    enabled: !!currentConversationId,
  });

  // Transform conversation members to groupMembers format
  const groupMembers: {
    id: string;
    name: string;
    role?: "Leader" | "Member" | undefined;
  }[] = React.useMemo(() => {
    if (!conversationMembersData) return [];
    return conversationMembersData.map((member) => ({
      id: member.userId,
      name: member.userName,
      role: member.role === "leader" ? "Leader" : "Member",
    }));
  }, [conversationMembersData]);

  const createMockTask = (
    id: string,
    title: string,
    status: TaskStatusObject,
    currentUser: string,
    newOwner?: string
  ): Task => ({
    id,
    groupId: "grp-vanhanh-kho",
    workTypeId: "wt_nhan_hang",
    sourceMessageId: id,
    title,
    description: "",
    assignTo: newOwner || currentUser,
    assignFrom: currentUser,
    status,
    priority: { id: "2", code: "normal", label: "Bình thường", level: 2, color: "#ffcc00" },
    createdAt: nowIso(),
    updatedAt: nowIso(),
    checklist: [],
    history: [],
  });

  // Handlers cập nhật Task (status & checklist)
  const handleChangeTaskStatus = (
    id: string,
    nextStatus: Task['status']
  ) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: nextStatus, updatedAt: new Date().toISOString() }
          : t
      )
    );
  };

  const handleToggleChecklist = (
    taskId: string,
    itemId: string,
    done: boolean
  ) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              checklist: t.checklist?.map((c) =>
                c.id === itemId ? { ...c, done } : c
              ),
              updatedAt: new Date().toISOString(),
            }
          : t
      )
    );
  };

  const handleUpdateTaskChecklist = (taskId: string, next: ChecklistItem[]) => {
    setTasks((prev) => {
      return prev.map((t) => {
        if (t.id !== taskId) return t;

        const updated = {
          ...t,
          checklist: [...next],
          updatedAt: new Date().toISOString(),
        };

        // enrich progressText ngay lập tức
        const wt = selectedGroup?.workTypes?.find(
          (w) => w.id === updated.workTypeId
        );
        return {
          ...updated,
          workTypeName: wt?.name ?? updated.workTypeId,
          progressText: updated.checklist.length
            ? `${updated.checklist.filter((c) => c.done).length}/${
                updated.checklist.length
              } mục`
            : "Không có checklist",
        };
      });
    });
  };

  // Áp dụng template mới cho tất cả Task.todo thuộc workType
  const applyTemplateToTasks = (
    workTypeId: string,
    tpl: ChecklistTemplateItem[]
  ) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.workTypeId === workTypeId && t.status.code === "todo"
          ? {
              ...t,
              checklist: tpl.map((it) => ({
                id: "chk_" + Math.random().toString(36).slice(2),
                label: it.label,
                done: false,
              })),
            }
          : t
      )
    );
  };

  const handleClaim = (task: Task) => {
    const updated: Task = {
      ...task,
      status: { id: "2", code: "doing", label: "Đang làm", level: 2, color: "#ffa500" },
      updatedAt: new Date().toISOString(),
      history: [
        ...(task.history ?? []),
        {
          at: new Date().toISOString(),
          byId: "staff-an",
          type: "status_change",
          payload: { from: task.status, to: "in_progress" },
        },
      ],
    };
    setMyWork((prev) => [...prev, updated]);
    setAvailable((prev) => prev.filter((t) => t.id !== task.id));
    pushToast(`Đã nhận: ${task.title}`, "success");
  };

  const handleTransfer = (id: string, newOwner: string, title?: string) => {
    setThreadOwner(id, newOwner);
    if (newOwner !== currentUser) {
      // chuyển đi
      setMyWork((prev) => prev.filter((x) => x.id !== id));
      setAvailable((prev) =>
        prev.some((x) => x.id === id)
          ? prev
          : [
              ...prev,
              createMockTask(id, title || id, { id: "1", code: "todo", label: "Chưa làm", level: 1, color: "#999" }, currentUser, newOwner),
            ]
      );
      pushToast(`Đã chuyển ${title || id} → ${newOwner}`, "info");
    } else {
      // nhận lại
      setMyWork((prev) =>
        prev.some((x) => x.id === id)
          ? prev
          : [
              createMockTask(id, title || id, { id: "2", code: "doing", label: "Đang làm", level: 2, color: "#ffa500" }, currentUser),
              ...prev,
            ]
      );
      setAvailable((prev) => prev.filter((x) => x.id !== id));
      pushToast(`Đã nhận lại ${title || id}`, "success");
    }
  };

  const handleClose = (id: string) => {
    setMyWork((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: { id: "4", code: "finished", label: "Đã hoàn thành", level: 4, color: "#00cc00" }, updatedAt: new Date().toISOString() }
          : t
      )
    );
    pushToast(`Đã đóng: ${id}`, "success");
  };

  const handleLeadAssign = (id: string, newOwner: string, title?: string) => {
    setThreadOwner(id, newOwner);
    setAssignOpenId(null);

    if (newOwner === currentUser) {
      // leader tự assign cho mình
      setMyWork((prev) =>
        prev.some((x) => x.id === id)
          ? prev
          : [createMockTask(id, title || id, { id: "1", code: "todo", label: "Chưa làm", level: 1, color: "#999" }, currentUser), ...prev]
      );
      setAvailable((prev) => prev.filter((x) => x.id !== id));
    } else {
      // assign cho staff khác
      setMyWork((prev) => prev.filter((x) => x.id !== id));
      setAvailable((prev) =>
        prev.some((x) => x.id === id)
          ? prev
          : [
              ...prev,
              createMockTask(id, title || id, { id: "1", code: "todo", label: "Chưa làm", level: 1, color: "#999" }, currentUser, newOwner),
            ]
      );
    }

    pushToast(`Assign ${title || id} → ${newOwner}`, "info");
  };

  // const handleSelectGroup = (groupId: string) => {
  //   const g = mockGroups.find((x) => x.id === groupId);
  //   if (g) setSelectedGroup(g);
  // };
  const handleSelectGroup = (groupId: string) => {
    const g = groups.find((x) => x.id === groupId);
    if (!g) return;
    setSelectedGroup(g);
    setSelectedChat({ type: "group", id: g.id });
    setSelectedWorkTypeId(
      g.defaultWorkTypeId ?? g.workTypes?.[0]?.id ?? selectedWorkTypeId
    );
  };

  React.useEffect(() => {
    const saved = localStorage.getItem("viewMode");
    if (saved === "staff" || saved === "lead") setViewMode(saved);
  }, []);

  React.useEffect(() => {
    localStorage.setItem("viewMode", viewMode);
  }, [viewMode]);

  //   React.useEffect(() => {
  //   if (selectedChat?.type === "group" && selectedChat.id === mockGroup_VH_Kho.id) {
  //     setSelectedWorkTypeId(mockGroup_VH_Kho.defaultWorkTypeId);
  //   }
  // }, [selectedChat]);

  // React.useEffect(() => {
  //   if (selectedChat?.type === "group" && selectedChat.id === mockGroup_VH_Kho.id) {
  //     setSelectedWorkTypeId(
  //       mockGroup_VH_Kho.defaultWorkTypeId ?? workTypesFull[0]?.id ?? defaultWorkTypeId
  //     );
  //   }
  // }, [selectedChat, workTypesFull, defaultWorkTypeId]);

  // --- Keyboard shortcuts ---
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") {
        e.preventDefault();
        setShowSearch(true);
        requestAnimationFrame(() => searchInputRef.current?.focus());
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        // focus message input — để simple: bật search (tùy bạn gắn ref input chat sau)
        setShowSearch(false);
      }
      if (e.key === "Escape") {
        setShowCloseModal(false);
        setShowPreview(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // --- Close modal handlers ---
  const openCloseModalFor = (id: string) => {
    setCloseTargetId(id);
    setShowCloseModal(true);
  };
  const confirmClose = () => {
    if (closeTargetId) {
      handleClose(closeTargetId);
      if (closeNote.trim())
        console.log("[close-note]", closeTargetId, closeNote);
    }
    setCloseNote("");
    setCloseTargetId(null);
    setShowCloseModal(false);
  };

  // --- Preview handlers ---
  const openPreview = (file: FileAttachment) => {
    setPreviewFile(file);
    setShowPreview(true);
  };

  const handleSelectChat = (target: { type: "group" | "dm"; id: string }) => {
    setSelectedChat(target);
    // TODO: nếu muốn: load messages theo group/dm tại đây
    // setMessages(messagesByTarget[target.type][target.id] ?? []);
  };

  // Hàm xử lý khi Leader nhấn “Tiếp nhận thông tin”
  const handleReceiveInfo = (message: Message) => {
    const nowIso = new Date().toISOString();

    // ĐÃ TIẾP NHẬN RỒI THÌ THÔI
    const existed = receivedInfos.some((info) => info.messageId === message.id);
    if (existed) {
      pushToast("Tin nhắn này đã được tiếp nhận trước đó.", "info");
      return;
    }

    // 1) Create ReceivedInfo item
    const info: ReceivedInfo = {
      id: "info_" + message.id,
      messageId: message.id,
      groupId: message.groupId,
      title: (message.content ?? "").slice(0, 60),
      sender: message.sender,
      createdAt: nowIso,
      status: "waiting",
    };

    setReceivedInfos((prev) => [...prev, info]);

    // 2) Add system message
    const excerpt =
      (message.content ?? "").length > 40
        ? (message.content ?? "").slice(0, 40) + "…"
        : message.content ?? "";

    const systemMsg: Message = {
      id: "sys_" + Date.now(),
      type: "system",
      content: `${excerpt} được tiếp nhận bởi ${currentUser} lúc ${new Date(
        nowIso
      ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
      sender: "system",
      senderId: "system",
      groupId: message.groupId,
      time: nowIso,
      createdAt: nowIso,
      isMine: false,
      isPinned: false,
      isSystem: true,
    };

    setMessages((prev) => [...prev, systemMsg]);

    // 3) Auto open RightPanel + switch tab
    setShowRight(true);
    setTab("order"); // tab Công việc

    pushToast("Đã tiếp nhận thông tin.", "success");
  };

  // Handler onAssignInfo, mở cùng Action Sheet assign task đang dùng
  const [assignSheet, setAssignSheet] = useState<{
    open: boolean;
    source?: "message" | "receivedInfo";
    message?: Message;
    info?: ReceivedInfo;
  }>({
    open: false,
  });

  const onAssignInfo = (info: ReceivedInfo) => {
    setAssignSheet({
      open: true,
      source: "receivedInfo",
      info,
      message: undefined, // vì assign từ info, không phải từ message
    });
  };

  const onAssignFromMessage = (msg: Message) => {
    setAssignSheet({
      open: true,
      source: "message",
      message: msg,
      info: undefined,
    });
  };

  const openTransferSheet = (info: ReceivedInfo) => {
    setGroupTransferSheet({ open: true, info });
  };

  const handleTransferInfo = (infoId: string, departmentId: string) => {
    setReceivedInfos((prev) =>
      prev.map((i) =>
        i.id === infoId
          ? { ...i, status: "transferred", transferredTo: departmentId }
          : i
      )
    );

    pushToast("Đã chuyển thông tin sang phòng ban.", "success");
  };

  const handleCreateTask = ({
    title,
    sourceMessageId,
    assignTo,
    checklistVariantId,
    checklistVariantName,
  }: {
    title: string;
    sourceMessageId?: string;
    assignTo?: string;
    checklistVariantId?: string;
    checklistVariantName?: string;
  }): void => {
    // Xác định WorkType & variant (ưu tiên variant được chọn từ AssignTaskSheet)
    const wt = selectedGroup?.workTypes?.find(
      (w) => w.id === selectedWorkTypeId
    );

    let variantId = checklistVariantId;
    let variantName = checklistVariantName;

    if (!variantId) {
      const defaultVariant =
        wt?.checklistVariants?.find((v) => v.isDefault) ??
        wt?.checklistVariants?.[0];

      variantId = defaultVariant?.id;
      variantName = defaultVariant?.name;
    }

    const tplItems =
      variantId && checklistTemplates[selectedWorkTypeId]?.[variantId]
        ? checklistTemplates[selectedWorkTypeId][variantId]
        : [];

    const newTask: Task = {
      id: "task_" + Date.now(),
      title,
      description: title,
      groupId: selectedGroup?.id ?? "",
      sourceMessageId: sourceMessageId ?? "",
      assignTo: currentUserId, // Assign to current user
      assignFrom: currentUser,
      workTypeId: selectedWorkTypeId,
      workTypeName: wt?.name,
      checklistVariantId: variantId,
      checklistVariantName: variantName,
      status: { id: "1", code: "todo", label: "Chưa làm", level: 1, color: "#999" },
      checklist: tplItems.map((it) => ({
        id: "chk_" + Math.random().toString(36).slice(2),
        label: it.label,
        done: false,
      })),

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTasks((prev) => [...prev, newTask]);

    // 2. Initialize taskLogs IMMEDIATELY
    setTaskLogs((prev) => ({
      ...prev,
      [newTask.id]: [],
    }));

    // Liên kết task mới với message gốc (nếu có)
    if (sourceMessageId) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === sourceMessageId ? { ...m, taskId: newTask.id } : m
        )
      );
    }

    // 4. Update UI state
    setTab("tasks");
    setShowRight(true);

    // 5. Nếu assign từ ReceivedInfo → đổi trạng thái
    if (assignSheet.source === "receivedInfo" && assignSheet.info) {
      setReceivedInfos((prev) =>
        prev.map((i) =>
          i.id === assignSheet.info!.id ? { ...i, status: "assigned" } : i
        )
      );
    }

    pushToast("Đã giao công việc.", "success");
    // 🆕 Close mobile received info screen if open
    setAssignSheet({ open: false });
    
    pushToast("Đã giao công việc.", 'success');
  };

  // Handler:  Update group's workTypes
  const handleUpdateGroupWorkTypes = (groupId: string, updatedWorkTypes: WorkType[]) => {
    // 1. Update groups array
    const newGroups = groups.map((g) =>
      g.id === groupId ? { ...g, workTypes: updatedWorkTypes } : g
    );

    // Note: Since groups is const from useState, we need to update via parent
    // For now, we'll update local selectedGroup if it matches
    if (selectedGroup?.id === groupId) {
      setSelectedGroup({
        ...selectedGroup,
        workTypes: updatedWorkTypes,
      });

      // If current workType no longer exists, switch to first available or default
      const currentWorkTypeStillExists = updatedWorkTypes.some(
        (wt) => wt.id === selectedWorkTypeId
      );

      if (!currentWorkTypeStillExists) {
        const newDefaultId =
          updatedWorkTypes.find((wt) => wt.id === selectedGroup.defaultWorkTypeId)?.id ??
          updatedWorkTypes[0]?.id;

        if (newDefaultId) {
          setSelectedWorkTypeId(newDefaultId);
        }
      }
    }

    pushToast("Đã cập nhật loại việc.", "success");
  };

  const handleGroupTransferConfirm = ({
    infoId,
    toGroupId,
    workTypeId,
    assignTo,
    toGroupName,
    toWorkTypeName,
  }: {
    infoId: string;
    toGroupId: string;
    workTypeId: string;
    assignTo: string;
    toGroupName: string;
    toWorkTypeName: string;
  }) => {
    setReceivedInfos((prev) =>
      prev.map((inf) =>
        inf.id === infoId
          ? {
              ...inf,
              status: "transferred",
              transferredTo: toGroupId,
              transferredToGroupName: toGroupName,
              transferredWorkTypeName: toWorkTypeName,
            }
          : inf
      )
    );

    pushToast("Đã chuyển thông tin sang nhóm mới.", "success");
  };

  const handleSendTaskLogMessage = ({
    content,
    replyToId,
  }: {
    content: string;
    replyToId?: string;
  }) => {
    if (!taskLogSheet.taskId) return;
    const taskId = taskLogSheet.taskId;
    const now = new Date();

    const existing = taskLogs[taskId] ?? [];

    let replyTo: TaskLogMessage["replyTo"] | undefined;
    if (replyToId) {
      const original = existing.find((m) => m.id === replyToId);
      if (original) {
        const type =
          original.type === "text" ||
          original.type === "file" ||
          original.type === "image"
            ? original.type
            : "text";
        replyTo = {
          id: original.id,
          type,
          sender: original.sender,
          content: original.content,
          // nếu sau này hỗ trợ ảnh/file trong log thì map thêm tại đây
          fileInfo: original.fileInfo,
        };
      }
    }

    const newMsg: TaskLogMessage = {
      id:
        "tlog_" +
        now.getTime().toString(36) +
        "_" +
        Math.random().toString(36).slice(2, 6),
      taskId,
      senderId: currentUserId,
      sender: currentUser,
      type: "text",
      content,
      time: now.toISOString(),
      createdAt: now.toISOString(),
      isMine: true,
      files: [],
      fileInfo: undefined,
      replyTo,
    };

    setTaskLogs((prev) => ({
      ...prev,
      [taskId]: [...(prev[taskId] ?? []), newMsg],
    }));
  };

  // Helper:  Get groups where user is Leader
  const leaderGroups = React.useMemo(() => {    
    return groups.filter((g) =>
      g.members?.some((m) => m.userId === currentUserId && m.role === "leader")
    );
  }, [groups, currentUserId]);

  //DEBUG:
  // const leaderGroups = React.useMemo(() => {
  //   console.log("🔍 DEBUG leaderGroups:", {
  //     currentUserId,
  //     totalGroups: groups.length,
  //     groupsWithMembers: groups.filter(g => g.members && g.members.length > 0).length,
  //     sampleGroup: groups[0],
  //   });

  //   const filtered = groups.filter((g) => {
  //     const hasLeader = g.members?.some((m) => {
  //       console.log("  Checking member:", m, "against userId:", currentUserId);
  //       return m.userId === currentUserId && m.role === "leader";
  //     });

  //     console.log(`  Group "${g.name}": hasLeader=${hasLeader}`);
  //     return hasLeader;
  //   });

  //   console.log("✅ Filtered leaderGroups:", filtered.length, filtered);
  //   return filtered;
  // }, [groups, currentUserId]);

  // --- Task log sheet: task + message gốc + danh sách log ---
  const activeTaskLogTask = React.useMemo(
    () =>
      taskLogSheet.taskId
        ? tasks.find((t) => t.id === taskLogSheet.taskId)
        : undefined,
    [tasks, taskLogSheet.taskId]
  );

  const activeTaskLogSourceMessage = React.useMemo(() => {
    if (!activeTaskLogTask?.sourceMessageId) return undefined;
    return messages.find((m) => m.id === activeTaskLogTask.sourceMessageId);
  }, [messages, activeTaskLogTask?.sourceMessageId]);

  const activeTaskLogMessages: TaskLogMessage[] =
    taskLogSheet.taskId && taskLogs[taskLogSheet.taskId]
      ? taskLogs[taskLogSheet.taskId]
      : [];

  // --- Logout handler ---
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    
    <div
      className={`${
        portalMode === "mobile" ? "w-full h-full" : "w-screen h-screen"
      } flex overflow-hidden bg-gray-50 text-gray-800`}
    >
      {/* MainSidebar */}
      {portalMode !== "mobile" && (
        <MainSidebar
          activeView={view}
          viewMode={viewMode}
          workspaceMode={workspaceMode}
          onSelect={(key) => {
            if (key === "logout") {
              handleLogout();
              return;
            }
            if (key === "pinned") {
              // bật chế độ pinned trong workspace
              setView("workspace");
              setWorkspaceMode("pinned");
              // setShowPinned(true);
              return;
            }

            // Nếu user chọn workspace khi đang ở pinned → quay lại default
            if (key === "workspace") {
              setWorkspaceMode("default");
              setView("workspace");
              return;
            }

            setView(key); // 'lead'
          }}
          pendingTasks={[
            {
              id: "task_po1246_sapxep",
              title: "PO#1246 – Sắp xếp vị trí & nhập kho",
              workTypeName: "Nhận hàng",
              pendingUntil: "2025-11-13T09:00:00Z",
            },
            {
              id: "task_demo2",
              title: "Đổi trả – kiểm phiếu kho",
              workTypeName: "Đổi Trả",
              pendingUntil: "2025-11-14T17:00:00Z",
            },
          ]}
          showPinnedToast={showPinnedToast}
          currentUserName={currentUser}
          onOpenWorkTypeManager={() => setShowWorkTypeManager(true)}
        />
      )}

      {/* Nội dung chính */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {view === "workspace" ? (
          <WorkspaceView
            layoutMode={portalMode === "mobile" ? "mobile" : "desktop"}
            groups={groupsMerged}
            selectedGroup={selectedGroup}
            messages={messages}
            setMessages={setMessages}
            onSelectGroup={handleSelectGroup}
            contacts={contacts}
            selectedChat={selectedChat}
            onSelectChat={handleSelectChat}
            onClearSelectedChat={onClearSelectedChat}
            leftTab={leftTab}
            setLeftTab={setLeftTab}
            available={available}
            myWork={myWork}
            groupMembers={groupMembers}
            showAvail={showAvail}
            setShowAvail={setShowAvail}
            showMyWork={showMyWork}
            setShowMyWork={setShowMyWork}
            handleClaim={handleClaim}
            handleTransfer={handleTransfer}
            openCloseModalFor={openCloseModalFor}
            showRight={showRight}
            setShowRight={setShowRight}
            showSearch={showSearch}
            setShowSearch={setShowSearch}
            q={q}
            setQ={setQ}
            searchInputRef={searchInputRef}
            openPreview={openPreview}
            tab={tab}
            setTab={setTab}
            // showPinned={showPinned}
            // setShowPinned={setShowPinned}
            workspaceMode={workspaceMode}
            setWorkspaceMode={setWorkspaceMode}
            viewMode={viewMode}
            pinnedMessages={pinnedMessages}
            onClosePinned={() => setWorkspaceMode("default")}
            onUnpinMessage={handleUnpinMessage}
            onOpenPinnedMessage={handleOpenPinnedMessage}
            onShowPinnedToast={onShowPinnedToast}
            onTogglePin={handleTogglePin}
            onToggleStar={handleToggleStar}
            workTypes={(selectedGroup?.workTypes ?? []).map((w) => ({
              id: w.id,
              name: w.name,
            }))}
            selectedWorkTypeId={selectedWorkTypeId}
            onChangeWorkType={setSelectedWorkTypeId}
            currentUserId={currentUserId}
            currentUserName={currentUser}
            // Tasks & callbacks để RightPanel dùng thật
            tasks={tasks}
            onChangeTaskStatus={handleChangeTaskStatus}
            onToggleChecklist={handleToggleChecklist}
            onUpdateTaskChecklist={handleUpdateTaskChecklist}
            applyTemplateToTasks={applyTemplateToTasks}
            checklistTemplates={checklistTemplates}
            setChecklistTemplates={setChecklistTemplates}
            // Tiếp nhận thông tin
            onReceiveInfo={handleReceiveInfo}
            onTransferInfo={handleTransferInfo}
            receivedInfos={receivedInfos}
            onAssignInfo={onAssignInfo}
            onAssignFromMessage={onAssignFromMessage}
            openTransferSheet={openTransferSheet}
            onOpenTaskLog={(taskId) => {
              setTaskLogSheet({ open: true, taskId });
            }}
            taskLogs={taskLogs}
            onOpenSourceMessage={handleOpenSourceMessage}
            onScrollComplete={handleScrollComplete}
            scrollToMessageId={scrollToMessageId}
            onOpenQuickMsg={() => {
              // Mobile: tạm hiển thị toast, có thể thay bằng mở QuickMessageManager khi bạn muốn mount ở mobile
              pushToast(
                "Tin nhắn nhanh: tính năng đang phát triển cho mobile.",
                "info"
              );
            }}
            onOpenPinned={() => {
              setWorkspaceMode("pinned");
            }}
            onOpenTodoList={() => {
              pushToast(
                "Việc cần làm: tính năng đang phát triển cho mobile.",
                "info"
              );
            }}
            checklistVariants={checklistVariants}
            defaultChecklistVariantId={defaultChecklistVariantId}
            onCreateTaskFromMessage={handleCreateTask}
            
            onReassignTask={undefined}  // hoặc implement nếu cần
            
            onOpenWorkTypeManager={() => setShowWorkTypeManager(true)}
          />          
        ) : (
          <TeamMonitorView
            leadThreads={leadThreads}
            assignOpenId={assignOpenId}
            setAssignOpenId={setAssignOpenId}
            groupMembers={groupMembers}
            onAssign={handleLeadAssign}
          />
        )}

        {/* <ViewModeSwitcher viewMode={viewMode} setViewMode={setViewMode} /> */}

        {/* Modals */}
        <CloseNoteModal
          open={showCloseModal}
          note={closeNote}
          setNote={setCloseNote}
          onConfirm={confirmClose}
          onOpenChange={setShowCloseModal}
        />
        <FilePreviewModal
          open={showPreview}
          file={previewFile}
          onOpenChange={setShowPreview}
        />

        <AssignTaskSheet
          open={assignSheet.open}
          conversationId={selectedGroup?.id}
          messageId={assignSheet.message?.id}
          messageContent={assignSheet.message?.content}
          onClose={() => setAssignSheet({ open: false })}
          onTaskCreated={() => setAssignSheet({ open: false })}
        />

        <GroupTransferSheet
          open={groupTransferSheet.open}
          info={groupTransferSheet.info}
          groups={groups}
          currentUserId={currentUserId}
          currentUserName={currentUser}
          members={groupMembers}
          onClose={() => setGroupTransferSheet({ open: false })}
          onConfirm={handleGroupTransferConfirm}
        />

        <TaskLogThreadSheet
          open={taskLogSheet.open}
          onClose={() => setTaskLogSheet({ open: false })}
          task={activeTaskLogTask}
          sourceMessage={activeTaskLogSourceMessage}
          messages={activeTaskLogMessages}
          currentUserId={currentUserId}
          members={groupMembers}
          onSend={handleSendTaskLogMessage}
        />

        {/* Toasts */}
        <ToastContainer toasts={toasts} onClose={removeToast} />
      </div>


      {/* WorkType Manager Dialog (Desktop only) */}
      {portalMode !== "mobile" && (
        <WorkTypeManagerDialog
          open={showWorkTypeManager}
          onOpenChange={setShowWorkTypeManager}
          groups={leaderGroups}
          onSave={handleUpdateGroupWorkTypes}
        />
      )}
    </div>
  );
}
