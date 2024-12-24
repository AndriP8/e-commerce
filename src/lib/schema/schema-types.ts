import { ZodSchema } from "zod";

export type PickPartial<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>> &
  Partial<Pick<T, K>>;

type GeneralSchema = {
  path: string;
  response: ZodSchema;
  body: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
};

type ReadData = Omit<GeneralSchema, "body">;
type ManipulationData = GeneralSchema;
export type SchemaType = {
  path: string;
  read: ReadData;
  readDetail: ReadData;
  create: ManipulationData;
  update: ManipulationData;
  delete: Omit<ManipulationData, "body">;
} & Record<string, ReadData | ManipulationData | string>;
