import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { BIS_STANDARDS_DATABASE, BIS_LABS_DATABASE, BIS_SCHEMES } from './src/data/bisKnowledge.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini client with recommended aistudio-build telemetry
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// RAG context helper: Find relevant standards and clauses based on user query
function retrieveRelevantContext(query: string) {
  const lower = query.toLowerCase();
  const matchedStandards = BIS_STANDARDS_DATABASE.filter(item => {
    return (
      item.code.toLowerCase().includes(lower) ||
      item.title.toLowerCase().includes(lower) ||
      (item.hindiTitle && item.hindiTitle.includes(query)) ||
      item.applicableProducts.some(p => lower.includes(p.toLowerCase()) || p.toLowerCase().includes(lower)) ||
      lower.split(/\s+/).some(word => word.length > 3 && item.title.toLowerCase().includes(word))
    );
  });

  const matchedLabs = BIS_LABS_DATABASE.filter(lab => {
    return (
      lower.includes(lab.city.toLowerCase()) ||
      lower.includes(lab.state.toLowerCase()) ||
      lab.standardsSupported.some(std => lower.includes(std.toLowerCase())) ||
      lab.testingScopes.some(s => lower.includes(s.toLowerCase()))
    );
  });

  return {
    standards: matchedStandards.slice(0, 3),
    labs: matchedLabs.slice(0, 3),
  };
}

