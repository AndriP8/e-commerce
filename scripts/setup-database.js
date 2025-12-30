import { Pool } from "pg";
import { readdirSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

// Get the directory name in ES modules
const currentFilePath = fileURLToPath(import.meta.url);
const currentDir = dirname(currentFilePath);

console.log(process.env.POSTGRES_USER);

// Create a connection pool using the DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function setupDatabase() {
  const client = await pool.connect();

  try {
    console.log("🚀 Starting database setup...\n");

    // Get all SQL files and sort them by name (ensures correct order)
    const sqlDir = currentDir;
    const sqlFiles = readdirSync(sqlDir)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    console.log("📋 Found SQL files to execute:");
    sqlFiles.forEach((file, index) => {
      console.log(`  ${index + 1}. ${file}`);
    });

    // Execute each SQL file
    try {
      // Begin transaction
      await client.query("BEGIN");

      for (let i = 0; i < sqlFiles.length; i++) {
        const file = sqlFiles[i];
        try {
          console.log(`⏳ [${i + 1}/${sqlFiles.length}] Executing ${file}...`);
          const filePath = join(currentDir, file);
          const sql = readFileSync(filePath, "utf8");

          // Skip empty files
          if (!sql.trim()) {
            console.log(`⚠️  ${file} is empty, skipping...`);
            continue;
          }

          // Execute the SQL query within transaction
          await client.query(sql);
          console.log(`✅ ${file} executed successfully`);
        } catch (fileErr) {
          // Rollback transaction on error
          await client.query("ROLLBACK");
          console.error(`❌ Error executing ${file}:`, fileErr.message);
          console.error(`   File: ${file}`);
          console.error(`   Error: ${fileErr.message}`);
          throw fileErr; // Re-throw to stop execution
        }
      }

      // Commit transaction if all queries succeed
      await client.query("COMMIT");
    } catch (err) {
      // Ensure rollback on any error
      await client.query("ROLLBACK");
      throw err;
    }

    console.log("\n🎉 Database setup completed successfully!");
  } catch (err) {
    console.error("\n💥 Error setting up database:", err.message);
    console.error("🔄 Database setup failed. Please fix the errors and try again.");
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

setupDatabase();
