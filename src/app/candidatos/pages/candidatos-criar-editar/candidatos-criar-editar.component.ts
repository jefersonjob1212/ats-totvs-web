import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CandidatoCriarEditarRequest } from '@candidatos/models/requests/candidato-criar-editar.request';
import { CandidatosService } from '@candidatos/services/candidatos.service';
import { PoDynamicFormField, PoDynamicModule, PoNotificationService, PoPageModule, PoButtonModule } from '@po-ui/ng-components';
import { iif } from 'rxjs';

@Component({
  selector: 'app-candidatos-criar-editar',
  imports: [PoPageModule, PoDynamicModule, PoButtonModule],
  templateUrl: './candidatos-criar-editar.component.html',
  styleUrl: './candidatos-criar-editar.component.scss'
})
export class CandidatosCriarEditarComponent {
  
  private readonly router: Router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly candidatosService = inject(CandidatosService);
  private candidatoId: string | null = null;
  private isEditMode: boolean = false;

  poNotification = inject(PoNotificationService);
  candidatoSelecionado: CandidatoCriarEditarRequest | null = null;
  title: string = 'Criar Candidato';
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
    },
    { 
      property: 'nome', 
      label: 'Nome', 
      required: true, 
      gridColumns: 6, 
      gridSmColumns: 12, 
      order: 1, 
      placeholder: 'Nome completo' 
    },
    { 
      property: 'email', 
      label: 'E-mail', 
      required: true, 
      gridColumns: 6, 
      type: 'email' 
    },
    { 
      property: 'telefone', 
      label: 'Telefone', 
      gridColumns: 6, 
      mask: '(99) 99999-9999' 
    },
    {
      property: 'sexo',
      label: 'Gênero',
      gridColumns: 6,
      gridSmColumns: 12,
      options: [
        { value: 1, label: 'Masculino' },
        { value: 2, label: 'Feminino' },
        { value: 3, label: 'Outro' },
        { value: 4, label: 'Não Informado' }
      ],
    }
  ]

  constructor() {
    this.activatedRoute.paramMap.subscribe(params => {
      this.candidatoId = params.get('id');
      this.isEditMode = !!this.candidatoId;
      this.title = this.isEditMode ? 'Editar Candidato' : 'Criar Candidato';
      if (this.isEditMode) {
        this.loadCandidatoData(this.candidatoId!);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/candidatos']);
  }

  submitForm(candidatoData: CandidatoCriarEditarRequest): void {
    this.isLoading = true;
    iif(() => this.isEditMode,
      this.candidatosService.editar(this.candidatoId!, candidatoData),
      this.candidatosService.criar(candidatoData)).subscribe({
        next: (result) => {
          this.poNotification.success(`Candidato ${this.isEditMode ? 'alterado' : 'criado'} com sucesso!`);
          this.isLoading = false;
          this.router.navigate(['/candidatos']);
        },
        error: (error) => {
          // Handle error
          this.poNotification.error(`Erro ao ${this.isEditMode ? 'alterar' : 'criar'} o candidato.`);
          console.error(error);
          this.isLoading = false;
        }
      });
  }

  private loadCandidatoData(candidatoId: string): void {
    this.isLoading = true;
    this.candidatosService.obterPorId(candidatoId).subscribe({
      next: (candidato) => {
        this.candidatoSelecionado = new CandidatoCriarEditarRequest({
          cpf: candidato.cpf,
          nome: candidato.nome,
          email: candidato.email,
          telefone: candidato.telefone,
          sexo: candidato.sexo
        });
        this.isLoading = false;
      },
      error: (error) => {
        // Handle error
        this.poNotification.error(`Erro ao ${this.isEditMode ? 'alterar' : 'criar'} o candidato.`);
        console.error(error);
        this.isLoading = false;
      }
    });
  }

}
