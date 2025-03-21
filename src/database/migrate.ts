/* eslint-disable no-console */
import { promises as fs } from "fs";
import { FileMigrationProvider, MigrationResultSet, Migrator } from "kysely";
import * as path from "path";

import { db } from "./client";

type MigrationAction = "migrate" | "rollback" | "seed";

const runMigration = async (action: MigrationAction) => {
  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.join(__dirname, "migrations"),
    }),
  });

  if (action === "migrate") {
    const up = process.argv.find((arg) => arg.substring(0, 4) === "--up");
    const down = process.argv.find((arg) => arg.substring(0, 6) === "--down");
    let migrationResult: MigrationResultSet = {};

    if (up) {
      migrationResult = await migrator.migrateUp();
    } else if (down) {
      migrationResult = await migrator.migrateDown();
    } else {
      migrationResult = await migrator.migrateToLatest();
    }

    const { error, results } = migrationResult;

    results?.forEach((it) => {
      if (it.status === "Success") {
        console.info(
          `🍀 migration "${it.migrationName}" was executed successfully`,
        );
      } else if (it.status === "Error") {
        console.error(`🔥 failed to execute migration "${it.migrationName}"`);
      }
    });

    if (error) {
      console.error("🔥 failed to migrate");
      console.error(error);
      process.exit(1);
    }
  }
  if (action === "rollback") {
    const target = process.argv
      .find((arg) => arg.substring(0, 9) === "--target=")
      ?.split("--target=")[1];
    let migrationResult: MigrationResultSet = {};

    if (!target) {
      console.error("ERROR", ":::", "you must provide a target to rollback!");
      process.exit(1);
    }

    migrationResult = await migrator.migrateTo(target);
    const { error, results } = migrationResult;

    results?.forEach((it) => {
      if (it.status === "Success") {
        console.info(
          `🍀 migration "${it.migrationName}" was executed successfully`,
        );
      } else if (it.status === "Error") {
        console.error(`🔥 failed to rollback migration "${it.migrationName}"`);
      }
    });

    if (error) {
      console.error("🔥 failed to migrate");
      console.error(error);
      process.exit(1);
    }
  }
};

const runSeed = async () => {
  const filename = process.argv[3];
  try {
    if (!filename) {
      console.error("ERROR", ":::", "you must provide a filename to seed!");
      process.exit(1);
    }

    const seeder = await import(`./seeders/${filename}`);
    if (typeof seeder.default !== "function") {
      console.error("🔥 seeder file must default export a `seed` function.");
      process.exit(1);
    }
    await seeder.default(db);
    console.info(`🍀 seeder "${filename}" was executed successfully`);
  } catch (error) {
    console.error(`🔥 failed to seed ${filename}`);
    console.error(error);
    process.exit(1);
  }
};

const migrationAction = process.argv[2] as MigrationAction;

switch (migrationAction) {
  case "migrate":
    console.info("🍀 Running database migration...");
    runMigration("migrate");
    break;
  case "rollback":
    console.info("🍀 Rolling back migration...");
    runMigration("rollback");
    break;
  case "seed":
    console.info("🍀 Running database seeder...");
    runSeed();
    break;
  default:
    console.warn("🔥 Invalid argument provided!");
    break;
}
