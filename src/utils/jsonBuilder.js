export function buildResponse({
  patientId,
  drug,
  risk,
  phenotype,
  gene,
  variants,
  explanation,
  diplotype
}) {
  // ---------------------------
  // Severity Mapping
  // ---------------------------
  const severityMap = {
    "Safe": "none",
    "Adjust Dosage": "moderate",
    "Toxic": "critical",
    "Ineffective": "high",
    "Unknown": "low"
  };

  const severity = severityMap[risk] || "low";

  // ---------------------------
  // Confidence Score Logic
  // ---------------------------
  let confidenceScore = 0.5;

  if (variants.length === 0) {
    confidenceScore = 0.4;
  } else if (phenotype === "Unknown") {
    confidenceScore = 0.6;
  } else if (risk === "Safe") {
    confidenceScore = 0.95;
  } else {
    confidenceScore = 0.9;
  }

  // ---------------------------
  // CPIC Reference Mapping
  // ---------------------------
  const cpicReferences = {
    "CODEINE": "CPIC Guideline for CYP2D6 and Opioids",
    "WARFARIN": "CPIC Guideline for CYP2C9 and VKORC1",
    "CLOPIDOGREL": "CPIC Guideline for CYP2C19",
    "SIMVASTATIN": "CPIC Guideline for SLCO1B1",
    "AZATHIOPRINE": "CPIC Guideline for TPMT",
    "FLUOROURACIL": "CPIC Guideline for DPYD"
  };

  const cpicReference = cpicReferences[drug] || "CPIC Pharmacogenomic Guideline";

  // ---------------------------
  // Dose Recommendation Logic
  // ---------------------------
  let doseRecommendation = "Refer to CPIC guideline";

  if (risk === "Safe") {
    doseRecommendation = "Standard dosing recommended";
  } else if (risk === "Adjust Dosage") {
    doseRecommendation = "Dose reduction or alternative dosing recommended";
  } else if (risk === "Toxic") {
    doseRecommendation = "Avoid drug or select alternative therapy";
  } else if (risk === "Ineffective") {
    doseRecommendation = "Consider alternative therapy";
  }

  return {
    patient_id: patientId,
    drug: drug,
    timestamp: new Date().toISOString(),

    risk_assessment: {
      risk_label: risk,
      confidence_score: confidenceScore,
      severity: severity
    },

    pharmacogenomic_profile: {
      primary_gene: gene,
      diplotype: diplotype,
      phenotype: phenotype,
      detected_variants: variants.map(v => ({
        rsid: v.rsid,
        chromosome: v.chrom,
        position: v.pos,
        genotype: v.genotype
      }))
    },

    clinical_recommendation: {
      dose_adjustment: doseRecommendation,
      cpic_reference: cpicReference
    },

    llm_generated_explanation: {
      summary: explanation.summary || explanation,
      biological_mechanism: explanation.mechanism || explanation,
      clinical_impact: explanation.impact || explanation
    },

    quality_metrics: {
      vcf_parsing_success: true,
      variants_detected: variants.length,
      gene_match_found: variants.length > 0,
      rule_match_found: risk !== "Unknown"
    }
  };
}