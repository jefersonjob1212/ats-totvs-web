import { CandidatoResumoResponse } from "@candidatos/models/responses/candidato-resumo.response";

export class VagasComCandidatoResponse {
  public vagaId: string;
  public vagaTitulo: string;
  public dataPublicacao: Date;
  public candidatos: CandidatoResumoResponse[];

  constructor(partial: Partial<VagasComCandidatoResponse> = {}) {
    this.vagaId = partial.vagaId ?? '';
    this.vagaTitulo = partial.vagaTitulo ?? '';
    this.dataPublicacao = partial.dataPublicacao ?? new Date();
    this.candidatos = partial.candidatos ?? [];
  }
}
