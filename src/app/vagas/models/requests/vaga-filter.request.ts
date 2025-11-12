import { FilterRequest } from '@shared/models/requests/filter.request';
import { TipoVagaEnum } from '@vagas/enums/tipo-vaga.enum';

export class VagaFilterRequest extends FilterRequest {
  public Titulo?: string;
  public Localizacao?: string;
  public TipoVaga?: TipoVagaEnum;
  public SomenteAtivas?: boolean;

  constructor(partial: Partial<VagaFilterRequest> = {}) {
    super(partial);
    this.Titulo = partial.Titulo;
    this.Localizacao = partial.Localizacao;
    this.TipoVaga = partial.TipoVaga;
    this.SomenteAtivas = partial.SomenteAtivas ?? false;
  }
}
