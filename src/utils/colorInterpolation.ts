/**
 * Parses a hex color string into RGB components
 * @param hex - Hex color string (e.g., "#ff0000" or "#f00")
 * @returns RGB object with r, g, b values (0-255)
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  // Remove # if present
  const cleanHex = hex.replace(/^#/, "");

  // Handle shorthand hex (#f00 -> #ff0000)
  const fullHex =
    cleanHex.length === 3
      ? cleanHex
          .split("")
          .map((char) => char + char)
          .join("")
      : cleanHex;

  const r = parseInt(fullHex.substring(0, 2), 16);
  const g = parseInt(fullHex.substring(2, 4), 16);
  const b = parseInt(fullHex.substring(4, 6), 16);

  return { r, g, b };
}

/**
 * Converts RGB components to hex color string
 * @param r - Red component (0-255)
 * @param g - Green component (0-255)
 * @param b - Blue component (0-255)
 * @returns Hex color string
 */
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.round(n).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Interpolates between two hex colors
 * @param color1 - Start color in hex format
 * @param color2 - End color in hex format
 * @param ratio - Interpolation ratio (0 = color1, 1 = color2)
 * @returns Interpolated color in hex format
 */
export function interpolateColor(
  color1: string,
  color2: string,
  ratio: number
): string {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  // Clamp ratio between 0 and 1
  const clampedRatio = Math.max(0, Math.min(1, ratio));

  const r = rgb1.r + (rgb2.r - rgb1.r) * clampedRatio;
  const g = rgb1.g + (rgb2.g - rgb1.g) * clampedRatio;
  const b = rgb1.b + (rgb2.b - rgb1.b) * clampedRatio;

  return rgbToHex(r, g, b);
}

/**
 * Gets a CSS variable value from the document root
 * @param variableName - CSS variable name (with or without --)
 * @returns The variable value or a fallback
 */
export function getCSSVariable(variableName: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;

  const name = variableName.startsWith("--")
    ? variableName
    : `--${variableName}`;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();

  return value || fallback;
}

/**
 * Generates a heatmap color based on count and total
 * @param count - Number of participants available at this time
 * @param total - Total number of participants
 * @returns Hex color string for the heatmap cell
 */
export function getHeatmapColor(count: number, total: number): string {
  // No one available - use empty color
  if (count === 0) {
    return getCSSVariable("timegrid-heatmap-empty", "#f5f5f5");
  }

  // Get gradient endpoints from CSS variables
  const startColor = getCSSVariable("timegrid-heatmap-start", "#e6f2ff");
  const endColor = getCSSVariable("timegrid-heatmap-end", "#1e5ba8");

  // Calculate ratio (1 person = some color, all people = end color)
  const ratio = total > 1 ? count / total : 1;

  return interpolateColor(startColor, endColor, ratio);
}
