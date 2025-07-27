import { Pool } from "pg";
import { readdirSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// Get the directory name in ES modules
const currentFilePath = fileURLToPath(import.meta.url);
const currentDir = dirname(currentFilePath);

// Create a connection pool using the same config as your application
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 5432,
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

        // Print the SQL query instead of executing it
        console.log(`\n--- SQL Query for ${file} ---\n`);
        console.log(sql);
        console.log(`\n--- End of SQL Query for ${file} ---\n`);
        await client.query(sql);
        console.log(`✅ ${file} executed successfully`);
      } catch (fileErr) {
        console.error(`❌ Error executing ${file}:`, fileErr.message);
        console.error(`   File: ${file}`);
        console.error(`   Error: ${fileErr.message}`);
        throw fileErr; // Re-throw to stop execution
      }
    }

    console.log("\n🎉 Database setup completed successfully!");
  } catch (err) {
    console.error("\n💥 Error setting up database:", err.message);
    console.error(
      "🔄 Database setup failed. Please fix the errors and try again.",
    );
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
