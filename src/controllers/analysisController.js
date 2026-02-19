import fs from "fs";
import { parseVCF } from "../services/vcfParser.js";
import { determinePhenotype } from "../services/phenotypeMapper.js";
import { DRUG_GENE_MAP, assessRisk } from "../services/riskEngine.js";
import { generateExplanation } from "../services/geminiService.js";
import { buildResponse } from "../utils/jsonBuilder.js";

export async function analyzeVCF(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "VCF file required" });
    }
    console.log("📁 Received file:", req.file.originalname);
    const drugs = req.body.drugs?.toUpperCase().split(",") || [];

    const variants = parseVCF(req.file.path);

    const results = [];

    for (let drug of drugs) {
      const gene = DRUG_GENE_MAP[drug];
      if (!gene) {
        console.warn(`⚠️ No gene mapping found for drug: ${drug}`);
        continue;
      }

      const geneVariants = variants.filter(v => v.gene === gene);

      const diplotype = "*4/*4"; // Simplified for hackathon
      const phenotype = determinePhenotype(diplotype);
      const risk = assessRisk(drug, phenotype);

      console.log(`🔬 Analyzing ${drug}...`);
      const explanation = await generateExplanation({
        gene,
        diplotype,
        phenotype,
        drug,
        risk
      });

      const response = buildResponse({
        patientId: "PATIENT_001",
        drug,
        risk,
        phenotype,
        gene,
        variants: geneVariants,
        explanation
      });

      results.push(response);
    }

    fs.unlinkSync(req.file.path);

    console.log(`✅ Analysis complete for ${results.length} drug(s)`);
    res.json(results);

  } catch (error) {
    console.error("❌ Analysis Error:", error.message);
    console.error("Full error:", error);
    
    // Provide more specific error messages
    if (error.message.includes("fetch")) {
      return res.status(503).json({ 
        error: "API service unavailable. Check network connectivity and API key." 
      });
    }
    
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
}