export const stats = [
  { value: "97.8%", label: "Prediction Accuracy", description: "AI model validated across 50K+ surgical cases" },
  { value: "<2min", label: "Simulation Speed", description: "Full biomechanical analysis per implant configuration" },
  { value: "50,000+", label: "Cases Trained", description: "Real-world surgical outcomes in training dataset" },
  { value: "400+", label: "Implant Models", description: "From all major orthopedic manufacturers worldwide" },
];

export const modules = [
  {
    number: "01",
    title: "3D Shoulder Digitization",
    description: "Converts DICOM CT/MRI scans into precise 3D bone models using AI-driven segmentation with sub-millimeter accuracy.",
    features: ["DICOM import", "AI segmentation", "Mesh refinement", "Bone density mapping", "Landmark detection"],
    icon: "Scan",
  },
  {
    number: "02",
    title: "Biomechanical Simulation Engine",
    description: "Physics-based finite element analysis simulates real forces, torques, and load distributions across the glenohumeral joint.",
    features: ["FEA solver", "Muscle force modeling", "Dynamic load cases", "Fatigue analysis", "Contact mechanics"],
    icon: "Cpu",
  },
  {
    number: "03",
    title: "AI/ML Prediction Layer",
    description: "Trained on 50,000+ surgical outcomes, our ensemble model predicts implant performance, failure risk, and range of motion.",
    features: ["Outcome prediction", "Risk scoring", "Ensemble models", "Transfer learning", "Continuous retraining"],
    icon: "Brain",
  },
  {
    number: "04",
    title: "Implant Testing Sandbox",
    description: "Virtual environment for testing any implant from our library against a patient-specific bone model before OR entry.",
    features: ["400+ implants", "Size optimization", "Impingement detection", "Wear simulation", "Comparative analysis"],
    icon: "FlaskConical",
  },
  {
    number: "05",
    title: "Surgical Planning Interface",
    description: "Surgeon-facing dashboard for reviewing simulation results, adjusting surgical approach, and generating PDF reports.",
    features: ["3D visualization", "Approach planning", "PDF export", "PACS integration", "Team collaboration"],
    icon: "Stethoscope",
  },
];

export const workflowSteps = [
  { step: 1, title: "Upload Scan", description: "DICOM CT/MRI via secure portal", icon: "Upload" },
  { step: 2, title: "AI Segmentation", description: "Automated bone model generation", icon: "Brain" },
  { step: 3, title: "Select Implant", description: "Choose from 400+ verified models", icon: "Package" },
  { step: 4, title: "Run Simulation", description: "FEA + AI prediction in <2 min", icon: "Play" },
  { step: 5, title: "AI Report", description: "Full recommendation with confidence scores", icon: "FileText" },
];

