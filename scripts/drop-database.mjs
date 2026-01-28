import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

// Create a connection pool using the DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function dropDatabase() {
  const client = await pool.connect();

  try {
    console.log("🚀 Starting database cleanup...\n");

    // Begin transaction
    await client.query("BEGIN");

    try {
      // Drop all tables in the public schema
      console.log("⏳ Retrieving all tables...");

      // Get all tables in the public schema
      const tablesResult = await client.query(`
        SELECT tablename FROM pg_tables WHERE schemaname = 'public';
      `);

      if (tablesResult.rows.length === 0) {
        console.log("ℹ️ No tables found in the database.");
      } else {
        console.log(`📋 Found ${tablesResult.rows.length} tables to drop:`);
        tablesResult.rows.forEach((row, index) => {
          console.log(`  ${index + 1}. ${row.tablename}`);
        });

        // Disable foreign key constraints temporarily
        await client.query("SET CONSTRAINTS ALL DEFERRED;");

        // Drop each table
        for (const row of tablesResult.rows) {
          const tableName = row.tablename;
          console.log(`⏳ Dropping table: ${tableName}...`);
          await client.query(`DROP TABLE IF EXISTS "${tableName}" CASCADE;`);
          console.log(`✅ Table ${tableName} dropped successfully`);
        }
      }

      // Get all sequences
      console.log("⏳ Retrieving all sequences...");
      const sequencesResult = await client.query(`
        SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public';
      `);

      if (sequencesResult.rows.length === 0) {
        console.log("ℹ️ No sequences found in the database.");
      } else {
        console.log(`📋 Found ${sequencesResult.rows.length} sequences to drop:`);
        sequencesResult.rows.forEach((row, index) => {
          console.log(`  ${index + 1}. ${row.sequence_name}`);
        });

        // Drop each sequence
        for (const row of sequencesResult.rows) {
          const sequenceName = row.sequence_name;
          console.log(`⏳ Dropping sequence: ${sequenceName}...`);
          await client.query(`DROP SEQUENCE IF EXISTS "${sequenceName}" CASCADE;`);
          console.log(`✅ Sequence ${sequenceName} dropped successfully`);
        }
      }

      // Get all enum types
      console.log("⏳ Retrieving all enum types...");
      const enumsResult = await client.query(`
        SELECT t.typname as enum_name
        FROM pg_type t 
        JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
        WHERE t.typtype = 'e' AND n.nspname = 'public';
      `);

      if (enumsResult.rows.length === 0) {
        console.log("ℹ️ No enum types found in the database.");
      } else {
        console.log(`📋 Found ${enumsResult.rows.length} enum types to drop:`);
        enumsResult.rows.forEach((row, index) => {
          console.log(`  ${index + 1}. ${row.enum_name}`);
        });

        // Drop each enum type
        for (const row of enumsResult.rows) {
          const enumName = row.enum_name;
          console.log(`⏳ Dropping enum type: ${enumName}...`);
          await client.query(`DROP TYPE IF EXISTS "${enumName}" CASCADE;`);
          console.log(`✅ Enum type ${enumName} dropped successfully`);
        }
      }

      // Commit transaction
      await client.query("COMMIT");
      console.log("\n🎉 Database cleanup completed successfully!");
    } catch (err) {
      // Rollback transaction on error
      await client.query("ROLLBACK");
      throw err;
    }
  } catch (err) {
    console.error("\n💥 Error cleaning up database:", err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

dropDatabase();