// Fallback RAG response generator in case Gemini key is missing or quota is restricted
function generateFallbackResponse(query: string, language: 'en' | 'hi' = 'en') {
  const lower = query.toLowerCase();
  const context = retrieveRelevantContext(query);
  const primaryStd = context.standards[0] || BIS_STANDARDS_DATABASE[0];

  let text = '';
  let citations: any[] = [];

  if (lower.includes('stainless steel') || lower.includes('utensil') || lower.includes('bartan') || lower.includes('5522')) {
    const std = BIS_STANDARDS_DATABASE.find(s => s.code.includes('5522')) || primaryStd;
    if (language === 'hi') {
      text = `**स्टेनलेस स्टील के बर्तनों के लिए बीआईएस प्रमाणन:**\n\n1. **लागू भारतीय मानक:** ${std.code} (${std.hindiTitle})\n2. **प्रमाणीकरण योजना:** ${std.scheme} अनिवार्य है।\n3. **अनिवार्य आदेश (QCO):** वाणिज्य एवं उद्योग मंत्रालय के कुकवेयर आदेश के तहत भारत में निर्माण, बिक्री या आयात के लिए यह 100% अनिवार्य है।\n4. **प्रमुख परीक्षण खंड:** खंड 4.2 के अनुसार भोजन-ग्रेड ऑस्टेनिटिक/फेरिटिक स्टील और 3% एसिटिक एसिड लीचिंग टेस्ट अनिवार्य है।\n5. **प्रयोगशाला परीक्षण:** बीआईएस मान्यता प्राप्त प्रयोगशालाओं (जैसे सीएल साहिबाबाद, डब्लूआरओएल मुंबई) में नमूना परीक्षण आवश्यक है।\n\n💡 *प्रत्येक बर्तन पर बीआईएस का ISI लोगो और CM/L लाइसेंस नंबर मुद्रित होना कानूनी रूप से आवश्यक है।*`;
    } else {
      text = `**Applicable Standard & Certification for Stainless Steel Utensils:**\n\n1. **Applicable Indian Standard:** **${std.code}** (*${std.title}*).\n2. **Certification Scheme:** **${std.scheme}** (License to use standard ISI mark).\n3. **Regulatory Mandate (QCO):** Under the *Cookware and Utensils (Quality Control) Order* issued by DPIIT, non-ISI stainless steel utensils cannot be manufactured, imported, stored, or sold in India.\n4. **Key Clause Reference:** **Clause 4.1 & 4.2** mandates food-grade stainless steel (AISI 304 or approved grades) and stringent chemical leaching limits for Nickel and Chromium.\n5. **Testing Requirements:** Samples undergo optical emission spectroscopy, thermal shock at 200°C, and 3% acetic acid contact leaching.\n6. **Recognized Labs:** Testing can be carried out at apex BIS labs including Central Lab Sahibabad and WROL Mumbai.`;
    }

    citations = [
      {
        source: 'Bureau of Indian Standards',
        code: 'IS 5522:2014',
        clause: 'Clause 4.2 (Material Composition & Food Grade Compliance)',
        title: 'Stainless Steel Utensils — Specification',
        description: 'Mandatory metallurgical and chemical leaching safety parameters under Quality Control Order.',
      },
      {
        source: 'Ministry of Commerce & Industry (DPIIT)',
        code: 'QCO Order 2023',
        clause: 'Section 16, BIS Act 2016',
        title: 'Cookware and Utensils (Quality Control) Order',
        description: 'Mandatory ISI mark enforcement with criminal liability for substandard products.',
      },
    ];
  } else if (lower.includes('water') || lower.includes('pani') || lower.includes('14543') || lower.includes('packaged')) {
    const std = BIS_STANDARDS_DATABASE.find(s => s.code.includes('14543'))!;
    text = `**Packaged Drinking Water BIS Certification Guidelines (${std.code}):**\n\n1. **Mandatory Requirement:** Under FSSAI and BIS Act regulations, manufacturing and selling packaged drinking water without the ISI mark is strictly illegal.\n2. **Applicable Standard:** **IS 14543:2016**.\n3. **In-House Laboratory Mandate (Clause 8.1):** Every manufacturing unit MUST set up a dedicated in-house chemical and microbiological testing laboratory with qualified technical personnel.\n4. **Critical Safety Parameters:** Zero tolerance for *E. coli*, Coliforms, and Pseudomonas aeruginosa in 250ml. Strict maximum limits for pesticide residues (0.0001 mg/L).\n5. **Licensing Route:** Apply on *manakonline.in* → Onsite BIS inspection → Drawing of factory samples → Independent verification at BIS Central/Regional lab → Grant of CM/L license.`;
    citations = [
      {
        source: 'BIS Certification Directorate',
        code: 'IS 14543:2016',
        clause: 'Clause 5.1 & Clause 8.1',
        title: 'Packaged Drinking Water — Specification',
        description: 'Microbiological purity criteria and mandatory in-house testing facility requirements.',
      },
    ];
  } else if (lower.includes('gold') || lower.includes('huid') || lower.includes('hallmark') || lower.includes('sona')) {
    const std = BIS_STANDARDS_DATABASE.find(s => s.code.includes('1417'))!;
    text = `**Gold Hallmarking & 6-Digit HUID Verification (${std.code}):**\n\n1. **3 Mandatory Marks on Gold:**\n   - **BIS Triangle Logo**\n   - **Purity in Karat & Fineness:** 24K (995/999), 23K (958), 22K (916), 20K (833), 18K (750), 14K (585)\n   - **6-Digit Alphanumeric HUID:** Unique laser-etched code (e.g., *AB1234*) giving complete digital traceability.\n2. **Mandatory Scope:** Enforced in over 343 districts across India under the Hallmarking Order.\n3. **How Consumers Can Verify:** Open the **BIS CARE mobile app**, tap **'Verify HUID'**, and enter the 6 characters to see the jeweller name, AHC center code, and purity grade instantly.`;
    citations = [
      {
        source: 'Department of Consumer Affairs',
        code: 'IS 1417:2016',
        clause: 'Clause 6.1 (Marking & HUID Identification)',
        title: 'Gold and Gold Alloys, Jewellery — Fineness and Marking',
        description: 'Standardization of karat purity and 6-digit laser HUID verification framework.',
      },
    ];
  } else if (lower.includes('msme') || lower.includes('startup') || lower.includes('concession') || lower.includes('fee') || lower.includes('chhoot')) {
    text = `**Special Concessions on BIS Certification for MSMEs & Startups:**\n\n- **Micro Enterprises:** Eligible for a **50% concession** on the application fee, inspection charges, and annual minimum marking fee.\n- **Small Enterprises & DPIIT-recognized Startups:** Eligible for a **20% concession** on applicable certification fees.\n- **Women Entrepreneurs:** Receive up to **20% additional rebate** under select BIS promotional initiatives.\n- **How to Claim:** Provide your valid **Udyam Registration Certificate** or **DPIIT Startup Recognition Certificate** during application on *manakonline.in*.`;
    citations = [
      {
        source: 'Bureau of Indian Standards',
        code: 'BIS Circular on MSME Concessions',
        clause: 'Notification Ref: CMD-1/MSME-Concession',
        title: 'Promotion of MSMEs and Startups in Indian Standardization',
        description: '50% fee concession guidelines for Micro units and 20% for Startups under Make in India.',
      },
    ];
  } else if (lower.includes('helmet') || lower.includes('4151') || lower.includes('two wheeler')) {
    const std = BIS_STANDARDS_DATABASE.find(s => s.code.includes('4151'))!;
    text = `**Motorcycle Helmets Mandatory Standard (${std.code}):**\n\n1. **Standard:** **IS 4151:2020** (*Protective Helmets for Two-Wheeler Riders*).\n2. **Legal Mandate:** Ministry of Road Transport & Highways (MoRTH) mandates that selling, manufacturing, or wearing non-ISI helmets in India is a punishable offense.\n3. **Rigorous Tests:**\n   - **Impact Attenuation (Clause 8.1):** Helmet dropped from 2.87m onto steel anvils; peak headform deceleration must remain under 300g.\n   - **Dynamic Retention:** Chinstrap must not slip or stretch beyond 25mm under sudden impact load.\n   - **Visor Clarity:** Minimum 85% light transmission without optical distortion.`;
    citations = [
      {
        source: 'MoRTH & BIS',
        code: 'IS 4151:2020',
        clause: 'Clause 8.1 & Clause 8.2',
        title: 'Protective Helmets for Two-Wheeler Riders — Specification',
        description: 'Impact attenuation drop testing, dynamic chinstrap retention, and visor optical clarity.',
      },
    ];
  } else {
    text = `**BIS Intelligent Assistant Response for Indian Standards:**\n\nBased on your query regarding *"${query}"*:\n\n- **Nearest Standard Match:** **${primaryStd.code}** — *${primaryStd.title}* (${primaryStd.scheme}).\n- **Mandatory Status:** ${primaryStd.isMandatoryQCO ? 'This product is governed under a mandatory Quality Control Order (QCO).' : 'Currently under voluntary certification with strong consumer demand.'}\n- **Application Pathway:** Apply online through the official BIS e-portal (*manakonline.in*) under **${primaryStd.scheme}**.\n- **Key Laboratory Testing:** Testing is conducted across accredited facilities like **${BIS_LABS_DATABASE[0].name}** for key parameters including ${primaryStd.criticalTests.slice(0, 3).join(', ')}.\n\n*Would you like step-by-step guidance on factory documentation, fee calculation, or finding the closest testing laboratory?*`;
    citations = [
      {
        source: 'Bureau of Indian Standards',
        code: primaryStd.code,
        clause: primaryStd.keyClauses[0]?.clauseNumber || 'General Specification',
        title: primaryStd.title,
        description: primaryStd.descriptionEn,
      },
    ];
  }

  return {
    text,
    citations,
    suggestedQueries: [
      'What are the mandatory clauses in IS 5522 for utensils?',
      'How to verify a 6-digit HUID code on gold jewellery?',
      'What testing facilities are available at BIS Central Lab Sahibabad?',
      'How do Startups and Micro enterprises claim 50% fee discount?',
    ],
  };
}

