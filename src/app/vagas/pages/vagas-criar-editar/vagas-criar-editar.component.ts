import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PoDynamicFormField, PoNotificationService, PoPageModule, PoDynamicModule, PoButtonModule } from '@po-ui/ng-components';
import { VagaCriarEditarRequest } from '@vagas/models/requests/vaga-criar-editar.request';
import { VagasService } from '@vagas/services/vagas.service';
import { iif } from 'rxjs';

@Component({
  selector: 'app-vagas-criar-editar',
  imports: [PoPageModule, PoDynamicModule, PoButtonModule],
  templateUrl: './vagas-criar-editar.component.html',
  styleUrl: './vagas-criar-editar.component.scss'
})
export class VagasCriarEditarComponent {

  private readonly router: Router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly vagasService = inject(VagasService);
  private vagaId: string | null = null;
  private isEditMode: boolean = false;

  poNotification = inject(PoNotificationService);
  vagaSelecionada: VagaCriarEditarRequest | null = null;
  title: string = 'Criar Vaga';
  isLoading: boolean = false;

  fields: Array<PoDynamicFormField> = [
    { 
      property: 'titulo', 
      label: 'Título da Vaga',
      required: true, 
      gridColumns: 12, 
      order: 1, 
      placeholder: 'Informe o título da vaga' 
    },
    {
      property: 'descricao', 
      label: 'Descrição da Vaga', 
      required: true,
      gridColumns: 12, 
      rows: 5,
      order: 2,
      placeholder: 'Descreva as responsabilidades e requisitos da vaga'
    },
    {
      property: 'localizacao',
      label: 'Localização',
      required: true,
      gridColumns: 6,
      gridSmColumns: 12,
      order: 3,
      placeholder: 'Informe a localização da vaga (ex: São Paulo-SP)'
    },
    {
      property: 'tipoVaga',
      label: 'Tipo de Vaga',
      required: true,
      gridColumns: 6,
      gridSmColumns: 12,
      order: 4,
      options: [
        { label: 'Remoto', value: 1 },
        { label: 'Presencial', value: 2 },
        { label: 'Híbrido', value: 3 }
      ]
    }
  ];

  constructor() {
    this.activatedRoute.paramMap.subscribe(params => {
      this.vagaId = params.get('id');
      this.isEditMode = !!this.vagaId;
      this.title = this.isEditMode ? 'Editar Vaga' : 'Criar Vaga';
      if (this.isEditMode && this.vagaId) {
        this.buscarVagaPorId(this.vagaId);
      }
    });
  }

  submitForm(vagaData: VagaCriarEditarRequest): void {
    this.isLoading = true;
    iif(() => this.isEditMode && this.vagaId !== null,
      this.vagasService.atualizar(this.vagaId!, vagaData),
      this.vagasService.criar(vagaData)).subscribe({
        next: () => {
          const acao = this.isEditMode ? 'atualizada' : 'criada';
          this.poNotification.success(`Vaga ${acao} com sucesso!`);
          this.isLoading = false;
          this.router.navigate(['/vagas']);
        },
        error: (error) => {
          this.poNotification.error(`Erro ao ${this.isEditMode ? 'atualizar' : 'criar'} a vaga.`);
          console.error(`Erro ao ${this.isEditMode ? 'atualizar' : 'criar'} vaga:`, error);
          this.isLoading = false;
        }
      });
  }

  cancel(): void {
    this.router.navigate(['/vagas']);
  }

  private buscarVagaPorId(id: string): void {
    this.isLoading = true;
    this.vagasService.obterPorId(id).subscribe({
      next: (vaga) => {
        this.vagaSelecionada = new VagaCriarEditarRequest({
          titulo: vaga.titulo,
          descricao: vaga.descricao,
          localizacao: vaga.localizacao,
          tipoVaga: vaga.tipoVaga
        });
        this.isLoading = false;
      },
      error: (error) => {
        this.poNotification.error('Erro ao carregar os dados da vaga.');
        console.error('Erro ao carregar vaga:', error);
        this.isLoading = false;
      }
    });
  }

}
