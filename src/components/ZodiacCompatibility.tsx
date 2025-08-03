import { getZodiacSign, getZodiacCompatibility, getElementColor } from "@/lib/zodiac";

interface ZodiacCompatibilityProps {
  userBirthdate: string;
  otherBirthdate: string;
  size?: "small" | "medium" | "large";
  showDetails?: boolean;
}

export default function ZodiacCompatibility({ 
  userBirthdate, 
  otherBirthdate, 
  size = "medium",
  showDetails = false 
}: ZodiacCompatibilityProps) {
  const userZodiac = getZodiacSign(userBirthdate);
  const otherZodiac = getZodiacSign(otherBirthdate);
  const compatibility = getZodiacCompatibility(userZodiac.sign, otherZodiac.sign);
  
  const getCompatibilityColor = (compatibility: string) => {
    switch (compatibility) {
      case "Highly Compatible":
        return "#51cf66"; // Green
      case "Compatible":
        return "#74c0fc"; // Blue
      case "Challenging":
        return "#ff6b6b"; // Red
      default:
        return "#868e96"; // Gray
    }
  };

  const sizeStyles = {
    small: {
      fontSize: "10px",
      padding: "2px 6px",
      borderRadius: "8px"
    },
    medium: {
      fontSize: "12px",
      padding: "4px 8px",
      borderRadius: "10px"
    },
    large: {
      fontSize: "14px",
      padding: "6px 12px",
      borderRadius: "12px"
    }
  };

  const currentSize = sizeStyles[size];
  const compatibilityColor = getCompatibilityColor(compatibility);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        <span style={{ fontSize: "1.2em" }}>{userZodiac.emoji}</span>
        <span style={{ fontSize: "0.8em", opacity: 0.7 }}>+</span>
        <span style={{ fontSize: "1.2em" }}>{otherZodiac.emoji}</span>
      </div>
      <div
        style={{
          background: `linear-gradient(135deg, ${compatibilityColor}20, ${compatibilityColor}10)`,
          border: `1px solid ${compatibilityColor}40`,
          color: compatibilityColor,
          fontWeight: 600,
          fontSize: currentSize.fontSize,
          padding: currentSize.padding,
          borderRadius: currentSize.borderRadius,
          transition: "all 0.2s ease",
          cursor: "default",
          userSelect: "none"
        }}
      >
        {compatibility}
      </div>
      {showDetails && (
        <div style={{ 
          fontSize: "0.8em", 
          opacity: 0.7, 
          marginTop: "4px",
          width: "100%"
        }}>
          {userZodiac.element} + {otherZodiac.element}
        </div>
      )}
    </div>
  );
} 