export const implants = [
  {
    id: 1,
    name: "Tornier Aequalis Revers",
    type: "Reverse Shoulder",
    manufacturer: "Tornier",
    size: "Medium",
    compatScore: 94,
    material: "CoCrMo / UHMWPE",
    catalogRef: "AEQ-REV-M",
  },
  {
    id: 2,
    name: "DePuy Global Anchor",
    type: "Total Shoulder",
    manufacturer: "DePuy Synthes",
    size: "Large",
    compatScore: 89,
    material: "Ti-6Al-4V / UHMWPE",
    catalogRef: "GLB-ANC-L",
  },
  {
    id: 3,
    name: "Zimmer Bigliani/Flatow",
    type: "Total Shoulder",
    manufacturer: "Zimmer Biomet",
    size: "Small",
    compatScore: 82,
    material: "CoCrMo / XLPE",
    catalogRef: "ZBF-TOT-S",
  },
  {
    id: 4,
    name: "Arthrex Univers Revers",
    type: "Reverse Shoulder",
    manufacturer: "Arthrex",
    size: "Medium",
    compatScore: 91,
    material: "Ti-6Al-4V / UHMWPE",
    catalogRef: "ART-UNI-M",
  },
  {
    id: 5,
    name: "Smith+Nephew ARROW Ream&Run",
    type: "Partial",
    manufacturer: "Smith+Nephew",
    size: "Large",
    compatScore: 77,
    material: "Ti-6Al-4V",
    catalogRef: "SN-ARR-L",
  },
  {
    id: 6,
    name: "Exactech Equinoxe Stemless",
    type: "Total Shoulder",
    manufacturer: "Exactech",
    size: "Small",
    compatScore: 86,
    material: "CoCrMo / UHMWPE",
    catalogRef: "EXA-STL-S",
  },
  {
    id: 7,
    name: "DePuy Pinnacle Reverse",
    type: "Reverse Shoulder",
    manufacturer: "DePuy Synthes",
    size: "Medium",
    compatScore: 88,
    material: "CoCrMo / UHMWPE",
    catalogRef: "DEP-PIN-M",
  },
  {
    id: 8,
    name: "Zimmer Comprehensive",
    type: "Total Shoulder",
    manufacturer: "Zimmer Biomet",
    size: "Large",
    compatScore: 79,
    material: "Ti-6Al-4V / XLPE",
    catalogRef: "ZBC-COM-L",
  },
  {
    id: 9,
    name: "Tornier Simpliciti Stemless",
    type: "Total Shoulder",
    manufacturer: "Tornier",
    size: "Small",
    compatScore: 85,
    material: "Ti-6Al-4V / UHMWPE",
    catalogRef: "TOR-SIM-S",
  },
  {
    id: 10,
    name: "Arthrex Sidus Stemless",
    type: "Total Shoulder",
    manufacturer: "Arthrex",
    size: "Medium",
    compatScore: 90,
    material: "Ti-6Al-4V / XLPE",
    catalogRef: "ART-SID-M",
  },
  {
    id: 11,
    name: "Smith+Nephew Nottingham",
    type: "Partial",
    manufacturer: "Smith+Nephew",
    size: "Small",
    compatScore: 74,
    material: "CoCrMo",
    catalogRef: "SN-NOT-S",
  },
  {
    id: 12,
    name: "Exactech Equinoxe Platform",
    type: "Reverse Shoulder",
    manufacturer: "Exactech",
    size: "Large",
    compatScore: 83,
    material: "Ti-6Al-4V / UHMWPE",
    catalogRef: "EXA-EQP-L",
  },
];

export const testimonials = [
  {
    name: "Dr. Sarah Okonkwo",
    role: "Orthopedic Surgeon, Mayo Clinic",
    quote: "ShoulderSim cut my pre-op planning time by 40%. The confidence scores genuinely inform my implant selection — this is not just visualization, it's decision support.",
    specialty: "Shoulder & Elbow Reconstruction",
  },
  {
    name: "Dr. Marcus Lindqvist",
    role: "Chief of Orthopedics, Karolinska University Hospital",
    quote: "We've reduced revision surgery rates by 22% in our cohort since adopting ShoulderSim. The biomechanical fidelity is unlike anything else on the market.",
    specialty: "Complex Revision Surgery",
  },
  {
    name: "Dr. Priya Mehta",
    role: "Sports Medicine Surgeon, HSS New York",
    quote: "The AR/VR planning integration is transformative for resident training. My fellows arrive in the OR with a mental map of the case — the simulation is that accurate.",
    specialty: "Sports Medicine & Trauma",
  },
];

export const caseStudies = [
  {
    scanId: "SSM-2024-0441",
    patient: "67yo Male, Grade IV Glenohumeral Arthritis",
    implant: "Tornier Aequalis Revers, Size M",
    confidence: 94.2,
    outcome: "Successful",
    rom: "165° flexion, 55° ER",
    followUp: "12-month follow-up: ASES score 86/100",
  },
  {
    scanId: "SSM-2024-0388",
    patient: "54yo Female, Rotator Cuff Tear Arthropathy",
    implant: "Arthrex Univers Revers, Size M",
    confidence: 91.7,
    outcome: "Successful",
    rom: "158° flexion, 48° ER",
    followUp: "6-month follow-up: VAS pain 1/10",
  },
  {
    scanId: "SSM-2024-0312",
    patient: "71yo Male, Post-fracture Malunion",
    implant: "DePuy Global Anchor, Size L",
    confidence: 87.4,
    outcome: "Successful",
    rom: "142° flexion, 40° ER",
    followUp: "18-month follow-up: Full ADL return",
  },
];

