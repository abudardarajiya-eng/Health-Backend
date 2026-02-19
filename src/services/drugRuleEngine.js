import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const drugRulesPath = path.join(__dirname, "../data/drugRules.json");
const drugRules = JSON.parse(fs.readFileSync(drugRulesPath, "utf-8"));

export function evaluateDrug(drug, phenotype) {
  const rule = drugRules[drug];
  if (!rule) return null;

  const result = rule.rules[phenotype];
  if (!result) return null;

  return result;
}