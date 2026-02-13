import pg from "pg";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const connectionString = "postgresql://postgres:securedb@localhost:5432/e-commerce";

const pool = new pg.Pool({ connectionString });

const typeMap = {
  integer: "z.number()",
  bigint: "z.string()",
  numeric: "z.coerce.number()",
  decimal: "z.coerce.number()",
  real: "z.coerce.number()",
  "double precision": "z.coerce.number()",
  "character varying": "z.string()",
  text: "z.string()",
  character: "z.string()",
  uuid: "z.string().uuid()",
  boolean: "z.boolean()",
  date: "z.date()",
  "timestamp without time zone": "z.date()",
  "timestamp with time zone": "z.date()",
  json: "z.any()",
  jsonb: "z.any()",
};

async function generate() {
  const client = await pool.connect();
  try {
    const schemas = [];

    // Get Enums
    const enumsResult = await client.query(`
      SELECT t.typname as name, json_agg(e.enumlabel ORDER BY e.enumsortorder) as values
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public'
      GROUP BY t.typname
    `);

    for (const row of enumsResult.rows) {
      const enumName = row.name.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      const zodName = enumName.charAt(0).toLowerCase() + enumName.slice(1) + "Schema";
      const values = row.values.map((v) => `'${v}'`).join(", ");
      schemas.push(`export const ${zodName} = z.enum([${values}]);`);
    }

    // Get Tables
    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      AND table_name NOT LIKE 'pg_%' AND table_name NOT LIKE 'sql_%'
    `);

    for (const table of tablesResult.rows) {
      const tableName = table.table_name;
      const columnsResult = await client.query(
        `
        SELECT column_name, data_type, is_nullable, udt_name
        FROM information_schema.columns
        WHERE table_name = $1 AND table_schema = 'public'
        ORDER BY ordinal_position
      `,
        [tableName],
      );

      const camelTableName = tableName.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      const zodName = camelTableName.charAt(0).toLowerCase() + camelTableName.slice(1) + "Schema";

      let zodFields = "";
      for (const col of columnsResult.rows) {
        let zodType = typeMap[col.data_type] || "z.any()";

        // Handle Enums correctly
        if (col.data_type === "USER-DEFINED") {
          const enumName = col.udt_name.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
          zodType = enumName.charAt(0).toLowerCase() + enumName.slice(1) + "Schema";
        }

        if (col.is_nullable === "YES") {
          zodType += ".nullable()";
        }
        zodFields += `  ${col.column_name}: ${zodType},\n`;
      }

      schemas.push(`export const ${zodName} = z.object({\n${zodFields}});`);

      // Also generate Initializer (Insert) schema - exclude id if serial/uuid might be generated, but simple for now
      const initializerZodName = zodName.replace("Schema", "InitializerSchema");
      schemas.push(`export const ${initializerZodName} = ${zodName};`);
    }

    const types = [];
    // Helper to capitalize first letter
    const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

    // Add Enum Types
    for (const row of enumsResult.rows) {
      const enumName = row.name.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      const typeName = capitalize(enumName);
      const zodName = enumName.charAt(0).toLowerCase() + enumName.slice(1) + "Schema";
      types.push(`export type ${typeName} = z.infer<typeof ${zodName}>;`);
    }

    // Add Table Types
    for (const table of tablesResult.rows) {
      const tableName = table.table_name;
      const camelTableName = tableName.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      const typeName = capitalize(camelTableName);
      const zodName = camelTableName.charAt(0).toLowerCase() + camelTableName.slice(1) + "Schema";

      types.push(`export type ${typeName} = z.infer<typeof ${zodName}>;`);
      types.push(
        `export type ${typeName}Initializer = z.infer<typeof ${zodName.replace("Schema", "InitializerSchema")}>;`,
      );
    }

    const output = `import { z } from "zod";\n\n${schemas.join("\n\n")}\n\n${types.join("\n")}\n`;

    mkdirSync("src/schemas", { recursive: true });
    writeFileSync("src/schemas/db-schemas.ts", output);
    console.log("Successfully generated src/schemas/db-schemas.ts");
  } finally {
    client.release();
    await pool.end();
  }
}

generate().catch(console.error);
