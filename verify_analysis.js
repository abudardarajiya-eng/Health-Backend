import { analyzeVCF } from "./src/controllers/analysisController.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// We won't mock Gemini directly if it's causing issues. 
// Instead, let's just use the fallback in geminiService.js if the API key is missing.
// Or we can try to mock it by modifying the file temporarily if we really need to.
// But the previous run showed it was hitting CPIC logic before the Gemini call.

const mockReq = {
  file: {
    path: path.join(__dirname, "test.vcf")
  },
  body: {
    drugs: "CLOPIDOGREL,SIMVASTATIN,AZATHIOPRINE,FLUOROURACIL"
  }
};

const mockRes = {
  status: function(s) {
    this.statusCode = s;
    console.log("STATUS:", s);
    return this;
  },
  json: function(data) {
    console.log("--- FINAL RESULTS ---");
    if (Array.isArray(data)) {
        data.forEach(result => {
          console.log(`Drug: ${result.drug}, Gene: ${result.pharmacogenomic_profile.primary_gene}, Risk: ${result.risk_assessment.risk_label}`);
        });
    } else {
        console.log("ERROR RESPONSE:", JSON.stringify(data, null, 2));
    }
    console.log("---------------------");
  }
};

// Create a dummy file for unlinking
if (!fs.existsSync(mockReq.file.path)) {
    fs.writeFileSync(mockReq.file.path, "chr1\t123\trs4244285\tG\tA\t.\tPASS\tGENE=CYP2C19;STAR=*2\n");
}
fs.copyFileSync(mockReq.file.path, mockReq.file.path + ".tmp");
mockReq.file.path = mockReq.file.path + ".tmp";

console.log("Starting analysis verification...");
try {
    await analyzeVCF(mockReq, mockRes);
    console.log("Verification finished.");
} catch (err) {
    console.error("CRITICAL ERROR during verification:");
    console.error(err);
    process.exit(1);
}
