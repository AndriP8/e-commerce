import { SelectQueryBuilder, sql } from "kysely";
type PaginationType = {
  page: number;
  size: number;
};

export function paginate<DB, TB extends keyof DB, O>(
  query: SelectQueryBuilder<DB, TB, O>,
  opts: PaginationType,
): SelectQueryBuilder<DB, TB, O> {
  if (!opts.page || !opts.size) {
    throw new Error("page and size must be defined");
  }
  return query.offset((opts.page - 1) * opts.size).limit(opts.size);
}

export async function getPaginationInfo<DB, TB extends keyof DB, O>(
  baseQuery: SelectQueryBuilder<DB, TB, O>,
  opts: PaginationType,
  currentSize: number,
) {
  if (!opts.page || !opts.size) {
    throw new Error("page and size must be defined");
  }
  const results = await (baseQuery as SelectQueryBuilder<object, never, object>)
    .select(sql.raw<number>(`count(*)`).as("rows"))
    .executeTakeFirst();

  const { rows } = results ?? { rows: 0 };

  return {
    size: Number(currentSize),
    page: Number(opts.page),
    totalSize: Number(rows) ?? 0,
    totalPages: Math.ceil((rows ?? 0) / opts.size),
  };
}
