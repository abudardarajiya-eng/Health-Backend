export const DRUG_GENE_MAP = {
  CODEINE: "CYP2D6",
  CLOPIDOGREL: "CYP2C19",
  WARFARIN: "CYP2C9",
  SIMVASTATIN: "SLCO1B1",
  AZATHIOPRINE: "TPMT",
  FLUOROURACIL: "DPYD"
};

export const RISK_RULES = {
  CODEINE: {
    PM: "Ineffective",
    IM: "Adjust Dosage",
    NM: "Safe",
    URM: "Toxic"
  },
  CLOPIDOGREL: {
    PM: "Ineffective",
    IM: "Adjust Dosage",
    NM: "Safe"
  },
  WARFARIN: {
    PM: "Toxic",
    IM: "Adjust Dosage",
    NM: "Safe"
  },
  SIMVASTATIN: {
    PM: "Toxic",
    NM: "Safe"
  },
  AZATHIOPRINE: {
    PM: "Toxic",
    IM: "Adjust Dosage",
    NM: "Safe"
  },
  FLUOROURACIL: {
    PM: "Toxic",
    IM: "Adjust Dosage",
    NM: "Safe"
  }
};

export function assessRisk(drug, phenotype) {
  return RISK_RULES[drug]?.[phenotype] || "Unknown";
}