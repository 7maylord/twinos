import 'dotenv/config';
import { prisma } from '../lib/db';

async function main() {
  console.log('Seeding database...');

  // 1. Clean up existing data
  await prisma.simulationResult.deleteMany();
  await prisma.scenario.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.product.deleteMany();
  await prisma.business.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create demo user
  const user = await prisma.user.create({
    data: {
      email: 'demo@twinos.com',
    },
  });

  // 3. Create demo business (Halo Café)
  const business = await prisma.business.create({
    data: {
      ownerId: user.id,
      name: 'Halo Café',
      industry: 'Restaurant',
      baselineRevenue: 180000.0,
      baselineMarketing: 25000.0,
      baselineInventory: 40000.0,
      baselineFixedCosts: 30000.0,
    },
  });

  // 4. Create products
  await prisma.product.createMany({
    data: [
      { businessId: business.id, name: 'Espresso', price: 4.5, cost: 0.5 },
      { businessId: business.id, name: 'Latte', price: 5.5, cost: 0.75 },
      { businessId: business.id, name: 'Croissant', price: 4.0, cost: 1.0 },
      { businessId: business.id, name: 'Avocado Toast', price: 12.5, cost: 3.5 },
    ],
  });

  // 5. Create employees (Total = 24, total payroll = $96,500)
  const employeeData = [];
  // 15 Baristas
  for (let i = 1; i <= 15; i++) {
    employeeData.push({ businessId: business.id, name: `Barista ${i}`, role: 'Barista', salary: 3500.0 });
  }
  // 5 Chefs
  for (let i = 1; i <= 5; i++) {
    employeeData.push({ businessId: business.id, name: `Chef ${i}`, role: 'Chef', salary: 4500.0 });
  }
  // 3 Shift Supervisors
  for (let i = 1; i <= 3; i++) {
    employeeData.push({ businessId: business.id, name: `Supervisor ${i}`, role: 'Shift Supervisor', salary: 5000.0 });
  }
  // 1 Manager
  employeeData.push({ businessId: business.id, name: 'General Manager', role: 'Manager', salary: 6500.0 });

  await prisma.employee.createMany({
    data: employeeData,
  });

  // 6. Create default scenarios with simulation results
  // Scenario 1: Q3 Growth Strategy (+10% prices, 28 employees, +$20k marketing)
  const sc1 = await prisma.scenario.create({
    data: {
      businessId: business.id,
      name: 'Q3 Growth Strategy',
      status: 'Active',
      priceIncrease: 10.0,
      employeeCount: 28,
      marketingBudget: 45000.0,
      supplierDelay: 'none',
    },
  });

  const sc1MonthlyData = [
    { month: 'Jan', baselineRevenue: 180000, projectedRevenue: 180000, baselineProfit: 28500, projectedProfit: 28500 },
    { month: 'Feb', baselineRevenue: 180000, projectedRevenue: 185000, baselineProfit: 28500, projectedProfit: 25000 },
    { month: 'Mar', baselineRevenue: 180000, projectedRevenue: 198000, baselineProfit: 28500, projectedProfit: 32000 },
    { month: 'Apr', baselineRevenue: 180000, projectedRevenue: 215000, baselineProfit: 28500, projectedProfit: 41000 },
    { month: 'May', baselineRevenue: 180000, projectedRevenue: 230000, baselineProfit: 28500, projectedProfit: 49500 },
    { month: 'Jun', baselineRevenue: 180000, projectedRevenue: 245000, baselineProfit: 28500, projectedProfit: 58000 },
  ];

  await prisma.simulationResult.create({
    data: {
      scenarioId: sc1.id,
      projectedRevenue: 245000.0,
      projectedProfit: 58000.0,
      projectedHeadcount: 28,
      projectedInventoryRisk: 0.65,
      monthlyDataJson: JSON.stringify(sc1MonthlyData),
    },
  });

  // Scenario 2: Price Optimization (+15% prices, no headcount change, same marketing)
  const sc2 = await prisma.scenario.create({
    data: {
      businessId: business.id,
      name: 'Price Optimization',
      status: 'Completed',
      priceIncrease: 15.0,
      employeeCount: 24,
      marketingBudget: 25000.0,
      supplierDelay: 'none',
    },
  });

  const sc2MonthlyData = [
    { month: 'Jan', baselineRevenue: 180000, projectedRevenue: 180000, baselineProfit: 28500, projectedProfit: 28500 },
    { month: 'Feb', baselineRevenue: 180000, projectedRevenue: 190000, baselineProfit: 28500, projectedProfit: 35000 },
    { month: 'Mar', baselineRevenue: 180000, projectedRevenue: 195000, baselineProfit: 28500, projectedProfit: 38000 },
    { month: 'Apr', baselineRevenue: 180000, projectedRevenue: 200000, baselineProfit: 28500, projectedProfit: 41000 },
    { month: 'May', baselineRevenue: 180000, projectedRevenue: 205000, baselineProfit: 28500, projectedProfit: 44000 },
    { month: 'Jun', baselineRevenue: 180000, projectedRevenue: 210000, baselineProfit: 28500, projectedProfit: 47500 },
  ];

  await prisma.simulationResult.create({
    data: {
      scenarioId: sc2.id,
      projectedRevenue: 210000.0,
      projectedProfit: 47500.0,
      projectedHeadcount: 24,
      projectedInventoryRisk: 0.72,
      monthlyDataJson: JSON.stringify(sc2MonthlyData),
    },
  });

  console.log('Database seeded successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Error during seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
