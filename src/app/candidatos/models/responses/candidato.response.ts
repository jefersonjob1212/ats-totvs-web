import { SexoEnum } from "../../enums/sexo.enum";

export class CandidatoResponse {
    public id: string;
    public cpf: string;
    public nome: string;
    public email: string;
    public telefone: string;
    public sexo: SexoEnum;
    public acoes: any[];

    constructor(partial: Partial<CandidatoResponse> = {}) {
        this.id = partial.id ?? '';
        this.cpf = partial.cpf ?? '';
        this.nome = partial.nome ?? '';
        this.email = partial.email ?? '';
        this.telefone = partial.telefone ?? '';
        this.sexo = partial.sexo ?? SexoEnum.NaoInformado;
        this.acoes = partial.acoes ?? ['editar', 'excluir'];
    }
}