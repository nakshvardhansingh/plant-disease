# Plant Disease Detector — Next.js + Google Gemini 2.5 Flash

Production-ready AI plant pathology app built with **Next.js App Router**, **Tailwind CSS**, and **Google Gemini 2.5 Flash multimodal API**.

Upload a leaf image → Gemini analyzes disease → structured JSON report with treatment, organic & chemical solutions, prevention.

## ✨ Features

- 🎨 Premium SaaS UI (Apple / OpenAI style) — white, emerald, lime, glassmorphism
- 📸 Drag & drop upload (jpg, png, webp, 10MB)
- 🤖 Gemini 2.5 Flash integration with structured JSON output (`responseMimeType: application/json` + `responseSchema`)
- 🔒 API key never exposed to browser — only used in server route (`GEMINI_API_KEY`)
- 📊 Structured JSON report cards (plant, disease, confidence, severity, symptoms, causes, treatments, etc.)
- ⚡ Loading animations, toast alerts, robust error handling
- 📱 Fully responsive
- 🧱 Future-ready: easy to add auth, history, PDF export, camera, i18n

## Tech Stack

- Next.js 14 (App Router, JavaScript only)
- Tailwind CSS
- React Hooks
- Next.js API Routes
- Google Gemini API (`gemini-2.5-flash`)

## Project Structure

```
app/
├── api/
│   └── detect/
│       └── route.js       # Secure backend — talks to Gemini
├── components/
│   ├── Navbar.js
│   ├── Footer.js
│   ├── UploadCard.js
│   ├── PreviewImage.js
│   ├── LoadingAnimation.js
│   └── ReportCard.js
├── globals.css
├── layout.js
└── page.js                # Hero + detector
public/
.env.local                # GEMINI_API_KEY=xxx
```

## Setup

1. Install:
```bash
npm install
```

2. Add your Gemini API key:
```bash
# .env.local
GEMINI_API_KEY=your_api_key_here
```
Get key from https://aistudio.google.com/app/apikey (free tier available)

3. Run dev:
```bash
npm run dev
```
Open http://localhost:3000

## Gemini Vision API — Implementation

We implement according to current docs (https://ai.google.dev/gemini-api/docs/vision):

**Endpoint:**
```
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=GEMINI_API_KEY
```

**Request:**
```js
{
  contents: [{
    role: "user",
    parts: [
      { text: SYSTEM_PROMPT }, // asks for structured JSON
      { inline_data: { mime_type: "image/jpeg", data: "<base64>" } }
    ]
  }],
  generationConfig: {
    temperature: 0.2,
    maxOutputTokens: 2048,
    responseMimeType: "application/json",
    responseSchema: {
      type: "object",
      properties: {
        plant_name: { type: "string" },
        disease: { type: "string" },
        confidence: { type: "string" },
        severity: { type: "string" },
        symptoms: { type: "array", items: { type: "string" } },
        possible_causes: { type: "array", items: { type: "string" } },
        recommended_treatment: { type: "array", items: { type: "string" } },
        prevention: { type: "array", items: { type: "string" } },
        organic_solution: { type: "array", items: { type: "string" } },
        chemical_solution: { type: "array", items: { type: "string" } },
        additional_notes: { type: "string" }
      },
      required: [...]
    }
  },
  safetySettings: [...]
}
```

**Response parsing:**
Extract `candidates[0].content.parts[0].text` → `JSON.parse`

The API key is **never** sent to the client. It's read only in `app/api/detect/route.js` server side.

## Prompt Sent to Gemini

The system prompt instructs Gemini to:
- Identify plant species
- Detect disease, pests, deficiency
- Estimate confidence and severity
- List symptoms, causes, treatments (organic + chemical), prevention
- Handle healthy/uncertain/low-quality images gracefully
- Return **pure JSON only** matching schema

## API Response Format (Frontend expects)

```json
{
  "plant_name": "Tomato",
  "disease": "Early Blight",
  "confidence": "95%",
  "severity": "Moderate",
  "symptoms": ["..."],
  "possible_causes": ["..."],
  "recommended_treatment": ["..."],
  "prevention": ["..."],
  "organic_solution": ["..."],
  "chemical_solution": ["..."],
  "additional_notes": "..."
}
```

## Error Handling

- No image, unsupported format, file too large
- Missing/invalid API key (401), rate limit (429), safety block, bad request
- Empty AI response, invalid JSON
- Network/timeout
- Friendly toasts + inline alerts

## Future Extensions

- Add NextAuth + Prisma for history
- PDF export: `jspdf` + report data
- Camera: `navigator.mediaDevices.getUserMedia`
- Multiple uploads
- Multilingual via `next-intl`

## Deploy

Vercel recommended — add `GEMINI_API_KEY` in Environment Variables.

```bash
npm run build
npm start
```

## License

MIT — built for education & farming use. Not a substitute for lab testing.
