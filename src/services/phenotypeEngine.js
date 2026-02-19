export function determinePhenotype(geneData, diplotype) {
  const stars = diplotype.split("/");

  const score =
    geneData.activityScore[
      geneData.starAlleles[stars[0]]?.function || "normal"
    ] +
    geneData.activityScore[
      geneData.starAlleles[stars[1]]?.function || "normal"
    ];

  for (const rule of geneData.phenotypeRules) {
    if (score >= rule.minScore && score <= rule.maxScore) {
      return rule.phenotype;
    }
  }

  return "Unknown";
}