import { FilterRequest } from "@shared/models/requests/filter.request";

export class CandidatoFilterRequest extends FilterRequest {
    public Nome?: string;
    public Email?: string;
    public Telefone?: string;

    constructor(partial: Partial<CandidatoFilterRequest> = {}) {
        super(partial);
        this.Nome = partial.Nome;
        this.Email = partial.Email;
        this.Telefone = partial.Telefone;
    }
}