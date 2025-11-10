import { SexoEnum } from '@candidatos/enums/sexo.enum';

export class CandidatoCriarEditarRequest {
    public cpf: string;
    public nome: string;
    public email: string;
    public telefone: string;
    public sexo: SexoEnum;

    constructor(partial: Partial<CandidatoCriarEditarRequest> = {}) {
        this.cpf = partial.cpf ?? '';
        this.nome = partial.nome ?? '';
        this.email = partial.email ?? '';
        this.telefone = partial.telefone ?? '';
        this.sexo = partial.sexo ?? SexoEnum.NaoInformado;
    }
}