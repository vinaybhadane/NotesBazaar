import fs from 'fs';
import sql from 'mssql';
import { BlobServiceClient } from '@azure/storage-blob';

// Load .env.local
const env = {};
if (fs.existsSync('.env.local')) {
  const lines = fs.readFileSync('.env.local', 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx > -1) {
      const key = trimmed.substring(0, idx).trim();
      let val = trimmed.substring(idx + 1).trim();
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      env[key] = val;
    }
  }
}

console.log('====================================================');
console.log('NotesBazaar — Azure Pre-Flight Connectivity Test');
console.log('====================================================\n');

// 1. Test Azure Blob Storage
async function testStorage() {
  console.log('[1/2] Testing Azure Blob Storage...');
  const connStr = env.AZURE_STORAGE_CONNECTION_STRING || process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!connStr) {
    console.warn('⚠️  AZURE_STORAGE_CONNECTION_STRING is not set in .env.local.');
    return;
  }

  try {
    const client = BlobServiceClient.fromConnectionString(connStr);
    const containerName = env.AZURE_STORAGE_CONTAINER_NOTES || 'notes-private';
    const containerClient = client.getContainerClient(containerName);
    const exists = await containerClient.exists();
    if (exists) {
      console.log(`✅ Azure Blob Storage: Connected! Container "${containerName}" exists.`);
    } else {
      console.log(`ℹ️  Azure Blob Storage: Connected, creating container "${containerName}"...`);
      await containerClient.createIfNotExists();
      console.log(`✅ Azure Blob Storage: Container "${containerName}" created successfully.`);
    }
  } catch (err) {
    console.error('❌ Azure Blob Storage failed:', err.message);
  }
}

// 2. Test Azure SQL
async function testSql() {
  console.log('\n[2/2] Testing Azure SQL Database...');
  const connStr = env.AZURE_SQL_CONNECTION_STRING || process.env.AZURE_SQL_CONNECTION_STRING;
  const server = env.AZURE_SQL_SERVER || process.env.AZURE_SQL_SERVER;
  const database = env.AZURE_SQL_DATABASE || process.env.AZURE_SQL_DATABASE;
  const user = env.AZURE_SQL_USER || process.env.AZURE_SQL_USER;
  const password = env.AZURE_SQL_PASSWORD || process.env.AZURE_SQL_PASSWORD;

  if (!connStr && !(server && database && user && password)) {
    console.warn('⚠️  Azure SQL credentials are not set in .env.local.');
    console.warn('   (Currently running on local persistent JSON database: .data/notesbazaar.json)');
    console.warn('   To connect Azure SQL, set AZURE_SQL_CONNECTION_STRING in .env.local.');
    return;
  }

  try {
    let pool;
    if (connStr) {
      pool = await new sql.ConnectionPool(connStr).connect();
    } else {
      pool = await new sql.ConnectionPool({
        server,
        database,
        user,
        password,
        port: 1433,
        options: { encrypt: true, trustServerCertificate: false },
      }).connect();
    }

    console.log('✅ Azure SQL: Successfully connected!');
    const result = await pool.request().query('SELECT COUNT(*) as tableCount FROM sys.tables');
    const count = result.recordset[0].tableCount;
    console.log(`   Found ${count} tables in database "${database || 'Azure SQL'}".`);

    if (count === 0) {
      console.log('   ℹ️  No tables found. Run "migrations/001_initial_schema.sql" in Azure Query Editor.');
    } else {
      console.log('   ✅ Tables are initialized and ready for production!');
    }
    await pool.close();
  } catch (err) {
    console.error('❌ Azure SQL connection failed:', err.message);
  }
}

async function main() {
  await testStorage();
  await testSql();
  console.log('\n====================================================\n');
}

main();
