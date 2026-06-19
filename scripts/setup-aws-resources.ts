import { DynamoDBClient, CreateTableCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import dotenv from 'dotenv';
import path from 'path';

// Load env variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const region = process.env.AWS_REGION || 'us-east-1';
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

if (!accessKeyId || !secretAccessKey) {
  console.error('❌ Error: AWS credentials (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY) not found in .env file.');
  process.exit(1);
}

const client = new DynamoDBClient({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

async function checkTableExists(tableName: string): Promise<boolean> {
  try {
    await client.send(new DescribeTableCommand({ TableName: tableName }));
    return true;
  } catch (err: any) {
    if (err.name === 'ResourceNotFoundException') {
      return false;
    }
    throw err;
  }
}

async function createForecastCacheTable() {
  const tableName = 'ForecastCache';
  console.log(`Checking if table "${tableName}" exists...`);
  
  if (await checkTableExists(tableName)) {
    console.log(`✅ Table "${tableName}" already exists.`);
    return;
  }

  console.log(`Creating DynamoDB Table: "${tableName}"...`);
  try {
    await client.send(
      new CreateTableCommand({
        TableName: tableName,
        KeySchema: [
          { AttributeName: 'businessId', KeyType: 'HASH' }, // Partition Key
          { AttributeName: 'metricType', KeyType: 'RANGE' }, // Sort Key
        ],
        AttributeDefinitions: [
          { AttributeName: 'businessId', AttributeType: 'S' },
          { AttributeName: 'metricType', AttributeType: 'S' },
        ],
        BillingMode: 'PAY_PER_REQUEST', // Pay-per-request (On-Demand / Free tier friendly)
      })
    );
    console.log(`🎉 Table "${tableName}" created successfully!`);
  } catch (err) {
    console.error(`❌ Failed to create table "${tableName}":`, err);
  }
}

async function createOptimizationRunsTable() {
  const tableName = 'OptimizationRuns';
  console.log(`Checking if table "${tableName}" exists...`);
  
  if (await checkTableExists(tableName)) {
    console.log(`✅ Table "${tableName}" already exists.`);
    return;
  }

  console.log(`Creating DynamoDB Table: "${tableName}"...`);
  try {
    await client.send(
      new CreateTableCommand({
        TableName: tableName,
        KeySchema: [
          { AttributeName: 'runId', KeyType: 'HASH' }, // Partition Key
        ],
        AttributeDefinitions: [
          { AttributeName: 'runId', AttributeType: 'S' },
        ],
        BillingMode: 'PAY_PER_REQUEST', // Pay-per-request (On-Demand / Free tier friendly)
      })
    );
    console.log(`🎉 Table "${tableName}" created successfully!`);
  } catch (err) {
    console.error(`❌ Failed to create table "${tableName}":`, err);
  }
}

async function main() {
  console.log('🚀 Starting AWS DynamoDB Resource Provisioning...\n');
  
  try {
    await createForecastCacheTable();
    console.log('');
    await createOptimizationRunsTable();
    console.log('\n✅ AWS DynamoDB provisioning process complete.');
  } catch (err) {
    console.error('❌ Critical error during provisioning:', err);
    process.exit(1);
  }
}

main();
