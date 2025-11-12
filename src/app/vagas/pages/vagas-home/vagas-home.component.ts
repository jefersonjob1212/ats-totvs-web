import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { PoDividerModule, PoButtonModule, PoNotificationService, PoModalAction, PoModalComponent, PoTableColumn, PoTableColumnLabel, PoTableModule, PoModalModule } from "@po-ui/ng-components";
import { TipoVagaEnum } from '@vagas/enums/tipo-vaga.enum';
import { VagaFilterRequest } from '@vagas/models/requests/vaga-filter.request';
import { VagaResponse } from '@vagas/models/responses/vaga.response';
import { VagasService } from '@vagas/services/vagas.service';

@Component({
  selector: 'app-vagas-home',
  imports: [CommonModule, PoDividerModule, PoButtonModule, PoTableModule, PoModalModule],
  templateUrl: './vagas-home.component.html',
  styleUrl: './vagas-home.component.scss'
})
export class VagasHomeComponent implements OnInit {
  
  private readonly router = inject(Router);
  private readonly vagasService = inject(VagasService);
  private idVagaExcluir: string = '';

  poNotification = inject(PoNotificationService);

  isLoading: boolean = false;
  disableMoreRows = false;
  contentModal: string = '';
  
  vagas: Array<VagaResponse> = [];
  filter: VagaFilterRequest = new VagaFilterRequest({ PageNumber: 1, PageSize: 5, SomenteAtivas: false });
  
  @ViewChild(PoModalComponent, { static: true }) poModal!: PoModalComponent;
  
  primaryAction: PoModalAction = {
    action: () => {
      this.excluirVaga();
    },
    label: 'Sim',
    danger: true
  };
  
  primaryActionEncerrar: PoModalAction = {
    action: () => {
      this.encerrarVaga();
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
      property: 'encerrada',
      label: 'Status',
      type: 'columnTemplate'
    },
    {
      property: 'acoes', 
      label: 'Ações', 
      type: 'icon',
      icons: [
        { 
          value: 'editar', 
          icon: 'an an-pencil',
          action: this.editarVaga.bind(this), 
          tooltip: 'Editar' 
        },
        { 
          value: 'excluir', 
          icon: 'an an-trash',
          action: this.openModalExcluirVaga.bind(this), 
          tooltip: 'Excluir', 
          color: 'danger' 
        },
        {
          value: 'encerrar',
          icon: 'an an-lock',
          action: this.openModalEncerrarVaga.bind(this),
          tooltip: 'Encerrar Vaga'
        },
        {
          value: 'visualizar',
          icon: 'an an-eye',
          action: this.verCandidatos.bind(this),
          tooltip: 'Visualizar candidatos'
        }
      ]
    }
  ];

  ngOnInit(): void {
    this.loadVagas();
  }

  criarVaga(): void {
    this.router.navigate(['/vagas/novo']);
  }

  editarVaga(vaga: VagaResponse): void {
    this.router.navigate([`/vagas/editar/${vaga.id}`]);
  }

  openModalExcluirVaga(vaga: VagaResponse): void {
    this.idVagaExcluir = vaga.id;
    this.contentModal = `Tem certeza que deseja excluir a vaga "${vaga.titulo}"?`;
    this.poModal.title = 'Excluir Vaga';
    this.poModal.primaryAction = this.primaryAction;
    this.poModal.open();
  }

  excluirVaga(): void {
    this.isLoading = true;
    this.vagasService.excluir(this.idVagaExcluir).subscribe({
      next: () => {
        this.poNotification.success('Vaga excluída com sucesso!');
        this.poModal.close();
        this.loadVagas();
      },
      error: (error) => {
        this.poNotification.error('Erro ao excluir a vaga.');
        console.error('Erro ao excluir a vaga:', error);
        this.isLoading = false;
      }
    });
  }

  openModalEncerrarVaga(vaga: VagaResponse): void {
    this.idVagaExcluir = vaga.id;
    this.contentModal = `Tem certeza que deseja encerrar a vaga "${vaga.titulo}"?`;
    this.poModal.title = 'Encerrar Vaga';
    this.poModal.primaryAction = this.primaryActionEncerrar;
    this.poModal.open();
  }

  encerrarVaga(): void {
    this.isLoading = true;
    this.vagasService.encerrar(this.idVagaExcluir).subscribe({
      next: () => {
        this.poNotification.success('A vaga foi encerrada com sucesso!');
        this.poModal.close();
        this.loadVagas();
      },
      error: (error) => {
        this.poNotification.error('Erro ao encerrar a vaga.');
        console.error('Erro ao encerrar a vaga:', error);
        this.isLoading = false;
      }
    });
  }

  verCandidatos(vaga: VagaResponse): void {
    this.router.navigate([`/vagas/${vaga.id}/candidatos`]);
  }

  showMore() {
    this.filter = new VagaFilterRequest({
      PageNumber: this.filter.PageNumber,
      PageSize: this.filter.PageSize + 5,
      SomenteAtivas: false
    });

    this.loadVagas();
  }

  private loadVagas(): void {
    this.isLoading = true;
    this.vagasService.listar(this.filter).subscribe({
      next: (response) => {
        this.vagas = response.items;
        this.vagas.forEach(c => c.acoes = ['editar', 'excluir', 'encerrar', 'visualizar']);
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
