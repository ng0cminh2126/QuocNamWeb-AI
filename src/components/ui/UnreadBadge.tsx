import { cn } from "@/lib/utils";

interface UnreadBadgeProps {
  count: number;
  className?: string;
}

/**
 * Badge hiển thị số lượng tin nhắn chưa đọc
 *
 * @example
 * ```tsx
 * <UnreadBadge count={5} />
 * <UnreadBadge count={123} /> // Hiển thị "99+"
 * ```
 */
export default function UnreadBadge({ count, className }: UnreadBadgeProps) {
  if (count <= 0) return null;

  const displayCount = count > 99 ? "99+" : count.toString();

  return (
    <span
      className={cn(
        "bg-brand-600 px-1.5 text-[10px] font-semibold text-white rounded-full",
        className
      )}
      data-testid="unread-badge"
      aria-label={`${count} tin nhắn chưa đọc`}
    >
      {displayCount}
    </span>
  );
}