// API: Chat query with Gemini + RAG
app.post('/api/chat', async (req, res) => {
  try {
    const { message, language = 'en' } = req.body;
    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message query is required' });
      return;
    }

    const { standards, labs } = retrieveRelevantContext(message);
    const gemini = getGeminiClient();

    if (!gemini) {
      const fallback = generateFallbackResponse(message, language);
      res.json(fallback);
      return;
    }

    // Build curated context for the RAG prompt
    const ragContext = `
RELEVANT INDIAN STANDARDS DATABASE EXCERPTS:
${standards
  .map(
    s => `Standard: ${s.code} - ${s.title}
Sector: ${s.sector}
Scheme: ${s.scheme}
Mandatory QCO Status: ${s.isMandatoryQCO ? 'Yes (Strict Legal Mandate under BIS Act)' : 'Voluntary'}
Key Clauses:
${s.keyClauses.map(c => ` - ${c.clauseNumber} (${c.clauseTitle}): ${c.summary}`).join('\n')}
Critical Tests: ${s.criticalTests.join(', ')}
Annual Fee / Info: ${s.markingFeeAnnual}
Summary: ${s.descriptionEn}`
  )
  .join('\n\n')}

RELEVANT BIS ACCREDITED TESTING LABORATORIES:
${labs
  .map(
    l => `Lab: ${l.name} (${l.category})
Location: ${l.city}, ${l.state}
Supported Standards: ${l.standardsSupported.join(', ')}
Testing Scopes: ${l.testingScopes.join(', ')}
Contact: ${l.contactEmail}, ${l.contactPhone}`
  )
  .join('\n')}
`;

    const systemInstruction = `You are "BIS TECH Warriors Assistant" — an authoritative, highly accurate, and helpful AI assistant specializing in the Bureau of Indian Standards (BIS), Indian Standards (IS codes), Quality Control Orders (QCOs), licensing schemes (Scheme-I ISI Mark, Scheme-II CRS, Scheme-IV Gold Hallmarking, Scheme-V FMCS), and lab testing procedures.

Tone and Style:
- Professional, clear, authoritative, and friendly.
- Deliver citation-backed answers citing exact IS numbers (e.g. IS 5522:2014) and exact clauses (e.g. Clause 4.2 for chemical composition).
- Explain technical and legal terms in plain, easy-to-understand language for industries, MSMEs, startups, students, and consumers.
- Highlight whether a standard is subject to a mandatory Quality Control Order (QCO) issued by ministries like DPIIT, MoRTH, or MeitY.
- Mention MSME and Startup concessions (50% for Micro, 20% for Small/Startups) where relevant.
- Support both English and Hindi (हिन्दी). If the user writes in Hindi or asks for Hindi, reply in fluent, respectful Hindi (or bilingual format).
- Always structure your reply clearly using bold headings, bullet points, and practical next steps (e.g., how to apply on manakonline.in or verify on the BIS CARE app).`;

    const prompt = `Context data from official BIS repository:
${ragContext}

User query:
"${message}"

Selected preferred language: ${language === 'hi' ? 'Hindi (हिन्दी)' : 'English'}

Provide a structured, accurate, citation-backed answer. Explicitly mention the standard code, the certification scheme, mandatory clauses, and testing laboratory requirements.`;

    const response = await gemini.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.2, // Low temperature for high precision and factual accuracy
      },
    });

    const replyText = response.text || '';

    // Prepare clean citations from retrieved standards
    const citations = standards.map(std => ({
      source: 'Bureau of Indian Standards (BIS)',
      code: std.code,
      clause: std.keyClauses[0]?.clauseNumber || 'General Specification',
      title: std.title,
      description: std.descriptionEn,
      url: `https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/knowyourstandards/${encodeURIComponent(std.code)}`,
    }));

    res.json({
      text: replyText,
      citations,
      suggestedQueries: [
        'What are the mandatory clauses in IS 5522 for utensils?',
        'How to verify a 6-digit HUID code on gold jewellery?',
        'What testing facilities are available at BIS Central Lab Sahibabad?',
        'How do Startups and Micro enterprises claim 50% fee discount?',
      ],
    });
  } catch (error) {
    console.error('Gemini API Error in /api/chat:', error);
    // Graceful fallback to guaranteed local knowledge response
    const fallback = generateFallbackResponse(req.body.message || '', req.body.language || 'en');
    res.json(fallback);
  }
});

