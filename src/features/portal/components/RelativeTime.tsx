import { useEffect, useState } from "react";
import { formatRelativeTime } from "@/utils/formatRelativeTime";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface RelativeTimeProps {
  timestamp: string | Date;
  className?: string;
}

/**
 * Component hiển thị relative time với auto-update mỗi 60s
 *
 * Features:
 * - Auto-update mỗi 60s
 * - Tooltip hiển thị full timestamp khi hover
 *
 * @example
 * ```tsx
 * <RelativeTime timestamp="2026-01-07T10:00:00Z" />
 * ```
 */
export default function RelativeTime({
  timestamp,
  className,
}: RelativeTimeProps) {
  const [relativeText, setRelativeText] = useState(() =>
    formatRelativeTime(timestamp)
  );

  const fullTimestamp = format(
    typeof timestamp === "string" ? new Date(timestamp) : timestamp,
    "dd/MM/yyyy HH:mm",
    { locale: vi }
  );

  // Update immediately when timestamp prop changes
  useEffect(() => {
    setRelativeText(formatRelativeTime(timestamp));
  }, [timestamp]);

  // Auto-update every 60s
  useEffect(() => {
    const interval = setInterval(() => {
      setRelativeText(formatRelativeTime(timestamp));
    }, 60000); // 60s

    return () => clearInterval(interval);
  }, [timestamp]);

  return (
    <time
      dateTime={
        typeof timestamp === "string" ? timestamp : timestamp.toISOString()
      }
      title={fullTimestamp}
      className={className}
      data-testid="relative-time"
    >
      {relativeText}
    </time>
  );
}
