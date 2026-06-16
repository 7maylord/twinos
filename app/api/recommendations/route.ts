import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

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

    // Check if OpenAI API Key is configured
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key-here') {
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
          Return exactly a JSON object in this format (no other text, no markdown block):
          {
            "summary": "1-2 sentence high-level summary of the outcome.",
            "headline": "Short active recommendation header (e.g. 'Proceed with Phased Rollout')",
            "details": "1-2 sentences of detailed execution advice.",
            "considerations": ["Consideration 1", "Consideration 2", "Consideration 3"]
          }
        `;

        const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            response_format: { type: 'json_object' },
            messages: [
              { role: 'system', content: 'You return structured JSON assessments for business simulations.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.2,
          }),
        });

        if (openAiRes.ok) {
          const aiData = await openAiRes.json();
          const parsedRes = JSON.parse(aiData.choices[0].message.content);
          
          summaryText = parsedRes.summary;
          recommendationHeadline = parsedRes.headline;
          recommendationDetails = parsedRes.details;
          keyConsiderations = parsedRes.considerations;
        } else {
          console.warn('OpenAI request failed, falling back to rule-based generation.');
        }
      } catch (err) {
        console.error('Error invoking OpenAI:', err);
      }
    }

    // Fallback Rule-Based Generation (if OpenAI is missing or failed)
    if (!summaryText) {
      const isProfitable = projectedProfit > baselineProfit;
      const isNetPositive = projectedProfit > 0;
      
      // 1. Summary
      if (isProfitable && isNetPositive) {
        summaryText = `Based on the simulation results, "${scenario.name}" shows strong potential. The projected revenue increase of $${revenueDelta.toLocaleString()} would significantly improve profitability while maintaining acceptable margins.`;
      } else if (isProfitable) {
        summaryText = `This scenario reduces your operating deficit by $${profitDelta.toLocaleString()} compared to the baseline, but the business remains in a net monthly loss. Consider raising prices further or reducing overheads.`;
      } else {
        summaryText = `Caution: "${scenario.name}" projects a profit drop of $${Math.abs(profitDelta).toLocaleString()} compared to the baseline. Operating costs (such as payroll adjustments) have outpaced your price adjustment gains.`;
      }

      // 2. Headline & Details
      if (isNetPositive && isProfitable) {
        recommendationHeadline = 'Proceed with Confidence';
        recommendationDetails = `This strategy successfully moves the business to net profitability. The projected revenue of $${projectedRevenue.toLocaleString()} validates the price adjustment despite small demand drops.`;
      } else if (isNetPositive) {
        recommendationHeadline = 'Revise Staffing & Prices';
        recommendationDetails = `Operating profit remains positive but is lower than baseline. We recommend scaling back the headcount additions or increasing prices by another 3-5% to cover salaries.`;
      } else {
        recommendationHeadline = 'Simulation Projects Net Loss';
        recommendationDetails = `The business is projected to run a net monthly loss of $${Math.abs(projectedProfit).toLocaleString()}. We recommend postponing this rollout and revising your employee count adjustments.`;
      }

      // 3. Considerations
      if (revenueDelta > 0) {
        keyConsiderations.push('Revenue is projected to grow due to adjustments.');
      } else {
        keyConsiderations.push('Revenue contracts due to price elasticity.');
      }

      if (projectedHeadcount > employees.length) {
        keyConsiderations.push(`Hiring timeline for ${projectedHeadcount - employees.length} staff members is realistic.`);
      } else if (projectedHeadcount < employees.length) {
        keyConsiderations.push(`Workforce reduction of ${employees.length - projectedHeadcount} will reduce baseline payroll by $${Math.abs(payrollDelta).toLocaleString()}.`);
      } else {
        keyConsiderations.push('Hiring overhead is maintained at baseline level.');
      }

      if (scenario.supplierDelay === 'none') {
        keyConsiderations.push('Supply chain operates smoothly without delay risks.');
      } else {
        keyConsiderations.push(`Inventory delay (${scenario.supplierDelay}) raises stockout risk to ${(projectedInventoryRisk * 100).toFixed(0)}%.`);
      }
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
