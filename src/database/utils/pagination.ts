import { SelectExpression, SelectQueryBuilder, sql } from "kysely";
type PaginationType = {
  page: number;
  size: number;
};

const DEFAULT_SIZE = 10;
const DEFAULT_PAGE = 1;
export function paginate<DB, TB extends keyof DB, O>(
  query: SelectQueryBuilder<DB, TB, O>,
  opts: PaginationType,
): SelectQueryBuilder<DB, TB, O> {
  const page = opts.page || DEFAULT_PAGE;
  const size = opts.size || DEFAULT_SIZE;
  return query.offset((page - 1) * size).limit(size);
}

export async function getPaginationInfo<DB, TB extends keyof DB, O>(
  baseQuery: SelectQueryBuilder<DB, TB, O>,
  opts: PaginationType,
  currentSize: number,
  queryOptions?: {
    distinctOn?: SelectExpression<DB, TB>;
  },
) {
  const results = await (baseQuery as SelectQueryBuilder<object, never, object>)
    .select(
      sql
        .raw<number>(
          `count(${
            queryOptions?.distinctOn
              ? "DISTINCT " + queryOptions.distinctOn
              : "*"
          })`,
        )
        .as("rows"),
    )
    .executeTakeFirst();

  const { rows } = results ?? { rows: 0 };
  const page = opts.page || DEFAULT_PAGE;
  const size = opts.size || DEFAULT_SIZE;

  return {
    size: Number(currentSize) || 10,
    page: Number(page) || 1,
    totalSize: Number(rows) ?? 0,
    totalPages: Math.ceil((rows ?? 0) / size),
  };
}