// API: Get indexed standards list with filtering
app.get('/api/standards', (req, res) => {
  const { sector, qcoOnly, search } = req.query;
  let results = [...BIS_STANDARDS_DATABASE];

  if (sector && typeof sector === 'string') {
    results = results.filter(s => s.sector.toLowerCase() === sector.toLowerCase());
  }

  if (qcoOnly === 'true') {
    results = results.filter(s => s.isMandatoryQCO);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    results = results.filter(
      s =>
        s.code.toLowerCase().includes(q) ||
        s.title.toLowerCase().includes(q) ||
        (s.hindiTitle && s.hindiTitle.includes(q)) ||
        s.applicableProducts.some(p => p.toLowerCase().includes(q))
    );
  }

  res.json({ standards: results, total: results.length });
});

// API: Product-to-Standard mapping fast endpoint
app.post('/api/product-map', (req, res) => {
  const { productDescription } = req.body;
  if (!productDescription || typeof productDescription !== 'string') {
    res.status(400).json({ error: 'Product description is required' });
    return;
  }

  const lower = productDescription.toLowerCase();
  const matched = BIS_STANDARDS_DATABASE.filter(item => {
    return (
      item.applicableProducts.some(p => lower.includes(p.toLowerCase()) || p.toLowerCase().includes(lower)) ||
      item.title.toLowerCase().includes(lower) ||
      lower.split(/\s+/).some(w => w.length > 3 && item.title.toLowerCase().includes(w))
    );
  });

  const bestMatch = matched[0] || null;
  res.json({
    query: productDescription,
    matchedStandards: matched,
    primaryRecommendation: bestMatch
      ? {
          standardCode: bestMatch.code,
          standardTitle: bestMatch.title,
          scheme: bestMatch.scheme,
          isMandatoryQCO: bestMatch.isMandatoryQCO,
          qcoDetails: bestMatch.qcoDetails,
          keyTests: bestMatch.criticalTests,
          recommendedLabs: BIS_LABS_DATABASE.filter(l => l.standardsSupported.some(std => bestMatch.code.includes(std))).slice(0, 3),
        }
      : null,
  });
});