export const pricingFeatures = [
  { feature: "AI Simulation Runs", hospital: "Unlimited", manufacturer: "Unlimited", academic: "500/year" },
  { feature: "Implant Library Access", hospital: "Full (400+)", manufacturer: "Full (400+)", academic: "Limited (100)" },
  { feature: "3D Shoulder Digitization", hospital: true, manufacturer: true, academic: true },
  { feature: "Biomechanical Simulation Engine", hospital: true, manufacturer: true, academic: true },
  { feature: "AI Outcome Prediction", hospital: true, manufacturer: true, academic: true },
  { feature: "Surgical Planning Reports (PDF)", hospital: true, manufacturer: true, academic: true },
  { feature: "Custom Implant Testing", hospital: false, manufacturer: true, academic: false },
  { feature: "Regulatory Documentation Export", hospital: false, manufacturer: true, academic: false },
  { feature: "Wear & Tear Simulation", hospital: false, manufacturer: true, academic: true },
  { feature: "API / PACS Integration", hospital: true, manufacturer: true, academic: false },
  { feature: "Team Collaboration Seats", hospital: "Up to 5", manufacturer: "Unlimited", academic: "Up to 3" },
  { feature: "24/7 Priority Support", hospital: true, manufacturer: true, academic: false },
  { feature: "Dedicated Account Manager", hospital: false, manufacturer: true, academic: false },
];

export const faqs = [
  {
    q: "Is ShoulderSim AI cleared for clinical use?",
    a: "ShoulderSim AI holds FDA 510(k) clearance as a surgical planning software tool. It is classified as a Class II medical device under 21 CFR 892.2050. All outputs are intended to support, not replace, clinical judgment.",
  },
  {
    q: "What imaging formats does the platform accept?",
    a: "We accept all standard DICOM formats from CT and MRI scanners. Minimum CT slice thickness of 1.5mm is recommended for optimal segmentation accuracy. MRI T1/T2 sequences are supported.",
  },
  {
    q: "How is patient data protected?",
    a: "All data is encrypted at rest (AES-256) and in transit (TLS 1.3). The platform is HIPAA and GDPR compliant. Patient identifiers are de-identified at upload. We are SOC 2 Type II certified.",
  },
  {
    q: "Can we test our own proprietary implant designs?",
    a: "Yes — the Manufacturer tier includes our Custom Implant Upload module, which accepts STL/STEP files and integrates them into the simulation engine within 24 hours of submission.",
  },
  {
    q: "What is the implementation timeline for a hospital?",
    a: "Typical deployment is 2-4 weeks including PACS integration, IT security review, and clinical staff training. A dedicated implementation engineer is assigned to every hospital deployment.",
  },
  {
    q: "Does ShoulderSim integrate with existing PACS/EMR systems?",
    a: "Yes. We provide HL7 FHIR and DICOM WADO-RS integrations out of the box. Custom EMR connectors are available for Epic, Cerner, and Meditech at no additional cost on Hospital and Manufacturer tiers.",
  },
];

export const simulationImplants = [
  { id: "tornier-aequalis", name: "Tornier Aequalis Revers M", type: "Reverse Shoulder" },
  { id: "depuy-global", name: "DePuy Global Anchor L", type: "Total Shoulder" },
  { id: "arthrex-univers", name: "Arthrex Univers Revers M", type: "Reverse Shoulder" },
  { id: "zimmer-comprehensive", name: "Zimmer Comprehensive L", type: "Total Shoulder" },
  { id: "exactech-equinoxe", name: "Exactech Equinoxe Stemless S", type: "Total Shoulder" },
  { id: "smith-arrow", name: "Smith+Nephew ARROW Ream&Run L", type: "Partial" },
];

export const simulationResults = {
  implants: [
    { name: "Tornier Aequalis Revers", score: 94.2, stressMax: 48.2, rom: "165° / 55° / 44°" },
    { name: "Arthrex Univers Revers", score: 87.6, stressMax: 61.4, rom: "158° / 48° / 38°" },
    { name: "DePuy Global Anchor", score: 78.9, stressMax: 74.1, rom: "142° / 40° / 32°" },
  ],
  recommendation: {
    implant: "Tornier Aequalis Revers",
    size: "Medium",
    approach: "Deltopectoral, Posterior Capsulotomy",
    confidence: 94.2,
    rationale: "Highest confidence score (94.2%) with lowest maximum von Mises stress (48.2 MPa). Optimal glenoid coverage for the patient's bone morphology. Predicted 12-month ASES score: 84-89.",
  },
};
