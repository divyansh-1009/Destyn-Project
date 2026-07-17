// Zodiac sign calculation utility
export interface ZodiacInfo {
  sign: string;
  element: string;
  emoji: string;
  dates: string;
}

export function getZodiacSign(birthdate: string): ZodiacInfo {
  const date = new Date(birthdate);
  const month = date.getMonth() + 1; // getMonth() returns 0-11
  const day = date.getDate();

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) {
    return {
      sign: "Aries",
      element: "Fire",
      emoji: "♈",
      dates: "Mar 21 - Apr 19"
    };
  } else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) {
    return {
      sign: "Taurus",
      element: "Earth",
      emoji: "♉",
      dates: "Apr 20 - May 20"
    };
  } else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) {
    return {
      sign: "Gemini",
      element: "Air",
      emoji: "♊",
      dates: "May 21 - Jun 20"
    };
  } else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) {
    return {
      sign: "Cancer",
      element: "Water",
      emoji: "♋",
      dates: "Jun 21 - Jul 22"
    };
  } else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) {
    return {
      sign: "Leo",
      element: "Fire",
      emoji: "♌",
      dates: "Jul 23 - Aug 22"
    };
  } else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) {
    return {
      sign: "Virgo",
      element: "Earth",
      emoji: "♍",
      dates: "Aug 23 - Sep 22"
    };
  } else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) {
    return {
      sign: "Libra",
      element: "Air",
      emoji: "♎",
      dates: "Sep 23 - Oct 22"
    };
  } else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) {
    return {
      sign: "Scorpio",
      element: "Water",
      emoji: "♏",
      dates: "Oct 23 - Nov 21"
    };
  } else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) {
    return {
      sign: "Sagittarius",
      element: "Fire",
      emoji: "♐",
      dates: "Nov 22 - Dec 21"
    };
  } else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
    return {
      sign: "Capricorn",
      element: "Earth",
      emoji: "♑",
      dates: "Dec 22 - Jan 19"
    };
  } else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) {
    return {
      sign: "Aquarius",
      element: "Air",
      emoji: "♒",
      dates: "Jan 20 - Feb 18"
    };
  } else {
    return {
      sign: "Pisces",
      element: "Water",
      emoji: "♓",
      dates: "Feb 19 - Mar 20"
    };
  }
}

// Get zodiac compatibility (simplified)
export function getZodiacCompatibility(sign1: string, sign2: string): string {
  const fireSigns = ["Aries", "Leo", "Sagittarius"];
  const earthSigns = ["Taurus", "Virgo", "Capricorn"];
  const airSigns = ["Gemini", "Libra", "Aquarius"];
  const waterSigns = ["Cancer", "Scorpio", "Pisces"];

  const getElement = (sign: string) => {
    if (fireSigns.includes(sign)) return "Fire";
    if (earthSigns.includes(sign)) return "Earth";
    if (airSigns.includes(sign)) return "Air";
    if (waterSigns.includes(sign)) return "Water";
    return "Unknown";
  };

  const element1 = getElement(sign1);
  const element2 = getElement(sign2);

  if (element1 === element2) {
    return "Highly Compatible";
  } else if (
    (element1 === "Fire" && element2 === "Air") ||
    (element1 === "Air" && element2 === "Fire") ||
    (element1 === "Earth" && element2 === "Water") ||
    (element1 === "Water" && element2 === "Earth")
  ) {
    return "Compatible";
  } else if (
    (element1 === "Fire" && element2 === "Water") ||
    (element1 === "Water" && element2 === "Fire") ||
    (element1 === "Earth" && element2 === "Air") ||
    (element1 === "Air" && element2 === "Earth")
  ) {
    return "Challenging";
  }

  return "Neutral";
}

// Get element color for styling
export function getElementColor(element: string): string {
  switch (element) {
    case "Fire":
      return "#ff6b6b"; // Red
    case "Earth":
      return "#51cf66"; // Green
    case "Air":
      return "#74c0fc"; // Blue
    case "Water":
      return "#748ffc"; // Purple
    default:
      return "#868e96"; // Gray
  }
} 