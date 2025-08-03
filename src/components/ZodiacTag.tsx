import { getZodiacSign, getElementColor, type ZodiacInfo } from "@/lib/zodiac";

interface ZodiacTagProps {
  birthdate: string;
  size?: "small" | "medium" | "large";
  showElement?: boolean;
  className?: string;
}

export default function ZodiacTag({ 
  birthdate, 
  size = "medium", 
  showElement = false,
  className = ""
}: ZodiacTagProps) {
  const zodiacInfo = getZodiacSign(birthdate);
  const elementColor = getElementColor(zodiacInfo.element);

  const sizeStyles = {
    small: {
      fontSize: "10px",
      padding: "2px 6px",
      borderRadius: "8px",
      gap: "2px"
    },
    medium: {
      fontSize: "12px",
      padding: "4px 8px",
      borderRadius: "10px",
      gap: "3px"
    },
    large: {
      fontSize: "14px",
      padding: "6px 12px",
      borderRadius: "12px",
      gap: "4px"
    }
  };

  const currentSize = sizeStyles[size];

  return (
    <div
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(135deg, ${elementColor}20, ${elementColor}10)`,
        border: `1px solid ${elementColor}40`,
        color: elementColor,
        fontWeight: 600,
        fontSize: currentSize.fontSize,
        padding: currentSize.padding,
        borderRadius: currentSize.borderRadius,
        gap: currentSize.gap,
        transition: "all 0.2s ease",
        cursor: "default",
        userSelect: "none",
        backdropFilter: "blur(4px)",
        boxShadow: `0 1px 3px ${elementColor}20`
      }}
      title={`${zodiacInfo.sign} (${zodiacInfo.dates})`}
    >
      <span style={{ fontSize: "1.1em" }}>{zodiacInfo.emoji}</span>
      <span>{zodiacInfo.sign}</span>
    </div>
  );
} 