import fs from 'fs';
import path from 'path';

// Flag to check if AWS variables are fully set up
const hasAwsCredentials = !!(
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY &&
  process.env.AWS_REGION
);

// Lazy-load AWS SDK to prevent bundle/compilation dependency issues if credentials are missing
let ddbDocClient: any = null;

const getDdbDocClient = async () => {
  if (!hasAwsCredentials) return null;
  if (ddbDocClient) return ddbDocClient;
  
  try {
    const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
    const { DynamoDBDocumentClient } = await import('@aws-sdk/lib-dynamodb');
    
    const client = new DynamoDBClient({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
    ddbDocClient = DynamoDBDocumentClient.from(client);
    return ddbDocClient;
  } catch (err) {
    console.warn('AWS SDK packages not found or initialization failed. Falling back to local logging.', err);
    return null;
  }
};

const MOCK_FILE_PATH = path.join(process.cwd(), 'prisma/dynamodb_mock.json');

// Ensure local mock file exists
const ensureMockFile = () => {
  if (!fs.existsSync(MOCK_FILE_PATH)) {
    fs.writeFileSync(MOCK_FILE_PATH, JSON.stringify({ optimizationRuns: [], forecastCache: [] }, null, 2));
  }
};

export async function logOptimizationRun(runData: {
  runId: string;
  timestamp: string;
  targetMetric: string;
  exploredScenarios: number;
  recommendedChanges: string[];
}) {
  const ddb = await getDdbDocClient();
  if (ddb) {
    try {
      const { PutCommand } = await import('@aws-sdk/lib-dynamodb');
      await ddb.send(
        new PutCommand({
          TableName: process.env.DYNAMODB_OPTIMIZATION_TABLE || 'OptimizationRuns',
          Item: runData,
        })
      );
      console.log(`[DynamoDB] Logged optimization run ${runData.runId} successfully.`);
      return;
    } catch (err) {
      console.error('[DynamoDB] Error writing optimization run, logging locally:', err);
    }
  }

  // Fallback to local file logging
  try {
    ensureMockFile();
    const data = JSON.parse(fs.readFileSync(MOCK_FILE_PATH, 'utf-8'));
    data.optimizationRuns.push(runData);
    // Keep last 50 logs
    if (data.optimizationRuns.length > 50) {
      data.optimizationRuns.shift();
    }
    fs.writeFileSync(MOCK_FILE_PATH, JSON.stringify(data, null, 2));
    console.log(`[Local Mock DynamoDB] Logged optimization run ${runData.runId} locally.`);
  } catch (fileErr) {
    console.error('Failed to write mock DynamoDB log:', fileErr);
  }
}

export async function cacheForecast(forecastData: {
  businessId: string;
  metricType: string; // e.g. "monthly-projections"
  forecastData: any;
  generatedAt: string;
}) {
  const ddb = await getDdbDocClient();
  if (ddb) {
    try {
      const { PutCommand } = await import('@aws-sdk/lib-dynamodb');
      await ddb.send(
        new PutCommand({
          TableName: process.env.DYNAMODB_FORECAST_TABLE || 'ForecastCache',
          Item: forecastData,
        })
      );
      console.log(`[DynamoDB] Cached forecast for business ${forecastData.businessId} successfully.`);
      return;
    } catch (err) {
      console.error('[DynamoDB] Error caching forecast, caching locally:', err);
    }
  }

  // Fallback to local file logging
  try {
    ensureMockFile();
    const data = JSON.parse(fs.readFileSync(MOCK_FILE_PATH, 'utf-8'));
    const index = data.forecastCache.findIndex(
      (item: any) => item.businessId === forecastData.businessId && item.metricType === forecastData.metricType
    );
    if (index !== -1) {
      data.forecastCache[index] = forecastData;
    } else {
      data.forecastCache.push(forecastData);
    }
    fs.writeFileSync(MOCK_FILE_PATH, JSON.stringify(data, null, 2));
    console.log(`[Local Mock DynamoDB] Cached forecast for business ${forecastData.businessId} locally.`);
  } catch (fileErr) {
    console.error('Failed to write mock DynamoDB cache:', fileErr);
  }
}