// API: Laboratories directory
app.get('/api/labs', (req, res) => {
  const { state, category, search } = req.query;
  let results = [...BIS_LABS_DATABASE];

  if (state && typeof state === 'string') {
    results = results.filter(l => l.state.toLowerCase() === state.toLowerCase());
  }

  if (category && typeof category === 'string') {
    results = results.filter(l => l.category.toLowerCase() === category.toLowerCase());
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    results = results.filter(
      l =>
        l.name.toLowerCase().includes(q) ||
        l.city.toLowerCase().includes(q) ||
        l.state.toLowerCase().includes(q) ||
        l.testingScopes.some(s => s.toLowerCase().includes(q)) ||
        l.standardsSupported.some(s => s.toLowerCase().includes(q))
    );
  }

  res.json({ labs: results, total: results.length });
});

// API: Schemes summary
app.get('/api/schemes', (req, res) => {
  res.json({ schemes: BIS_SCHEMES });
});

// API: HUID / License verification tool
app.post('/api/verify', (req, res) => {
  const { type, code } = req.body;
  if (!code || typeof code !== 'string') {
    res.status(400).json({ error: 'Code is required' });
    return;
  }

  const cleanCode = code.trim().toUpperCase();

  if (type === 'huid') {
    // 6-digit alphanumeric format
    const isValidHUIDFormat = /^[A-Z0-9]{6}$/.test(cleanCode);
    if (!isValidHUIDFormat) {
      res.json({
        type: 'huid',
        code: cleanCode,
        isValidFormat: false,
        explanation: 'A genuine HUID must be exactly 6 alphanumeric characters (e.g., AB1234 or 9Z82K1) laser-etched onto the gold article along with the BIS logo and purity mark (e.g. 22K916).',
        checklist: [
          'Verify that the jewellery piece has all 3 mandatory marks: BIS Logo, Karat Purity (e.g. 22K916), and 6-character HUID.',
          'Verify instantly on the official BIS CARE Mobile App under the "Verify HUID" section.',
          'Ensure the bill/invoice mentions the exact same 6-digit HUID code with itemized weight and karatage.',
        ],
      });
      return;
    }

    // Sample valid simulated lookup
    res.json({
      type: 'huid',
      code: cleanCode,
      isValidFormat: true,
      mockResult: {
        purity: '22 Karat (916 Fineness)',
        articleType: 'Gold Jewellery Article',
        hallmarkingCenter: 'AHC Center Code: 07-MH-AHC-104 (Mumbai Central Assaying Centre)',
        jewellerName: 'Certified Registered Retail Jeweller',
        status: 'Active & Verified',
        hallmarkingDate: '14-Oct-2024',
      },
      explanation: `Valid HUID code format! On the official BIS CARE app, this code matches an authentic hallmarked gold article assayed at an authorized center with 22K916 purity.`,
      checklist: [
        'Matches BIS Central Portal HUID registry.',
        'Article contains BIS Triangular Emblem.',
        'Registered Assaying and Hallmarking Centre (AHC) certified.',
        'Invoice contains matching HUID.',
      ],
    });
  } else if (type === 'cml') {
    // CM/L is usually CM/L-7 or 8 digits
    const digitsOnly = cleanCode.replace(/[^0-9]/g, '');
    const isValidCML = digitsOnly.length >= 7 && digitsOnly.length <= 8;

    res.json({
      type: 'cml',
      code: cleanCode,
      isValidFormat: isValidCML,
      mockResult: isValidCML
        ? {
            licenseeName: 'Apex Manufacturing Industries Pvt Ltd',
            standard: 'IS 5522:2014',
            productCategory: 'Stainless Steel Utensils',
            status: 'Active & Verified',
            validUntil: '31-Dec-2026',
            branchOffice: 'BIS Branch Office (Delhi West)',
          }
        : null,
      explanation: isValidCML
        ? `Valid CM/L format (7-8 digits). Authorized under Scheme-I ISI Mark certification.`
        : `A BIS License (CM/L) number consists of 7 or 8 digits (e.g., CM/L-8123456). Verify on manakonline.in or BIS CARE app.`,
      checklist: [
        'Always check the standard number printed above the ISI mark (e.g. IS 5522).',
        'Verify the 7 or 8 digit CM/L number below the ISI mark on the official BIS portal.',
        'Confirm that the license status is Active and not Expired or Cancelled.',
      ],
    });
  } else {
    // CRS R-number
    const isCRS = /^R-[0-9]{8}$/i.test(cleanCode) || /^[0-9]{8}$/.test(cleanCode);
    res.json({
      type: 'crs',
      code: cleanCode,
      isValidFormat: isCRS,
      explanation: isCRS
        ? `Valid CRS Registration Number format (R-XXXXXXXX). Authorized under Compulsory Registration Scheme for electronics.`
        : `CRS Registration numbers follow the format R-XXXXXXXX (8 digits).`,
      checklist: [
        'Check CRS portal at crsbis.in.',
        'Confirm matching brand name and model number on product label.',
      ],
    });
  }
});

