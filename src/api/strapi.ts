import { StrapiResponse } from "strapi-sdk-js";

export interface Pagination {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
}

export interface StrapiResponseWithMeta<T> extends StrapiResponse<T> {
    meta: {
        pagination: Pagination;
    };
}
