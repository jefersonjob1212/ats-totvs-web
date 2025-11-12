import { JsonPipe } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SexoEnum } from '@candidatos/enums/sexo.enum';
import { CandidatoResponse } from '@candidatos/models/responses/candidato.response';
import { CandidatosService } from '@candidatos/services/candidatos.service';
import { CandidaturaService } from '@candidaturas/services/candidatura.service';
import { PoDynamicFormField, PoDynamicModule, PoPageModule, PoButtonModule, PoNotificationService, PoDividerModule, PoTableModule, PoTableColumn, PoTableColumnLabel, PoModalModule, PoModalAction, PoModalComponent } from "@po-ui/ng-components";
import { TipoVagaEnum } from '@vagas/enums/tipo-vaga.enum';
import { VagaFilterRequest } from '@vagas/models/requests/vaga-filter.request';
import { VagaResponse } from '@vagas/models/responses/vaga.response';
import { VagasService } from '@vagas/services/vagas.service';

@Component({
  selector: 'app-candidatar-vaga',
  imports: [PoDividerModule, PoDynamicModule, PoPageModule, PoButtonModule, PoTableModule, PoModalModule],
  templateUrl: './candidatar-vaga.component.html',
  styleUrl: './candidatar-vaga.component.scss'
})
export class CandidatarVagaComponent {
  private readonly router: Router = inject(Router);
  private readonly candidaturaService = inject(CandidaturaService);
  private readonly candidatoService = inject(CandidatosService);
  private readonly vagasService = inject(VagasService);
  disableMoreRows = false;

  poNotification = inject(PoNotificationService);

  candidato: CandidatoResponse | null = null;
  vagaSelecionada: VagaResponse | null = null;
  vagas: VagaResponse[] = [];
  contentModal: string = '';
  filter: VagaFilterRequest = new VagaFilterRequest({ PageNumber: 1, PageSize: 5, SomenteAtivas: true });
  
  @ViewChild(PoModalComponent, { static: true }) poModal!: PoModalComponent;
  
  primaryAction: PoModalAction = {
    action: () => {
      this.realizarInscricao();
    },
    label: 'Sim',
    danger: true
  };
  
  primaryActionRemover: PoModalAction = {
    action: () => {
      this.removerInscricao();
    },
    label: 'Sim',
    danger: true
  };

  secondaryAction: PoModalAction = {
    action: () => {
      this.poModal.close();
    },
    label: 'Não'
  };

  isLoading: boolean = false;

  fields: Array<PoDynamicFormField> = [
    {
      property: 'cpf',
      label: 'CPF',
      required: true,
      gridColumns: 6,
      gridSmColumns: 12,
      order: 1,
      placeholder: 'Informe um CPF válido',
      mask: '999.999.999-99'
    }
  ];
    
  public readonly columns: Array<PoTableColumn> = [
    { property: 'titulo', label: 'Vaga' },
    { property: 'localizacao', label: 'Localização' },
    { property: 'dataPublicacao', label: 'Data de publicação', type: 'date' },
    {
      property: 'tipoVaga',
      type: 'label', 
      label: 'Tipo de vaga',
      labels: <Array<PoTableColumnLabel>> [
        { value: TipoVagaEnum.Remoto, label: 'Remoto' },
        { value: TipoVagaEnum.Presencial, label: 'Presencial' },
        { value: TipoVagaEnum.Hibrido, label: 'Híbrido' }
      ]
    },
    {
      property: 'acoes', 
      label: 'Ações', 
      type: 'icon',
      icons: [
        { 
          value: 'candidatar', 
          icon: 'an an-user-circle-plus',
          action: this.abrirModalInscricao.bind(this), 
          tooltip: 'Candidatar a esta vaga' 
        },
        {
          value: 'remover',
          icon: 'an an-user-circle-minus',
          action: this.abrirModalRemoverInscricao.bind(this),
          tooltip: 'Remover candidatura'
        }
      ]
    }
  ];

  obterNomeCandidato(): string {
    let nome = '';
    nome += this.candidato && this.candidato.sexo === SexoEnum.Feminino ? 'Candidata' : 'Candidato';
    nome += ': ' + (this.candidato ? this.candidato.nome : '');
    return nome;
  }

  cancel(): void {
    this.router.navigate(['/candidatos']);
  }

  submitForm(form: any): void {
    this.isLoading = true;
    this.candidatoService.obterPorCpf(form.cpf).subscribe({
      next: (result) => {
        if (result && result.id) {
          this.candidato = result;
          this.loadVagas();
        } else {
          this.poNotification.error(`Candidato não encontrado.`);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error(error);
        if (error.status === 404) {
          this.poNotification.error(`Candidato não encontrado.`);
        } else {
          this.poNotification.error('Erro ao buscar candidato.');
        }
        this.isLoading = false;
      }
    });
  }

  abrirModalInscricao(vaga: VagaResponse) : void {
    this.poModal.title = 'Remover candidatura';
    this.vagaSelecionada = vaga;
    this.contentModal = `Deseja remover a inscrição 
          ${this.candidato?.sexo === SexoEnum.Feminino ? 'da candidata' : 'do candidato'} ${this.candidato?.nome}
          para a vaga ${this.vagaSelecionada.titulo}?`;

    this.poModal.primaryAction = this.primaryAction;
    this.poModal.open();
  }

  abrirModalRemoverInscricao(vaga: VagaResponse) : void {
    this.poModal.title = 'Realizar inscrição';
    this.vagaSelecionada = vaga;
    this.contentModal = `Deseja continuar com a inscrição 
          ${this.candidato?.sexo === SexoEnum.Feminino ? 'da candidata' : 'do candidato'} ${this.candidato?.nome}
          para a vaga ${this.vagaSelecionada.titulo}?`;

    this.poModal.primaryAction = this.primaryActionRemover;
    this.poModal.open();
  }

  showMore() {
    this.filter = new VagaFilterRequest({
      PageNumber: this.filter.PageNumber,
      PageSize: this.filter.PageSize + 5,
      SomenteAtivas: true
    });

    this.loadVagas();
  }

  private loadVagas(): void {
    this.isLoading = true;
    this.vagasService.listar(this.filter).subscribe({
      next: (response) => {
        this.vagas = response.items.filter(v => !v.encerrada);
        this.vagas.forEach(c => c.acoes = ['candidatar']);
        this.disableMoreRows = response.totalItems <= 5 || this.filter.PageSize >= response.totalItems;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar candidatos:', error);
        this.isLoading = false;
      }
    });
  }

  private realizarInscricao() : void {
    this.candidaturaService.realizarInscricaoCandidato(this.candidato?.id!, this.vagaSelecionada?.id!).subscribe({
      next: () => {
        this.poNotification.success('Candidatura realizada com sucesso');
        this.poModal.close();
        this.router.navigate(['/vagas']);
      }, error: (error) => {
        if(error.error && error.error.includes('Candidato já está concorrendo a esta vaga')) {
          this.poNotification.warning('Candidato já está concorrendo a esta vaga');
        } else {
          this.poNotification.error('Não foi possível realizar a candidatura. Tente novamente mais tarde');
          console.error(error);
        }
        this.poModal.close();
      }
    });
  }
  
  private removerInscricao() : void {
    this.candidaturaService.removerInscricao(this.candidato?.id!, this.vagaSelecionada?.id!).subscribe({
      next: () => {
        this.poNotification.success('Candidatura realizada com sucesso');
        this.router.navigate(['/']);
      }, error: (error) => {
        this.poNotification.error('Não foi possível realizar a candidatura. Tente novamente mais tarde');
        console.error(error);
      }
    });
  }

}
