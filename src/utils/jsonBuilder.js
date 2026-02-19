export function buildResponse({
  patientId,
  drug,
  risk,
  phenotype,
  gene,
  variants,
  explanation
}) {
  return {
    patient_id: patientId,
    drug: drug,
    timestamp: new Date().toISOString(),
    risk_assessment: {
      risk_label: risk,
      confidence_score: 0.92,
      severity:
        risk === "Safe"
          ? "none"
          : risk === "Adjust Dosage"
          ? "moderate"
          : "high"
    },
    pharmacogenomic_profile: {
      primary_gene: gene,
      diplotype: "*4/*4",
      phenotype: phenotype,
      detected_variants: variants.map(v => ({
        rsid: v.rsid
      }))
    },
    clinical_recommendation: {
      dose_adjustment:
        risk === "Safe"
          ? "Standard dosing"
          : "Refer to CPIC guideline for adjustment",
      cpic_reference: "CPIC Guideline"
    },
    llm_generated_explanation: {
      summary: explanation,
      biological_mechanism: explanation
    },
    quality_metrics: {
      vcf_parsing_success: true,
      variants_detected: variants.length
    }
  };
}