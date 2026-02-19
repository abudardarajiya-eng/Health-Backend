import fs from "fs";

export function parseVCF(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const variants = [];

  for (let line of lines) {
    if (!line.startsWith("#") && line.trim() !== "") {
      const cols = line.split("\t");
      const info = cols[7] || "";

      const gene = info.match(/GENE=([^;]+)/)?.[1];
      const star = info.match(/STAR=([^;]+)/)?.[1];
      const rsid = cols[2];

      if (gene) {
        variants.push({
          gene,
          star: star || "Unknown",
          rsid
        });
      }
    }
  }

  return variants;
}