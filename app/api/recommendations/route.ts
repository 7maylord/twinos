import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateRuleBasedRecommendation } from '@/lib/simulation-engine';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const scenarioId = searchParams.get('scenarioId');

    if (!scenarioId) {
      return NextResponse.json({ error: 'Scenario ID is required' }, { status: 400 });
    }

    // Load scenario and results
    const scenario = await prisma.scenario.findUnique({
      where: { id: scenarioId },
      include: {
        business: {
          include: {
            employees: true,
          },
        },
        simulationResults: {
          orderBy: {
            generatedAt: 'desc',
          },
          take: 1,
        },
      },
    });

    if (!scenario) {
      return NextResponse.json({ error: 'Scenario not found' }, { status: 404 });
    }

    const latestResult = scenario.simulationResults[0];
    if (!latestResult) {
      return NextResponse.json({ error: 'No simulation results found for this scenario' }, { status: 400 });
    }

    const business = scenario.business;
    const employees = business.employees;
    
    // Baseline calculations
    const baselineRevenue = business.baselineRevenue;
    const baselinePayroll = employees.reduce((sum, emp) => sum + emp.salary, 0);
    const baselineExpenses = baselinePayroll + business.baselineMarketing + business.baselineInventory + business.baselineFixedCosts;
    const baselineProfit = baselineRevenue - baselineExpenses;

    // Simulated/Projected metrics
    const projectedRevenue = latestResult.projectedRevenue;
    const projectedProfit = latestResult.projectedProfit;
    const projectedHeadcount = latestResult.projectedHeadcount;
    const projectedInventoryRisk = latestResult.projectedInventoryRisk;

    const profitDelta = projectedProfit - baselineProfit;
    const revenueDelta = projectedRevenue - baselineRevenue;
    const payrollDelta = (projectedHeadcount - employees.length) * (employees.length > 0 ? (baselinePayroll / employees.length) : 4000);

    let summaryText = '';
    let recommendationHeadline = '';
    let recommendationDetails = '';
    let keyConsiderations: string[] = [];

    // Check if Gemini API Key is configured
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your-gemini-api-key-here') {
      try {
        const prompt = `
          You are an AI Business Consultant for TwinOS.
          Analyze this business twin simulation:
          
          BUSINESS PROFILE:
          - Name: ${business.name}
          - Sector: ${business.industry}
          - Monthly Baseline Revenue: $${baselineRevenue.toLocaleString()}
          - Monthly Baseline Payroll: $${baselinePayroll.toLocaleString()}
          - Monthly Baseline Profit: $${baselineProfit.toLocaleString()}
          
          SCENARIO ADJUSTMENTS MADE:
          - Scenario Name: "${scenario.name}"
          - Price Increase: ${scenario.priceIncrease}%
          - Simulated Headcount: ${scenario.employeeCount} staff (Baseline: ${employees.length})
          - Simulated Marketing Spend: $${scenario.marketingBudget.toLocaleString()} (Baseline: $${business.baselineMarketing.toLocaleString()})
          - Supplier Delay: ${scenario.supplierDelay}
          
          CALCULATED SIMULATION OUTCOMES:
          - Projected Monthly Revenue: $${projectedRevenue.toLocaleString()} (Delta: $${revenueDelta.toLocaleString()})
          - Projected Monthly Profit: $${projectedProfit.toLocaleString()} (Delta: $${profitDelta.toLocaleString()})
          - Projected Inventory Risk: ${(projectedInventoryRisk * 100).toFixed(0)}%
          
          Write a concise, professional assessment.
        `;

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
        
        const geminiRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt }
                ]
              }
            ],
            generationConfig: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: 'OBJECT',
                properties: {
                  summary: { type: 'STRING', description: '1-2 sentence high-level summary of the outcome.' },
                  headline: { type: 'STRING', description: 'Short active recommendation header (e.g. "Proceed with Phased Rollout")' },
                  details: { type: 'STRING', description: '1-2 sentences of detailed execution advice.' },
                  considerations: {
                    type: 'ARRAY',
                    items: { type: 'STRING' },
                    description: 'List of 3 key considerations.'
                  }
                },
                required: ['summary', 'headline', 'details', 'considerations']
              }
            }
          }),
        });

        if (geminiRes.ok) {
          const aiData = await geminiRes.json();
          const rawContent = aiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawContent) {
            const parsedRes = JSON.parse(rawContent);
            summaryText = parsedRes.summary;
            recommendationHeadline = parsedRes.headline;
            recommendationDetails = parsedRes.details;
            keyConsiderations = parsedRes.considerations;
          }
        } else {
          const errText = await geminiRes.text();
          console.warn('Gemini request failed, falling back to rule-based generation. Error:', errText);
        }
      } catch (err) {
        console.error('Error invoking Gemini:', err);
      }
    }

    // Fallback Rule-Based Generation (if Gemini key is missing or the request failed)
    if (!summaryText) {
      const recResult = generateRuleBasedRecommendation({
        business,
        baselineHeadcount: employees.length,
        baselinePayroll,
        scenario,
        latestResult,
      });
      summaryText = recResult.summary;
      recommendationHeadline = recResult.headline;
      recommendationDetails = recResult.details;
      keyConsiderations = recResult.considerations;
    }

    return NextResponse.json({
      summary: summaryText,
      headline: recommendationHeadline,
      details: recommendationDetails,
      considerations: keyConsiderations,
    });
  } catch (error: any) {
    console.error('Error generating AI recommendation:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
