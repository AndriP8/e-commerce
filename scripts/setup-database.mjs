import dotenv from "dotenv";
import { readdirSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { Pool } from "pg";
import { fileURLToPath } from "url";

dotenv.config();

// Get the directory name in ES modules
const currentFilePath = fileURLToPath(import.meta.url);
const currentDir = dirname(currentFilePath);

// Create a connection pool using the DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function setupDatabase() {
  const client = await pool.connect();

  try {
    console.log("🚀 Starting database setup...\n");

    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(255) PRIMARY KEY,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const { rows } = await client.query(
      "SELECT version FROM schema_migrations ORDER BY version",
    );
    const executedMigrations = new Set(rows.map((r) => r.version));

    // Get all SQL files and sort them by name (ensures correct order)
    const sqlDir = currentDir;
    const sqlFiles = readdirSync(sqlDir)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    const pendingMigrations = sqlFiles.filter((file) => {
      const version = file.replace(".sql", "");
      return !executedMigrations.has(version);
    });

    if (pendingMigrations.length === 0) {
      console.log("✅ Database is up to date (no pending migrations)");
      return;
    }

    console.log(
      `📋 Found ${pendingMigrations.length} new migration(s) to execute:\n`,
    );
    pendingMigrations.forEach((file, index) => {
      console.log(`  ${index + 1}. ${file}`);
    });

    for (let i = 0; i < pendingMigrations.length; i++) {
      const file = pendingMigrations[i];
      const version = file.replace(".sql", "");

      try {
        console.log(
          `⏳ [${i + 1}/${pendingMigrations.length}] Executing ${file}...`,
        );

        const filePath = join(currentDir, file);
        const sql = readFileSync(filePath, "utf8");

        if (!sql.trim()) {
          console.log(`⚠️  ${file} is empty, skipping...`);
          continue;
        }

        await client.query("BEGIN");

        try {
          await client.query(sql);

          await client.query(
            "INSERT INTO schema_migrations (version) VALUES ($1)",
            [version],
          );

          await client.query("COMMIT");
          console.log(`✅ ${file} executed and recorded successfully`);
        } catch (migrationErr) {
          // Rollback transaction on error
          await client.query("ROLLBACK");
          console.error(`❌ Error executing ${file}:`, migrationErr.message);
          console.error(`   File: ${file}`);
          console.error(`   Error: ${migrationErr.message}`);
          throw migrationErr;
        }
      } catch (fileErr) {
        throw fileErr;
      }
    }

    console.log(
      `\n✅ Successfully executed ${pendingMigrations.length} migration(s)`,
    );
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
