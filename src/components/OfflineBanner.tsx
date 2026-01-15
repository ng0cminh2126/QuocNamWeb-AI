import { WifiOff, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";

interface OfflineBannerProps {
  isOnline: boolean;
  wasOffline: boolean;
}

/**
 * Banner hiển thị trạng thái mạng
 *
 * States:
 * - Offline (isOnline=false): Orange warning banner with WifiOff icon
 * - Recovery (isOnline=true, wasOffline=true): Green success banner with Wifi icon
 * - Normal (isOnline=true, wasOffline=false): No banner (returns null)
 *
 * @param isOnline - Current online status from useNetworkStatus
 * @param wasOffline - True if just recovered from offline (shows for 3s)
 */
export function OfflineBanner({ isOnline, wasOffline }: OfflineBannerProps) {
  // Normal state - no banner
  if (isOnline && !wasOffline) {
    return null;
  }

  // Offline state - orange warning
  if (!isOnline) {
    return (
      <div
        data-testid="offline-banner"
        className={cn(
          "flex items-center gap-2 px-4 py-2 mb-3",
          "bg-orange-50 border border-orange-200 rounded-lg",
          "text-orange-800"
        )}
      >
        <WifiOff className="h-4 w-4 flex-shrink-0" />
        <p className="text-sm font-medium">
          Không có kết nối mạng. Vui lòng kiểm tra kết nối của bạn.
        </p>
      </div>
    );
  }

  // Recovery state - green success (wasOffline=true, isOnline=true)
  return (
    <div
      data-testid="online-banner"
      className={cn(
        "flex items-center gap-2 px-4 py-2 mb-3",
        "bg-green-50 border border-green-200 rounded-lg",
        "text-green-800"
      )}
    >
      <Wifi className="h-4 w-4 flex-shrink-0" />
      <p className="text-sm font-medium">Đã kết nối lại mạng</p>
    </div>
  );
}
