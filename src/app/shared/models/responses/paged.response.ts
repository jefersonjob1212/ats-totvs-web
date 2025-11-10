export class PagedResponse<T> {
    public items: T[];
    public pageNumber: number;
    public pageSize: number;
    public totalItems: number;
    public totalPages: number;
    
    constructor(partial: Partial<PagedResponse<T>> = {}) {
        this.items = partial.items ?? [];
        this.totalItems = partial.totalItems ?? 0;
        this.pageNumber = partial.pageNumber ?? 1;
        this.pageSize = partial.pageSize ?? 10;
        this.totalPages = partial.totalPages ?? 0;
    }
}