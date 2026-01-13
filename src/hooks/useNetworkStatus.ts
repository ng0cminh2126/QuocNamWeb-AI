import { useState, useEffect } from "react";

/**
 * Hook để detect online/offline network status
 *
 * Features:
 * - Monitors navigator.onLine API
 * - Listens to 'online' and 'offline' events
 * - Tracks wasOffline flag for recovery message (auto-reset after 3s)
 *
 * @returns {Object} Network status
 * @returns {boolean} isOnline - Current online status
 * @returns {boolean} wasOffline - True if just recovered from offline (for 3s)
 *
 * @example
 * const { isOnline, wasOffline } = useNetworkStatus();
 *
 * if (!isOnline) {
 *   return <OfflineBanner />;
 * }
 *
 * if (wasOffline) {
 *   toast.success('Đã kết nối lại mạng');
 * }
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(() => navigator.onLine);
  const [wasOffline, setWasOffline] = useState<boolean>(false);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    const handleOnline = () => {
      setIsOnline(true);
      setWasOffline(true);

      // Reset wasOffline after 3 seconds
      timer = setTimeout(() => {
        setWasOffline(false);
      }, 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, []);

  return {
    isOnline,
    wasOffline,
  };
}
