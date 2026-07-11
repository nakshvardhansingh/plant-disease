import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

const MAX_SIZE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_MIMES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

// Ultra-compact prompt to save tokens and avoid truncation
const SYSTEM_PROMPT = `Plant pathologist. Analyze leaf image. Return ONLY JSON.

Required JSON keys:
plant_name, disease, confidence, severity, symptoms[2-3], possible_causes[2], recommended_treatment[2-3], prevention[2], organic_solution[2], chemical_solution[2], additional_notes (1 sentence)

Example:
{"plant_name":"Potato","disease":"Early Blight","confidence":"90%","severity":"Moderate","symptoms":["brown spots with rings","yellowing around lesions"],"possible_causes":["Alternaria solani fungus","leaf wetness"],"recommended_treatment":["remove affected leaves","improve air circulation"],"prevention":["crop rotation","avoid overhead watering"],"organic_solution":["neem oil spray","copper fungicide"],"chemical_solution":["chlorothalonil","mancozeb - follow label"],"additional_notes":"Keep leaves dry, monitor daily."}

If healthy -> disease=Healthy, severity=Healthy. If unsure -> Unknown. Keep arrays short (max 3 items). Be concise.`;

function extractJsonFromText(text) {
  if (!text) return null;
  // Direct
  try { return JSON.parse(text); } catch {}
  // Code fence
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenceMatch) { try { return JSON.parse(fenceMatch[1].trim()); } catch {} }
  // First { last }
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const candidate = text.slice(firstBrace, lastBrace + 1);
    try { return JSON.parse(candidate); } catch {}
    // Try repair truncated JSON (common when max_tokens hit)
    // Attempt to close open brackets
    try {
      // Count braces
      let open = 0, close = 0, inString = false, escape = false;
      for (let i=firstBrace;i<=lastBrace;i++) {
        const ch = text[i];
        if (escape) { escape=false; continue; }
        if (ch==='\\') { escape=true; continue; }
        if (ch==='"') { inString=!inString; continue; }
        if (inString) continue;
        if (ch==='{') open++; if (ch==='}') close++;
      }
      // Try to auto-close
      let repaired = candidate;
      // Close arrays/objects roughly
      const missingClose = open - close;
      if (missingClose>0) repaired += '}'.repeat(missingClose);
      // Or if truncated inside array, try to close with ] then }
      try { return JSON.parse(repaired); } catch {
        // Last resort: truncate to last complete property
        const lastComma = repaired.lastIndexOf('",');
        if (lastComma>0) {
          let trimmed = repaired.slice(0, lastComma+1);
          // close structures
          trimmed = trimmed.replace(/,\s*$/, '') + ']}';
          // Try to balance again
          try { return JSON.parse(trimmed); } catch {}
        }
      }
    } catch {}
  }
  return null;
}

const GEMINI_RESPONSE_SCHEMA = {
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
    additional_notes: { type: "string" },
  },
  required: ["plant_name","disease","confidence","severity","symptoms","possible_causes","recommended_treatment","prevention","organic_solution","chemical_solution","additional_notes"],
};

function getModelsToTry() {
  const envOverride = process.env.GEMINI_MODEL?.trim();
  // Based on your logs, these actually exist:
  // Working (but sometimes rate-limited): gemini-flash-latest, gemini-2.0-flash, gemini-2.0-flash-lite, gemini-3.5-flash, gemini-3-flash-preview
  // Not found in v1beta: gemini-1.5-flash, gemini-1.5-flash-8b, gemini-2.5-flash-latest, gemini-3.1-flash-preview
  // Deprecated for new keys: gemini-2.5-flash
  const defaults = [
    "gemini-flash-latest",        // Your log: returned JSON (was truncated due to 1024 limit - now fixed)
    "gemini-2.0-flash-lite",      // Exists, rate limit is quota issue
    "gemini-2.0-flash",           // Exists, rate limit
    "gemini-3.5-flash",           // Exists, returned JSON
    "gemini-3-flash-preview",     // Exists, returned JSON
    "gemini-2.0-flash-001",
    "gemini-1.5-flash",           // Try v1 endpoint (often still in v1)
    "gemini-1.5-flash-8b",
    "gemini-1.5-flash-latest",
    "gemini-2.5-flash",           // Will fail for new users, but try
  ];
  if (envOverride) return [envOverride, ...defaults.filter(m=>m!==envOverride)];
  return defaults;
}

