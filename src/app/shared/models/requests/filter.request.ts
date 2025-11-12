export abstract class FilterRequest {
    public PageNumber: number;
    public PageSize: number;

    constructor(partial: Partial<FilterRequest> = {}) {
        this.PageNumber = partial.PageNumber ?? 1;
        this.PageSize = partial.PageSize ?? 5;
    }
}
