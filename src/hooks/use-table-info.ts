"use client";

import { PaginationState } from "@tanstack/react-table";
import { useCallback, useState } from "react";

type UseTableInfoType = {
  pageSize?: number;
};

export function useTableInfo<TData>(props: UseTableInfoType = {}) {
  const { pageSize = 10 } = props;
  const [data, setData] = useState<TData[]>([]);
  const [pageCount, setPageCount] = useState<number>(1);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  const setPageData = useCallback((data: TData[], totalPages: number) => {
    setData(data);
    setPageCount(totalPages);
  }, []);

  const paginationQuery = useCallback(() => {
    return {
      page: pagination.pageIndex + 1,
      size: pagination.pageSize,
    };
  }, [pagination.pageIndex, pagination.pageSize]);

  return {
    data,
    pageCount,
    pagination,
    setPagination,
    paginationQuery: paginationQuery(),
    setPageData,
  };
}
