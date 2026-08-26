import { Router } from "express";

const router = Router();

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}

router.get("/api/planning/health", (_req, res) => {
  res.json({
    success: true,
    message: "planning service ready",
    services: {
      simulation: "available",
      aiCopilot: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
    },
  });
});

router.post("/api/simulation/run", async (req, res) => {
  try {
    const input = req.body ?? {};
    const patientAge = Number(input.patientAge ?? 65);
    const diagnosis = String(input.diagnosis ?? "glenohumeral osteoarthritis");
    const scanQuality = String(input.scanQuality ?? "Good");
    const initialSuccess = Number(input.successRate ?? 88);

    const severityBoost = /oa|osteo|arthritis|cuff|avn|fracture|instability|degenerative/i.test(diagnosis) ? 1 : 0;
    const lowQualityPenalty = scanQuality.toLowerCase() === "poor" ? 10 : scanQuality.toLowerCase() === "fair" ? 5 : 0;

    const boneQuality = clamp(Number(input.boneQuality ?? 78), 0, 100);
    const cuffIntegrity = clamp(Number(input.rotatorCuffIntegrity ?? 65), 0, 100);
    const cartilageCondition = clamp(Number(input.cartilageCondition ?? 45), 0, 100);
    const jointAlignment = clamp(Number(input.jointAlignment ?? 82), 0, 100);

    const biomechanicalStability = clamp(
      0.34 * boneQuality + 0.3 * jointAlignment + 0.24 * cartilageCondition + 0.12 * cuffIntegrity,
      0,
      100,
    );

    const predictedRom = clamp(
      Number(input.romPredicted ?? 140) + (jointAlignment >= 70 ? 8 : -10) - (severityBoost ? 8 : 0),
      0,
      180,
    );

    const aiScore = clamp(
      0.35 * boneQuality + 0.25 * cuffIntegrity + 0.25 * jointAlignment + 0.15 * cartilageCondition,
      0,
      100,
    );

    const successRate = clamp(
      (initialSuccess + biomechanicalStability + (100 - lowQualityPenalty)) / 2 - lowQualityPenalty * 0.15,
      0,
      98,
    );

    const revisionRisk = clamp(
      (100 - successRate) * 0.26 + (severityBoost ? 3 : 1) + (patientAge > 75 ? 2.5 : 0),
      0,
      34,
    );

    const implants = [
      {
        name: "Anatomic Total Shoulder Arthroplasty",
        score: 91,
        description: "Best fit when glenoid morphology is favorable and cuff integrity is preserved.",
      },
      {
        name: "Reverse Total Shoulder Arthroplasty",
        score: 88,
        description: "Preferred when cuff integrity is low and glenoid version is unstable.",
      },
      {
        name: "Stemless Humeral Resurfacing",
        score: 75,
        description: "Useful for limited humeral bone loss and lower-demand patients.",
      },
    ];

    const cuffPressureFactor = cuffIntegrity < 50 ? 1 : 0;
    const implantName = cuffPressureFactor === 1 || /cuff|rupture|arthropathy/i.test(diagnosis)
      ? "Reverse Total Shoulder Arthroplasty"
      : "Anatomic Total Shoulder Arthroplasty";

    const recommendedImplant = implants.find((item) => item.name === implantName)?.name ?? implants[0].name;

    const output = {
      success: true,
      mode: "clinical-sim",
      data: {
        predictedImplant: recommendedImplant,
        predictedImplantSize: `${Math.round(28 + biomechanicalStability / 5)}mm glenoid / ${Math.round(40 + predictedRom / 5)}mm humeral head`,
        recommendedApproach: cuffPressureFactor === 1 ? "Deltopectoral RSA planning" : "Deltopectoral TSA planning",
        aiScore: round(aiScore),
        successRate: round(successRate),
        revisionRisk: round(revisionRisk),
        predictedRom: round(predictedRom),
        riskLevel: revisionRisk > 18 ? "High" : revisionRisk > 7 ? "Moderate" : "Low",
        stabilityIndex: round(biomechanicalStability),
        stressIndex: round(clamp(100 - biomechanicalStability * 0.9 + lowQualityPenalty, 0, 100)),
        wearRisk: round(clamp((100 - cartilageCondition) * 0.45 + (100 - cuffIntegrity) * 0.18, 0, 80)),
        collisionRisk: round(clamp((100 - jointAlignment) * 0.5 + (100 - cuffIntegrity) * 0.2, 0, 90)),
        reasoning: [
          `Biomechanical stability estimate is ${round(biomechanicalStability)} out of 100.`,
          `Cuff integrity and cartilage condition are the dominant agreement indicators for implant selection.`,
          `Clinical plan should include templating, balancing, and post-op rehab planning.`,
        ],
      },
    };

    return res.status(200).json(output);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ success: false, message });
  }
});

router.post("/api/ai/copilot", async (req, res) => {
  try {
    const prompt = String(req.body?.prompt ?? "Generate a pre-op shoulder planning summary");
    const model = String(process.env.OLLAMA_MODEL ?? "llama3.1");
    const ollamaBaseUrl = String(process.env.OLLAMA_BASE_URL ?? "http://localhost:11434");

    const systemPrompt = `You are a constrained clinical planning copilot for shoulder arthroplasty. Provide safe, non-diagnostic, non-operational guidance. Use concise bullet points.`;

    const response = await fetch(`${ollamaBaseUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        prompt: `${systemPrompt}\n\nClinical question: ${prompt}`,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama call failed with ${response.status}`);
    }

    const data = (await response.json()) as { response?: string };

    return res.json({
      success: true,
      mode: "ollama",
      response: data.response ?? "Ollama returned an empty response.",
    });
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    const fallback = {
      success: true,
      mode: "fallback",
      response: `Clinical planning assistant summary:\n- Review patient imaging quality and pathology pattern.\n- Confirm cuff integrity, glenoid version, and cartilage status.\n- Compare implant options with the selected anatomy and risk profile.\n- Produce a surgical plan that includes ROM targets and rehab path.`,
      diagnostics: {
        ollamaStatus: "unavailable",
        reason,
      },
    };

    return res.status(200).json(fallback);
  }
});

export default router;
