export function readableTextColor(hex: string): "#000000" | "#ffffff" {
  hex = hex.replace(/^#/, "");

  // Expand shorthand hex (#abc → #aabbcc)
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  }

  if (hex.length !== 6) {
    throw new Error("Invalid HEX color.");
  }

  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  // Calculate luminance using YIQ color space formula
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;

  // Return black for light backgrounds, white for dark
  return yiq >= 128 ? "#000000" : "#ffffff";
}
export function invertHex(hex: string): string {
  // Remove `#` if present
  hex = hex.replace(/^#/, "");

  // Convert short form (#abc) to full form (#aabbcc)
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  }

  if (hex.length !== 6) {
    throw new Error("Invalid HEX color.");
  }

  // Invert each RGB component
  const r = (255 - parseInt(hex.slice(0, 2), 16)).toString(16).padStart(2, "0");
  const g = (255 - parseInt(hex.slice(2, 4), 16)).toString(16).padStart(2, "0");
  const b = (255 - parseInt(hex.slice(4, 6), 16)).toString(16).padStart(2, "0");

  return readableTextColor(`#${r}${g}${b}`);
}
