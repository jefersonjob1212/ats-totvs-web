import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SexoEnum } from '@candidatos/enums/sexo.enum';
import { CandidatoFilterRequest } from '@candidatos/models/requests/candidato-filter.request';
import { CandidatoResponse } from '@candidatos/models/responses/candidato.response';
import { CandidatosService } from '@candidatos/services/candidatos.service';
import { PoDividerModule, PoButtonModule, PoTableModule, PoTableColumn, PoTableColumnLabel, PoModalModule, PoModalAction, PoModalComponent, PoNotificationService } from "@po-ui/ng-components";
import { CpfPipe } from '@shared/pipes/cpf.pipe';
import { TelefonePipe } from '@shared/pipes/telefone.pipe';
import { NgClass } from "../../../../../node_modules/@angular/common/common_module.d-NEF7UaHr";

@Component({
  selector: 'app-candidatos-home',
  imports: [PoDividerModule, PoButtonModule, PoTableModule, CpfPipe, TelefonePipe, PoModalModule],
  templateUrl: './candidatos-home.component.html',
  styleUrl: './candidatos-home.component.scss'
})
export class CandidatosHomeComponent implements OnInit {

  private readonly candidatosService = inject(CandidatosService);
  private readonly router = inject(Router);
  private idCandidatoExcluir: string = '';
  
  poNotification = inject(PoNotificationService);

  isLoading: boolean = false;
  disableMoreRows = false;
  contentModal: string = '';
  filter: CandidatoFilterRequest = new CandidatoFilterRequest({ PageNumber: 1, PageSize: 5 });

  primaryAction: PoModalAction = {
    action: () => {
      this.excluirCandidato();
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

  candidatos: Array<CandidatoResponse> = [];
  
  @ViewChild(PoModalComponent, { static: true }) poModal!: PoModalComponent;

  public readonly columns: Array<PoTableColumn> = [
    { property: 'cpf', label: 'CPF', type: 'columnTemplate' },
    { property: 'nome', label: 'Nome' },
    { property: 'email', label: 'E-mail' },
    { property: 'telefone', label: 'Telefone', type: 'columnTemplate', },
    {
      property: 'sexo',
      type: 'label', 
      label: 'Sexo',      
      labels: <Array<PoTableColumnLabel>> [
        { value: SexoEnum.Masculino, label: 'Masculino' },
        { value: SexoEnum.Feminino, label: 'Feminino' },
        { value: SexoEnum.Outro, label: 'Outro' },
        { value: SexoEnum.NaoInformado, label: 'Não Informado' }
      ]
    },
    {
      property: 'acoes', 
      label: 'Ações', 
      type: 'icon',
      icons: [
        { 
          value: 'editar', 
          icon: 'an an-pencil',
          action: this.editarCandidato.bind(this), 
          tooltip: 'Editar' 
        },
        { 
          value: 'excluir', 
          icon: 'an an-trash',
          action: this.openModalExcluirCandidato.bind(this), 
          tooltip: 'Excluir', 
          color: 'danger' 
        }
      ]
    }
  ];

  ngOnInit(): void {
    this.loadCandidatos();
  }

  criarCandidato(): void {
    this.router.navigate(['/candidatos/novo']);
  }

  editarCandidato(candidato: CandidatoResponse): void {
    this.router.navigate([`/candidatos/editar/${candidato.id}`]);
  }

  openModalExcluirCandidato(candidato: CandidatoResponse): void {
    this.poModal.title = 'Excluir Candidato';
    this.contentModal = `Tem certeza que deseja excluir ${candidato.sexo === SexoEnum.Feminino ? 'a candidata' : 'o candidato'} ${candidato.nome}?`;
    this.idCandidatoExcluir = candidato.id;
    this.poModal.open();
  }

  excluirCandidato(): void {
    this.isLoading = true;
    this.candidatosService.excluir(this.idCandidatoExcluir).subscribe({
      next: () => {
        this.poNotification.success('Candidato excluído com sucesso!');
        this.poModal.close();
        this.loadCandidatos();
      },
      error: (error) => {
        this.poNotification.error('Erro ao excluir o candidato.');
        console.error('Erro ao excluir candidato:', error);
        this.isLoading = false;
      }
    });
  }

  showMore() {
    this.filter = new CandidatoFilterRequest({
      PageNumber: this.filter.PageNumber,
      PageSize: this.filter.PageSize + 5
    });

    this.loadCandidatos();
  }

  private loadCandidatos(): void {
    this.isLoading = true;
    this.candidatosService.listar(this.filter).subscribe({
      next: (response) => {
        this.candidatos = response.items;
        this.candidatos.forEach(c => c.acoes = ['editar', 'excluir']);
        this.disableMoreRows = response.totalItems <= 5 || this.filter.PageSize >= response.totalItems;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar candidatos:', error);
        this.isLoading = false;
      }
    });
  }    
}
