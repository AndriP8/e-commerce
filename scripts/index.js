var __importDefault =
  (this && this.__importDefault) ||
  ((mod) => (mod && mod.__esModule ? mod : { default: mod }));
Object.defineProperty(exports, "__esModule", { value: true });
exports.zodCamelCaseHook =
  exports.defaultGetZodSchemaMetadata =
  exports.defaultGetZodIdentifierMetadata =
  exports.makeGenerateZodSchemas =
  exports.generateZodSchemas =
  exports.defaultZodTypeMap =
    void 0;
var defaultZodTypeMap_1 = require("./defaultZodTypeMap");
Object.defineProperty(exports, "defaultZodTypeMap", {
  enumerable: true,
  get: () => __importDefault(defaultZodTypeMap_1).default,
});
var generateZodSchemas_1 = require("./generateZodSchemas");
Object.defineProperty(exports, "generateZodSchemas", {
  enumerable: true,
  get: () => __importDefault(generateZodSchemas_1).default,
});
Object.defineProperty(exports, "makeGenerateZodSchemas", {
  enumerable: true,
  get: () => generateZodSchemas_1.makeGenerateZodSchemas,
});
var GenerateZodSchemasConfig_1 = require("./GenerateZodSchemasConfig");
Object.defineProperty(exports, "defaultGetZodIdentifierMetadata", {
  enumerable: true,
  get: () => GenerateZodSchemasConfig_1.defaultGetZodIdentifierMetadata,
});
Object.defineProperty(exports, "defaultGetZodSchemaMetadata", {
  enumerable: true,
  get: () => GenerateZodSchemasConfig_1.defaultGetZodSchemaMetadata,
});
var zodCamelCaseHook_1 = require("./zodCamelCaseHook");
Object.defineProperty(exports, "zodCamelCaseHook", {
  enumerable: true,
  get: () => zodCamelCaseHook_1.zodCamelCaseHook,
});
