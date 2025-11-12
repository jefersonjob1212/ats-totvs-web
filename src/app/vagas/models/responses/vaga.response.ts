import { TipoVagaEnum } from "@vagas/enums/tipo-vaga.enum";
import { VagasComCandidatoResponse } from "./vagas-com-candidato.response";

export class VagaResponse {
  public id: string;
  public titulo: string;
  public descricao: string;
  public localizacao: string;
  public dataPublicacao: Date;
  public tipoVaga: TipoVagaEnum;
  public encerrada: boolean;
  public acoes: string[];
  public details?: VagasComCandidatoResponse[];

  constructor(partial: Partial<VagaResponse> = {}) {
    this.id = partial.id ?? '';
    this.titulo = partial.titulo ?? '';
    this.descricao = partial.descricao ?? '';
    this.localizacao = partial.localizacao ?? '';
    this.dataPublicacao = partial.dataPublicacao ?? new Date();
    this.tipoVaga = partial.tipoVaga ?? TipoVagaEnum.Remoto;
    this.encerrada = partial.encerrada ?? false;
    this.acoes = partial.acoes ?? [];
    this.details = partial.details ?? [];
  }
}
