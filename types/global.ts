export { };

declare global {
    interface Pagination {
        count: number;
        current_page: number;
        per_page: number;
        total: number;
        total_pages: number;
    }
    interface Role {
        name: string;
        id?: number;
    }

    interface Permission {
        name: string;
        id?: number;
    }

}