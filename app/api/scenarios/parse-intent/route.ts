import { NextResponse } from 'next/server';
import { getActiveBusiness } from '@/lib/auth-helpers';

// Parses a free-text scenario request ("hire 3 more baristas and raise prices
// 8%") into the same structured levers the manual scenario builder sliders
// produce. This only ever prefills the builder form for the user to review —
// it never calls /api/scenarios/run itself — and every returned value is
// clamped to the exact bounds the manual sliders enforce, so a malformed or
// adversarially-prompted AI response can't push an out-of-range value into
// the deterministic engine.
export async function POST(request: Request) {
  try {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your-gemini-api-key-here') {
      return NextResponse.json(
        { error: 'Natural-language scenario building requires a GEMINI_API_KEY to be configured.' },
        { status: 501 }
      );
    }

    const body = await request.json();
    const text = typeof body.text === 'string' ? body.text.trim() : '';
    if (!text) {
      return NextResponse.json({ error: 'text is required' }, { status: 400 });
    }
    if (text.length > 500) {
      return NextResponse.json({ error: 'Request is too long (max 500 characters)' }, { status: 400 });
    }

    const business = await getActiveBusiness();
    if (!business) {
      return NextResponse.json({ error: 'No active business found.' }, { status: 404 });
    }

    const currentHeadcount = business.employees.length;
    const currentMarketingBudget = business.baselineMarketing;

    const prompt = `
      You convert a small business owner's plain-English scenario request into
      structured simulation levers. The business currently has ${currentHeadcount}
      employees and a $${currentMarketingBudget} monthly marketing budget.

      Owner's request: "${text}"

      Return the target values for each lever. For anything the request doesn't
      mention, use the current baseline (0% for price increase, ${currentHeadcount}
      for headcount, $${currentMarketingBudget} for marketing budget, "none" for
      supplier delay) rather than guessing.
    `;

    // "-latest" alias rather than a dated model version (e.g. gemini-1.5-flash,
    // which Google has since deprecated) so this doesn't silently start
    // 404ing again the next time a dated model version is retired.
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`;
    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          // This is mechanical entity extraction into a fixed schema, not
          // reasoning — disabling the model's extended "thinking" cuts a
          // ~25s response down to ~4s with no loss of accuracy on this task.
          thinkingConfig: { thinkingBudget: 0 },
          responseSchema: {
            type: 'OBJECT',
            properties: {
              scenarioName: { type: 'STRING', description: 'A short descriptive name for this scenario (under 60 characters).' },
              priceIncrease: { type: 'NUMBER', description: 'Target percent price increase, 0-50.' },
              employeeCount: { type: 'NUMBER', description: 'Target total headcount (not a delta).' },
              marketingBudget: { type: 'NUMBER', description: 'Target monthly marketing budget in dollars.' },
              supplierDelay: { type: 'STRING', enum: ['none', 'minor', 'moderate', 'severe'] },
            },
            required: ['scenarioName', 'priceIncrease', 'employeeCount', 'marketingBudget', 'supplierDelay'],
          },
        },
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error('[Parse Intent] Gemini request failed:', errText);
      return NextResponse.json({ error: 'AI parsing failed. Try rephrasing, or use the manual controls below.' }, { status: 502 });
    }

    const aiData = await geminiRes.json();
    const rawContent = aiData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawContent) {
      return NextResponse.json({ error: 'AI returned no result. Try rephrasing, or use the manual controls below.' }, { status: 502 });
    }

    let parsed: any;
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      return NextResponse.json({ error: 'AI returned an unparseable result. Try rephrasing, or use the manual controls below.' }, { status: 502 });
    }

    const clampNumber = (value: unknown, min: number, max: number, fallback: number): number => {
      const num = Number(value);
      if (!Number.isFinite(num)) return fallback;
      return Math.min(max, Math.max(min, num));
    };
    const validDelays = new Set(['none', 'minor', 'moderate', 'severe']);

    return NextResponse.json({
      scenarioName: typeof parsed.scenarioName === 'string' && parsed.scenarioName.trim()
        ? parsed.scenarioName.trim().slice(0, 60)
        : 'AI-Suggested Scenario',
      priceIncrease: Math.round(clampNumber(parsed.priceIncrease, 0, 50, 0) * 10) / 10,
      employeeCount: Math.round(clampNumber(parsed.employeeCount, 5, 50, currentHeadcount)),
      marketingBudget: Math.round(clampNumber(parsed.marketingBudget, 0, 100000, currentMarketingBudget)),
      supplierDelay: validDelays.has(parsed.supplierDelay) ? parsed.supplierDelay : 'none',
    });
  } catch (error: any) {
    console.error('Error parsing scenario intent:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
