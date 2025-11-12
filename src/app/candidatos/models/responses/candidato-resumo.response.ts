export class CandidatoResumoResponse {
  public id: string;
  public nome: string;
  public email: string;
  public telefone: string;

  constructor(partial: Partial<CandidatoResumoResponse> = {}) {
    this.id = partial.id ?? '';
    this.nome = partial.nome ?? '';
    this.email = partial.email ?? '';
    this.telefone = partial.telefone ?? '';
  }
}