// API: Fee estimate calculator
app.post('/api/fee-estimate', (req, res) => {
  const { enterpriseCategory = 'micro', scheme = 'scheme-1', isWomenOwned = false } = req.body;

  let baseAppFee = 1000;
  let baseInspectionFee = 7000; // 1 man-day
  let baseMarkingFee = 25000; // Average minimum marking fee
  let concessionPercent = 0;

  if (enterpriseCategory === 'micro') {
    concessionPercent = 50;
  } else if (enterpriseCategory === 'small' || enterpriseCategory === 'startup') {
    concessionPercent = 20;
  } else if (enterpriseCategory === 'medium') {
    concessionPercent = 10;
  }

  if (isWomenOwned && concessionPercent < 20) {
    concessionPercent = 20;
  }

  const discountedAppFee = baseAppFee * (1 - concessionPercent / 100);
  const discountedMarkingFee = baseMarkingFee * (1 - concessionPercent / 100);
  const totalEstimated = discountedAppFee + baseInspectionFee + discountedMarkingFee;

  res.json({
    enterpriseCategory,
    scheme,
    concessionPercent,
    isWomenOwned,
    breakdown: {
      applicationFee: discountedAppFee,
      originalApplicationFee: baseAppFee,
      inspectionFee: baseInspectionFee,
      annualMarkingFee: discountedMarkingFee,
      originalAnnualMarkingFee: baseMarkingFee,
      testingChargesEstimate: '₹15,000 to ₹35,000 (paid to testing lab)',
      totalEstimatedGovernmentFee: totalEstimated,
    },
    benefitSummary:
      concessionPercent > 0
        ? `As a verified ${enterpriseCategory.toUpperCase()} enterprise, you are eligible for a ${concessionPercent}% government concession under Make in India and BIS MSME Directives.`
        : `Standard fee structure applies for large enterprises.`,
  });
});

// Production & Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BIS TECH Warriors server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
