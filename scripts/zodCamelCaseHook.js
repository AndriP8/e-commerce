Object.defineProperty(exports, "__esModule", { value: true });
exports.zodCamelCaseHook = void 0;
const recase_1 = require("@kristiandupont/recase");
const toCamelCase = (0, recase_1.recase)(null, "camel");
const zodCamelCaseHook = (output) => {
  const transformInterfaceDeclaration = (declaration) => ({
    ...declaration,
    properties: declaration.properties.map((property) => ({
      ...property,
      name: toCamelCase(property.name),
    })),
  });
  const transformValue = (value) =>
    Array.isArray(value) && value.includes("z.object({")
      ? value.map(toCamelCase)
      : value;
  const transformDeclarations = (declarations) =>
    declarations.map((declaration) => {
      if (declaration.declarationType === "interface") {
        return transformInterfaceDeclaration(declaration);
      }
      if (declaration.value) {
        return {
          ...declaration,
          value: transformValue(declaration.value),
        };
      }
      return declaration;
    });
  const outputWithCamelCase = Object.fromEntries(
    Object.entries(output).map(([path, fileContents]) => {
      if (fileContents.fileType !== "typescript") {
        throw new Error(`Path ${path} is not a typescript file`);
      }
      return [
        path,
        {
          ...fileContents,
          declarations: transformDeclarations(fileContents.declarations),
        },
      ];
    }),
  );
  return outputWithCamelCase;
};
exports.zodCamelCaseHook = zodCamelCaseHook;
