import { Loader2, RefreshCw, AlertCircle, Check } from "lucide-react";

export type MessageStatus = "sending" | "retrying" | "failed" | "sent";

interface MessageStatusIndicatorProps {
  status: MessageStatus;
  retryCount?: number;
  maxRetries?: number;
  errorMessage?: string;
  timestamp?: string;
}

/**
 * Component hiển thị trạng thái gửi tin nhắn
 *
 * States:
 * - sending: "Đang gửi..." với Loader2 icon (white/80)
 * - retrying: "Thử lại 2/3..." với RefreshCw icon (orange-400)
 * - failed: Error message với AlertCircle icon (red-600)
 * - sent: Timestamp với Check icon (white/60)
 *
 * @param status - Current message send status
 * @param retryCount - Current retry attempt number (for retrying state)
 * @param maxRetries - Maximum retry attempts (for retrying state)
 * @param errorMessage - Error message to display (for failed state)
 * @param timestamp - Formatted timestamp (for sent state)
 */
export function MessageStatusIndicator({
  status,
  retryCount,
  maxRetries = 3,
  errorMessage,
  timestamp,
}: MessageStatusIndicatorProps) {
  if (status === "sending") {
    return (
      <div className="flex items-center gap-1 text-xs text-white/80">
        <Loader2
          className="h-3 w-3 animate-spin"
          data-testid="status-icon-sending"
        />
        <span>Đang gửi...</span>
      </div>
    );
  }

  if (status === "retrying") {
    return (
      <div className="flex items-center gap-1 text-xs text-orange-400">
        <RefreshCw
          className="h-3 w-3 animate-spin"
          data-testid="status-icon-retrying"
        />
        <span>
          Thử lại {retryCount}/{maxRetries}...
        </span>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="flex items-center gap-1 text-xs text-red-600">
        <AlertCircle className="h-3 w-3" data-testid="status-icon-failed" />
        <span>{errorMessage || "Gửi thất bại"}</span>
      </div>
    );
  }

  if (status === "sent" && timestamp) {
    return <span className="text-xs text-white/60">{timestamp}</span>;
  }

  return null;
}
