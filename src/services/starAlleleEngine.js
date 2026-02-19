import fs from "fs";

export function determineDiplotype(geneData, variants) {
  const detectedStars = [];

  for (const [star, data] of Object.entries(geneData.starAlleles)) {
    const matches = data.variants.every(rs =>
      variants.some(v => v.rsid === rs)
    );

    if (matches) detectedStars.push(star);
  }

  if (detectedStars.length === 0) {
    return "*1/*1";
  }

  if (detectedStars.length === 1) {
    return `${detectedStars[0]}/*1`;
  }

  return `${detectedStars[0]}/${detectedStars[1]}`;
}