const path = require("path");

/** @type {import('kanel').Config} */
module.exports = {
  connection: {
    host: "localhost",
    user: "postgres",
    database: "ecommerce",
  },

  preDeleteOutputFolder: true,
  outputPath: "./src/schemas",

  customTypeMap: {
    "pg_catalog.tsvector": "string",
    "pg_catalog.bpchar": "string",
  },
};