function parseRetryDelay(message) {
  const match = message.match(/retry in (\d+(?:\.\d+)?)s/i);
  if (match) return Math.ceil(parseFloat(match[1]));
  return null;
}

async function callGeminiWithModel({ model, base64Data, mimeType, apiKey, useStructured = true }) {
  // Try both API versions - some models only exist in v1, some only in v1beta
  const versions = ["v1beta", "v1"];
  let lastRes = null, lastData = null, lastErrMsg = "";

  for (const version of versions) {
    const url = `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const parts = [
      { text: SYSTEM_PROMPT },
      { inline_data: { mime_type: mimeType, data: base64Data } }
    ];

    const buildBody = (structured) => {
      if (structured) {
        return {
          contents: [{ role: "user", parts }],
          generationConfig: {
            temperature: 0.3,
            topP: 0.9,
            maxOutputTokens: 2048, // Increased from 1024 to avoid truncation seen in your logs
            responseMimeType: "application/json",
            responseSchema: GEMINI_RESPONSE_SCHEMA,
          },
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
          ],
        };
      } else {
        return {
          contents: [{ role: "user", parts }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 2048 },
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
          ],
        };
      }
    };

    const attempt = async (payload) => {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(()=>({}));
      return { res, data, version };
    };

    // Attempt structured
    let payload = buildBody(useStructured);
    let { res, data } = await attempt(payload);

    // Fallback snake_case
    if (!res.ok && useStructured) {
      const msgStr = JSON.stringify(data).toLowerCase();
      if (msgStr.includes("responsemimetype") || msgStr.includes("responseschema") || msgStr.includes("unknown name")) {
        const altPayload = {
          contents: payload.contents,
          generation_config: {
            temperature: 0.3,
            max_output_tokens: 2048,
            response_mime_type: "application/json",
            response_schema: GEMINI_RESPONSE_SCHEMA,
          },
          safety_settings: payload.safetySettings,
        };
        const alt = await attempt(altPayload);
        res = alt.res; data = alt.data;
      }
    }

    // If schema unsupported, retry without
    if (!res.ok && useStructured) {
      const errText = (data?.error?.message||"").toLowerCase();
      if (errText.includes("schema") || errText.includes("response_mime") || res.status===400) {
        const fb = await attempt(buildBody(false));
        if (fb.res.ok || !JSON.stringify(fb.data).toLowerCase().includes("schema")) {
          res = fb.res; data = fb.data;
        }
      }
    }

    // If model not found in this version, try next version
    if (!res.ok) {
      const errMsg = data?.error?.message || `Error ${res.status}`;
      lastRes = res; lastData = data; lastErrMsg = errMsg;
      if (errMsg.toLowerCase().includes("not found") || errMsg.toLowerCase().includes("is not found") || res.status===404) {
        console.warn(`[Gemini] ${model} not found in ${version}, trying ${version==='v1beta'?'v1':'done'}...`);
        continue; // try next version
      }
      // Rate limit or other error - don't try other version, surface immediately
      // But save for outer handling
      if (res.status===429 || errMsg.toLowerCase().includes("quota")) {
        throw new Error(`RATE_LIMIT:${errMsg} [model=${model} version=${version}] retryAfter=${parseRetryDelay(errMsg)||60}`);
      }
      if (errMsg.toLowerCase().includes("no longer available")) {
        throw new Error(`MODEL_NOT_FOUND:${errMsg} [model=${model} version=${version}]`);
      }
      if (res.status===401 || res.status===403) {
        throw new Error(`AUTH_ERROR:${errMsg} [model=${model}]`);
      }
      // For other errors, also break to try next model (not next version)
      throw new Error(`API_ERROR_${res.status}:${errMsg} [model=${model} version=${version}]`);
    }

    // Success - parse
    let text = "";
    const candidate = data?.candidates?.[0];
    if (candidate?.content?.parts?.length) {
      for (const part of candidate.content.parts) if (part.text) text += part.text;
    }
    if (!text) text = data?.text || candidate?.text || "";
    if (!text && data?.promptFeedback?.blockReason) {
      throw new Error(`SAFETY_BLOCK:${data.promptFeedback.blockReason} [model=${model}]`);
    }
    if (!text) throw new Error(`EMPTY_RESPONSE:No text [model=${model} version=${version}]`);

    const parsed = extractJsonFromText(text);
    if (!parsed) {
      console.warn(`[Gemini] INVALID_JSON from ${model} ${version}: ${text.slice(0,500)}`);
      // If truncated, try once more without structured schema for same model/version
      if (useStructured) {
        console.log(`[Gemini] Retrying ${model} without schema...`);
        const retryPayload = buildBody(false);
        const retry = await attempt(retryPayload);
        if (retry.res.ok) {
          let retryText = "";
          const rc = retry.data?.candidates?.[0];
          if (rc?.content?.parts?.length) for (const p of rc.content.parts) if (p.text) retryText+=p.text;
          if (!retryText) retryText = retry.data?.text || "";
          const retryParsed = extractJsonFromText(retryText);
          if (retryParsed) return { parsed: retryParsed, modelUsed: `${model} (${version})` };
          throw new Error(`INVALID_JSON:[model=${model} version=${version}] ${retryText.slice(0,800)}`);
        }
      }
      throw new Error(`INVALID_JSON:[model=${model} version=${version}] ${text.slice(0,800)}`);
    }

    return { parsed, modelUsed: `${model} (${version})` };
  }

  // If we tried both versions and got model not found
  if (lastRes) {
    const errMsg = lastData?.error?.message || lastErrMsg || "not found";
    if (errMsg.toLowerCase().includes("not found") || errMsg.toLowerCase().includes("is not found") || lastRes.status===404) {
      throw new Error(`MODEL_NOT_FOUND:${errMsg} [model=${model}]`);
    }
    throw new Error(`API_ERROR_${lastRes.status}:${errMsg} [model=${model}]`);
  }
  throw new Error(`MODEL_NOT_FOUND:All versions failed for ${model}`);
}

async function callGeminiAPI({ base64Data, mimeType, apiKey }) {
  const models = getModelsToTry();
  let attempted = [];
  let rateLimited = [];
  let lastError = null;

  for (const model of models) {
    try {
      console.log(`[Gemini] Trying model: ${model}`);
      const { parsed, modelUsed } = await callGeminiWithModel({ model, base64Data, mimeType, apiKey, useStructured: true });
      return { result: parsed, modelUsed, attempted, rateLimited };
    } catch (err) {
      const msg = err?.message||"";
      attempted.push({ model, error: msg });
      lastError = err;
      if (msg.startsWith("AUTH_ERROR:") || msg.startsWith("SAFETY_BLOCK:")) throw err;
      if (msg.startsWith("RATE_LIMIT:")) {
        rateLimited.push({ model, error: msg, retryAfter: parseRetryDelay(msg) });
        console.warn(`[Gemini] Rate limited ${model}`);
        continue;
      }
      if (msg.startsWith("MODEL_NOT_FOUND:")) {
        console.warn(`[Gemini] Model ${model} not found`);
        continue;
      }
      // INVALID_JSON, API_ERROR etc -> try next model
      console.warn(`[Gemini] ${model} failed: ${msg.slice(0,200)}`);
      continue;
    }
  }

  if (rateLimited.length>0 && attempted.length===rateLimited.length) {
    const retryAfter = Math.min(...rateLimited.map(r=>r.retryAfter||60).filter(Boolean));
    throw new Error(`RATE_LIMIT_ALL:All quota exceeded. ${rateLimited.map(r=>r.model).join(", ")} retryAfter=${retryAfter} | ${rateLimited[0].error}`);
  }

  const attemptedStr = attempted.map(a=> `${a.model}: ${a.error.slice(0,300)}`).join(" | ");
  throw new Error(`ALL_MODELS_FAILED: Tried ${models.join(", ")} — ${lastError?.message} — ${attemptedStr}`);
}

export async function POST(req) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey==="YOUR_GEMINI_API_KEY_HERE" || apiKey.trim().length<10) {
      return NextResponse.json({ error: "GEMINI_API_KEY not configured", code: "MISSING_API_KEY" }, { status: 500 });
    }

    let formData;
    try { formData = await req.formData(); }
    catch { return NextResponse.json({ error: "Invalid form data", code: "INVALID_FORM" }, { status: 400 }); }

    const file = formData.get("image") || formData.get("file");
    if (!file || typeof file==="string") return NextResponse.json({ error: "No image", code: "NO_IMAGE" }, { status: 400 });

    const mime = file.type || "";
    if (!ACCEPTED_MIMES.includes(mime)) {
      const name = (file.name||"").toLowerCase();
      if (![".jpg",".jpeg",".png",".webp"].some(ext=>name.endsWith(ext))) {
        return NextResponse.json({ error: `Unsupported format: ${mime}`, code: "UNSUPPORTED_FORMAT" }, { status: 400 });
      }
    }
    if (file.size > MAX_SIZE_BYTES) return NextResponse.json({ error: `Too large ${(file.size/1024/1024).toFixed(2)}MB`, code: "FILE_TOO_LARGE" }, { status: 400 });
    if (file.size===0) return NextResponse.json({ error: "Empty file", code: "EMPTY_FILE" }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    let mimeForGemini = mime || "image/jpeg";
    if (mimeForGemini==="image/jpg") mimeForGemini="image/jpeg";

    let result, modelUsed, attemptedModels, rateLimitedInfo;

    try {
      const res = await callGeminiAPI({ base64Data: base64, mimeType: mimeForGemini, apiKey });
      result = res.result; modelUsed = res.modelUsed; attemptedModels = res.attempted; rateLimitedInfo = res.rateLimited;
    } catch (err) {
      const msg = err?.message || "Gemini failed";
      console.error("Gemini API failed:", msg);

      if (msg.startsWith("AUTH_ERROR:")) {
        return NextResponse.json({ error: "Invalid API key", code: "INVALID_API_KEY", details: msg.replace("AUTH_ERROR:","") }, { status: 401 });
      }
      if (msg.startsWith("RATE_LIMIT:") || msg.startsWith("RATE_LIMIT_ALL:")) {
        const retryAfter = parseRetryDelay(msg) || 60;
        return NextResponse.json({
          error: `Free tier quota exceeded (limit: 0). Enable billing or try smaller image. Retry in ${retryAfter}s.`,
          code: "RATE_LIMITED",
          details: msg.slice(0,2000),
          retryAfter,
          help: [
            "Your project has 0 free quota — common for new keys. Enable billing at https://aistudio.google.com/app/apikey",
            "Use tiny image <500KB JPEG to cut tokens",
            "Set GEMINI_MODEL=gemini-flash-latest in .env.local (worked in your log)",
            "Or GEMINI_MODEL=gemini-2.0-flash-lite",
            "Check usage at https://ai.dev/rate-limit",
            "Wait "+retryAfter+"s then retry",
          ],
        }, { status: 429, headers: { "Retry-After": String(retryAfter) } });
      }
      if (msg.startsWith("SAFETY_BLOCK:")) {
        return NextResponse.json({ error: "Safety blocked", code: "SAFETY_BLOCKED", details: msg.replace("SAFETY_BLOCK:","") }, { status: 400 });
      }
      if (msg.startsWith("ALL_MODELS_FAILED:")) {
        return NextResponse.json({ error: "All models failed - see details", code: "ALL_MODELS_FAILED", details: msg.slice(0,3000), hint: "Try GEMINI_MODEL=gemini-flash-latest (worked in your log) or enable billing" }, { status: 502 });
      }
      return NextResponse.json({ error: "AI failed", code: "AI_FAILED", details: msg.slice(0,2000) }, { status: 502 });
    }

    for (const f of ["plant_name","disease","confidence","severity"]) if (!result[f]) result[f]="Unknown";
    for (const af of ["symptoms","possible_causes","recommended_treatment","prevention","organic_solution","chemical_solution"]) {
      if (!Array.isArray(result[af])) result[af] = typeof result[af]==="string" ? [result[af]] : [];
    }
    if (!result.additional_notes) result.additional_notes = `Analysis by ${modelUsed}. Consult agronomist.`;

    return NextResponse.json({ ...result, _meta: { provider:"gemini", model:modelUsed, attempted: attemptedModels?.length, rateLimited: rateLimitedInfo?.length, timestamp: new Date().toISOString() } }, { status: 200 });
  } catch (err) {
    console.error("/api/detect error:", err);
    return NextResponse.json({ error: "Server error", code: "SERVER_ERROR", details: err?.message||"Unknown" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: "POST image to /api/detect",
    primary: "gemini-flash-latest (worked in your logs) + fallbacks",
    fallback_models: getModelsToTry(),
    env_override: "GEMINI_MODEL=gemini-flash-latest or gemini-2.0-flash",
    fix_rate_limit_zero: "Enable billing at https://aistudio.google.com/app/apikey -> your project has limit 0",
    fix_invalid_json: "Now maxOutputTokens=2048 (was 1024) to avoid truncation you saw",
  }, { status: 200 });
}
