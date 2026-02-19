import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { parseVCF } from "../services/vcfParser.js";
import { determineDiplotype } from "../services/starAlleleEngine.js";
import { determinePhenotype } from "../services/phenotypeEngine.js";
import { evaluateDrug } from "../services/drugRuleEngine.js";
import { generateExplanation } from "../services/geminiService.js";
import { buildResponse } from "../utils/jsonBuilder.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function analyzeVCF(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No VCF file uploaded" });
    }

    if (!req.body.drugs) {
      return res.status(400).json({ error: "No drug input provided" });
    }

    const drugs = req.body.drugs.toUpperCase().split(",");
    const variants = parseVCF(req.file.path);

    const results = [];

    // Load drug rules once (faster + cleaner)
    const drugRulesPath = path.join(__dirname, "../data/drugRules.json");
    const drugRules = JSON.parse(fs.readFileSync(drugRulesPath, "utf-8"));

    for (let drug of drugs) {
      drug = drug.trim();

      const drugData = drugRules[drug];
      if (!drugData) {
        console.warn(`Drug rule not found for ${drug}`);
        continue;
      }

      const geneName = drugData.gene;

      // Load gene database safely
      const genePath = path.join(__dirname, `../data/genes/${geneName}.json`);

      if (!fs.existsSync(genePath)) {
        console.warn(`Gene database not found for ${geneName}`);
        continue;
      }

      const geneData = JSON.parse(fs.readFileSync(genePath, "utf-8"));

      const geneVariants = variants.filter((v) => v.gene === geneName);

      const diplotype = determineDiplotype(geneData, geneVariants);
      const phenotype = determinePhenotype(geneData, diplotype);

      const rule = evaluateDrug(drug, phenotype);

      if (!rule) {
        console.warn(`No rule match for ${drug} + ${phenotype}`);
        continue;
      }

      const explanation = await generateExplanation({
        gene: geneName,
        diplotype,
        phenotype,
        drug,
        risk: rule.risk,
      });

      results.push(
        buildResponse({
          patientId: "PATIENT_001",
          drug,
          risk: rule.risk,
          phenotype,
          gene: geneName,
          variants: geneVariants,
          explanation,
          diplotype,
        }),
      );
    }

    // Clean uploaded file
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.json(results);
  } catch (err) {
    console.error("ANALYSIS ERROR:", err);
    return res.status(500).json({ error: "Analysis failed" });
  }
}
