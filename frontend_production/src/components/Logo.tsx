// src/components/Logo.tsx
import { Building2 } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showText?: boolean;
  textcolor?: string;
  iconColor?: string;
}

const Logo = ({
  size = "md",
  className = "",
  showText = true,
  textcolor,
  iconColor,
}: LogoProps) => {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  const textSizes = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`flex items-center justify-center rounded-lg ${iconColor ? "" : "text-primary"}`}>
        <Building2
          className={sizeClasses[size]}
          style={iconColor ? { color: iconColor } : {}}
        />
      </div>

      {showText && (
        <span
          className={`font-bold tracking-tight ${textSizes[size]} ${textcolor ? "" : "text-primary"}`}
          style={textcolor ? { color: textcolor } : {}}
        >
          DecentRent
        </span>
      )}
    </div>
  );
};

export default Logo;
