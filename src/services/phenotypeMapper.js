export function determinePhenotype(diplotype) {
  if (diplotype.includes("*4/*4")) return "PM";
  if (diplotype.includes("*1/*4")) return "IM";
  if (diplotype.includes("*1/*1")) return "NM";
  return "Unknown";
}