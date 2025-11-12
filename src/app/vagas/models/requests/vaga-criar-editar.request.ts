import { TipoVagaEnum } from "@vagas/enums/tipo-vaga.enum";

export class VagaCriarEditarRequest {
  public titulo: string;
  public descricao: string;
  public localizacao: string;
  public tipoVaga: TipoVagaEnum;

  constructor(partial: Partial<VagaCriarEditarRequest> = {}) {
    this.titulo = partial.titulo ?? '';
    this.descricao = partial.descricao ?? '';
    this.localizacao = partial.localizacao ?? '';
    this.tipoVaga = partial.tipoVaga ?? TipoVagaEnum.Remoto;
  }
}
