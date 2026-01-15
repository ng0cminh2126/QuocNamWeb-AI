import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { ToastContainer, CloseNoteModal, FilePreviewModal } from "./components";
import type {
  LeadThread,
  Task,
  TaskStatus,
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
import {
  mockGroup_VH_Kho,
  mockGroup_VH_TaiXe,
  mockDepartments,
  mockChecklistTemplatesByVariant,
} from "@/data/mockOrg";
import { mockTasks } from "@/data/mockTasks";
import { DepartmentTransferSheet } from "@/components/sheet/DepartmentTransferSheet";
import { AssignTaskSheet } from "@/components/sheet/AssignTaskSheet";
import { GroupTransferSheet } from "@/components/sheet/GroupTransferSheet";
import type { ChecklistTemplateMap, ChecklistTemplateItem } from "./types";
import { TaskLogThreadSheet } from "./workspace/TaskLogThreadSheet";
import { usePinnedMessages } from "@/hooks/queries/usePinnedMessages";
import {
  usePinMessage,
  useUnpinMessage,
} from "@/hooks/mutations/usePinMessage";
import {
  useStarMessage,
  useUnstarMessage,
} from "@/hooks/mutations/useStarMessage";

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

  // Checklist Template theo WorkType + Variant
  const [checklistTemplates, setChecklistTemplates] =
    React.useState<ChecklistTemplateMap>(mockChecklistTemplatesByVariant);

  const [tasks, setTasks] = React.useState(() => structuredClone(mockTasks));

  const currentUser = "Diễm Chi";
  const currentUserId = "u_diem_chi";
  const members = ["Thu An", "Lệ Bình", "Diễm Chi"];
  //const now = new Date().toISOString();
  const nowIso = () => new Date().toISOString();

  const [available, setAvailable] = useState<Task[]>([
    {
      id: "task-001",
      groupId: "grp-vanhanh-kho",
      workTypeId: "wt_nhan_hang",
      sourceMessageId: "msg-001",
      title: "PO#1246 – Nhận hàng tại kho HCM",
      description: "Nhận hàng lô số 1246 cần kiểm tra số lượng và tình trạng.",
      assigneeId: "u_thu_an",
      assignedById: "u_thanh_truc",
      status: "todo",
      priority: "normal",
      dueAt: new Date(Date.now() + 3 * 86400000).toISOString(),
      createdAt: nowIso(),
      updatedAt: nowIso(),
      checklist: [
        { id: "chk1", label: "Kiểm đếm số lượng", done: false },
        { id: "chk2", label: "Xác nhận phiếu nhập kho", done: false },
      ],
      history: [],
    },
  ]);

  // const [available, setAvailable] = useState<Task[]>([
  //   { id: 'PO1246', title: 'PO#1246 – Nhận hàng', status: 'waiting', createdAt: '15’ trước' },
  //   { id: 'PO1247', title: 'PO#1247 – Trả hàng', status: 'waiting', createdAt: '10’ trước' },
  //   { id: 'CSKH002', title: 'Vựa', status: 'waiting', createdAt: '8’ trước' },
  // ]);

  const [myWork, setMyWork] = useState<Task[]>([
    {
      id: "task-002",
      groupId: "grp-vanhanh-kho",
      workTypeId: "doi_tra",
      sourceMessageId: "msg-002",
      title: "Xử lý đổi trả đơn hàng #5689",
      description: "Khách yêu cầu đổi do sai kích thước.",
      assigneeId: "u_diem_chi",
      assignedById: "u_thanh_truc",
      status: "in_progress",
      priority: "high",
      dueAt: new Date(Date.now() + 2 * 86400000).toISOString(),
      createdAt: nowIso(),
      updatedAt: nowIso(),
      checklist: [
        { id: "chk3", label: "Kiểm tra tình trạng hàng", done: true },
        { id: "chk4", label: "Tạo phiếu đổi trả", done: false },
      ],
      history: [],
    },
  ]);
  // const [myWork, setMyWork] = useState<Task[]>([
  //   { id: 'PO1245', title: 'PO#1245 – Nhận hàng', status: 'processing', updatedAt: '2 phút trước' },
  //   { id: 'CSKH001', title: 'CSKH – Lên đơn', status: 'waiting', updatedAt: '15 phút trước' },
  // ]);

  const [leadThreads, setLeadThreads] = useState<LeadThread[]>([
    {
      id: "PO1245",
      t: "PO#1245 – Nhận hàng",
      type: "Nội bộ",
      owner: "Lê Chi",
      st: "Đang xử lý",
      at: "2 phút trước",
    },
    {
      id: "CSKH001",
      t: "CSKH – Lên đơn",
      type: "POS",
      owner: "Nguyễn An",
      st: "Chờ phản hồi",
      at: "10 phút trước",
    },
    {
      id: "TEL302",
      t: "Vận Hành Kho - Đổi Trả #302",
      type: "Nội bộ",
      owner: "Trần Bình",
      st: "Đã chốt",
      at: "1 phút trước",
    },
  ]);

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
    if (msg.isStarred) {
      unstarMessageMutation.mutate({ messageId: msg.id });
    } else {
      starMessageMutation.mutate({ messageId: msg.id });
    }
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
  const handleOpenSourceMessage = React.useCallback((messageId: string) => {
    setScrollToMessageId(messageId);
  }, []);

  // Khi scrollToMessageId thay đổi -> cuộn tới tin nhắn tương ứng
  React.useEffect(() => {
    if (!scrollToMessageId) return;

    const el = document.getElementById(`msg-${scrollToMessageId}`);
    if (el) {
      // Cuộn vào giữa màn hình
      el.scrollIntoView({ behavior: "smooth", block: "center" });

      // Thêm highlight giống pinned
      el.classList.add("pinned-highlight");
      window.setTimeout(() => {
        el.classList.remove("pinned-highlight");
      }, 2000);
    }

    // reset để lần sau click lại vẫn trigger được
    setScrollToMessageId(undefined);
  }, [scrollToMessageId]);

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

  const groupMembers: {
    id: string;
    name: string;
    role?: "Leader" | "Member" | undefined;
  }[] = [
    { id: "u_thanh_truc", name: "Thanh Trúc", role: "Leader" },
    { id: "u_thu_an", name: "Thu An" },
    { id: "u_diem_chi", name: "Diễm Chi" },
    { id: "u_le_binh", name: "Lệ Bình" },
  ];

  const createMockTask = (
    id: string,
    title: string,
    status: TaskStatus,
    currentUser: string,
    newOwner?: string
  ): Task => ({
    id,
    groupId: "grp-vanhanh-kho",
    workTypeId: "wt_nhan_hang",
    sourceMessageId: id,
    title,
    description: "",
    assigneeId: newOwner || currentUser,
    assignedById: currentUser,
    status,
    priority: "normal",
    createdAt: nowIso(),
    updatedAt: nowIso(),
    checklist: [],
    history: [],
  });

  // Handlers cập nhật Task (status & checklist)
  const handleChangeTaskStatus = (
    id: string,
    next: "todo" | "in_progress" | "awaiting_review" | "done"
  ) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: next, updatedAt: new Date().toISOString() }
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
        t.workTypeId === workTypeId && t.status === "todo"
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
      status: "in_progress",
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
              createMockTask(id, title || id, "todo", currentUser, newOwner),
            ]
      );
      pushToast(`Đã chuyển ${title || id} → ${newOwner}`, "info");
    } else {
      // nhận lại
      setMyWork((prev) =>
        prev.some((x) => x.id === id)
          ? prev
          : [
              createMockTask(id, title || id, "in_progress", currentUser),
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
          ? { ...t, status: "done", updatedAt: new Date().toISOString() }
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
          : [createMockTask(id, title || id, "todo", currentUser), ...prev]
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
              createMockTask(id, title || id, "todo", currentUser, newOwner),
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
    assigneeId,
    checklistVariantId,
    checklistVariantName,
  }: {
    title: string;
    sourceMessageId?: string;
    assigneeId?: string;
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
      assigneeId: assigneeId ?? currentUserId, // nếu không có thì giao cho currentUser
      assignedById: currentUser,
      workTypeId: selectedWorkTypeId,
      workTypeName: wt?.name,
      checklistVariantId: variantId,
      checklistVariantName: variantName,
      status: "todo",
      checklist: tplItems.map((it) => ({
        id: "chk_" + Math.random().toString(36).slice(2),
        label: it.label,
        done: false,
      })),

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTasks((prev) => [...prev, newTask]);
    setTab("tasks");
    setShowRight(true);

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

    // Nếu assign từ ReceivedInfo → đổi trạng thái
    if (assignSheet.source === "receivedInfo" && assignSheet.info) {
      setReceivedInfos((prev) =>
        prev.map((i) =>
          i.id === assignSheet.info!.id ? { ...i, status: "assigned" } : i
        )
      );
    }

    pushToast("Đã giao công việc.", "success");
  };

  const handleGroupTransferConfirm = ({
    infoId,
    toGroupId,
    workTypeId,
    assigneeId,
    toGroupName,
    toWorkTypeName,
  }: {
    infoId: string;
    toGroupId: string;
    workTypeId: string;
    assigneeId: string;
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
            members={members}
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
            groupMembers={groupMembers}
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
            onReassignTask={undefined} // hoặc implement nếu cần
          />
        ) : (
          <TeamMonitorView
            leadThreads={leadThreads}
            assignOpenId={assignOpenId}
            setAssignOpenId={setAssignOpenId}
            members={members}
            onAssign={handleLeadAssign}
          />
        )}

        <ViewModeSwitcher viewMode={viewMode} setViewMode={setViewMode} />

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
          source={assignSheet.source}
          message={assignSheet.message}
          info={assignSheet.info}
          members={groupMembers}
          checklistVariants={checklistVariants}
          defaultChecklistVariantId={defaultChecklistVariantId}
          onClose={() => setAssignSheet({ open: false })}
          onCreateTask={handleCreateTask}
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
    </div>
  );
}
