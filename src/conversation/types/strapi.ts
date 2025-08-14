export interface Pagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export interface StrapiResponseWithMeta<T> {
  data: T;
  meta: {
    pagination: Pagination;
  };
}
