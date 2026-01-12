import React, { useState } from "react";

interface AvatarProps {
  name?: string;
  small?: boolean;
  avatarUrl?: string; // URL from API
}

/**
 * Get first letter from name for fallback avatar
 */
const getInitial = (name: string): string => {
  if (!name) return "U";
  // Remove "DM: " prefix if exists
  const cleanName = name.replace(/^DM:\s*/, "");
  // Get first character, uppercase
  return cleanName.charAt(0).toUpperCase();
};

export const Avatar: React.FC<AvatarProps> = ({
  name = "User",
  small = false,
  avatarUrl,
}) => {
  const [imageError, setImageError] = useState(false);
  const size = small ? "h-5 w-5" : "h-7 w-7";
  const textSize = small ? "text-[10px]" : "text-sm";
  const initial = getInitial(name);

  // If no avatarUrl or image failed to load, show initial
  if (!avatarUrl || imageError) {
    return (
      <div
        className={`${size} rounded-full bg-gradient-to-tr from-brand-500 to-brand-600 shadow-sm grid place-items-center ${textSize} font-semibold text-white`}
        data-testid="avatar-initial"
      >
        {initial}
      </div>
    );
  }

  // Show image avatar
  return (
    <div
      className={`${size} rounded-full overflow-hidden bg-gradient-to-tr from-gray-200 to-gray-300 shadow-sm grid place-items-center`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={avatarUrl}
        alt={name}
        className="h-full w-full object-cover"
        onError={() => setImageError(true)}
        data-testid="avatar-image"
      />
    </div>
  );
};
