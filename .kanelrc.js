const _path = require("node:path");
const generateZodSchemas = require("./scripts/kanel-zod-local").default;

/** @type {import('kanel').Config} */
module.exports = {
  connection: {
    host: "localhost",
    user: "postgres",
    password: "securedb",
    database: "e-commerce",
  },

  preDeleteOutputFolder: true,
  outputPath: "./src/schemas",

  customTypeMap: {
    "pg_catalog.tsvector": "string",
    "pg_catalog.bpchar": "string",
  },

  preRenderHooks: [generateZodSchemas],
};
