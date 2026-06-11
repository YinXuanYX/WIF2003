import dotenv from 'dotenv';
dotenv.config();

import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';

const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error('Error: MONGO_URI is not defined in your .env file.');
  process.exit(1);
}

// Extract database name from URI if possible, or default to financial_planning
let dbName = 'financial_planning';
try {
  const parsed = new URL(mongoUri);
  const pathName = parsed.pathname.replace(/^\//, '');
  if (pathName) {
    dbName = pathName.split('?')[0];
  }
} catch (err) {
  // Fallback if URL parsing fails
}

async function exportDatabase() {
  const client = new MongoClient(mongoUri);

  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('Connected successfully!');

    const db = client.db(dbName);
    console.log(`Using database: ${dbName}`);

    // List all collections
    const collections = await db.listCollections().toArray();
    if (collections.length === 0) {
      console.log('No collections found in the database.');
      return;
    }

    const dumpDir = path.join(process.cwd(), 'db-dump');
    if (!fs.existsSync(dumpDir)) {
      fs.mkdirSync(dumpDir, { recursive: true });
    }

    console.log(`Exporting ${collections.length} collections...`);
    
    const consolidatedDump = {};

    for (const colInfo of collections) {
      const colName = colInfo.name;
      // Skip system collections if any
      if (colName.startsWith('system.')) continue;

      console.log(`- Fetching collection: ${colName}...`);
      const collection = db.collection(colName);
      const documents = await collection.find({}).toArray();
      
      console.log(`  Found ${documents.length} documents.`);

      // Write individual collection JSON
      const colFilePath = path.join(dumpDir, `${colName}.json`);
      fs.writeFileSync(colFilePath, JSON.stringify(documents, null, 2), 'utf-8');
      console.log(`  Saved to: db-dump/${colName}.json`);

      consolidatedDump[colName] = documents;
    }

    // Write consolidated database JSON
    const consolidatedPath = path.join(dumpDir, `${dbName}-full-dump.json`);
    fs.writeFileSync(consolidatedPath, JSON.stringify(consolidatedDump, null, 2), 'utf-8');
    console.log(`\nSuccess! Consolidated dump saved to: db-dump/${dbName}-full-dump.json`);
    console.log('Individual collection files are saved in the "db-dump" directory.');

  } catch (error) {
    console.error('An error occurred during database export:', error);
  } finally {
    await client.close();
  }
}

exportDatabase();
