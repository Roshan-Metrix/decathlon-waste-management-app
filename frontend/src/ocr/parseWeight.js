export function parseWeight(input) {
  if (typeof input === "number") return input;

  if (!input) return null;

  const match = input.toString().match(/\d+\.?\d*/);
  return match ? parseFloat(match[0]) : null;
}

export function formatWeight(weight, unit = "kg") {
  if (weight == null) return "N/A";
  return `${weight.toFixed(2)} ${unit}`;
}
