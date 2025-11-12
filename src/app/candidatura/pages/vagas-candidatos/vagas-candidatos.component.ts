import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CandidaturaService } from '@candidaturas/services/candidatura.service';
import { PoDividerModule, PoButtonModule, PoTableModule, PoModalModule, PoTableColumn, PoNotificationService } from "@po-ui/ng-components";
import { CpfPipe } from '@shared/pipes/cpf.pipe';
import { TelefonePipe } from '@shared/pipes/telefone.pipe';
import { VagasComCandidatoResponse } from '@vagas/models/responses/vagas-com-candidato.response';

@Component({
  selector: 'app-vagas-candidatos',
  imports: [PoDividerModule, PoButtonModule, PoTableModule, PoModalModule, CpfPipe, TelefonePipe],
  templateUrl: './vagas-candidatos.component.html',
  styleUrl: './vagas-candidatos.component.scss'
})
export class VagasCandidatosComponent implements OnInit {

  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly candidaturaService = inject(CandidaturaService);
  private vagaId: string | null = null;

  poNotification = inject(PoNotificationService);

  isLoading: boolean = false;
  disableMoreRows = false;
  contentModal: string = '';

  vagas: VagasComCandidatoResponse | null = null;

  public readonly columns: Array<PoTableColumn> = [
      { property: 'nome', label: 'Nome' },
      { property: 'email', label: 'E-mail' },
      { property: 'telefone', label: 'Telefone', type: 'columnTemplate', }
    ];

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      this.vagaId = params.get('id');
      if (this.vagaId) {
        this.buscarCandidatosPorVaga(this.vagaId);
      }
    });
  }

  voltar(): void {
    this.router.navigate([`/vagas`]);
  }

  private buscarCandidatosPorVaga(vagaId: string): void {
    this.isLoading = true;
    this.candidaturaService.buscarCandidaturaPorVagaId(vagaId).subscribe({
      next: (response) => {
        this.vagas = response;
        this.isLoading = false;
        if(this.vagas.candidatos.length === 0) {
          this.poNotification.warning('Nenhum candidato encontrado para esta vaga.');
          this.voltar();
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.poNotification.error('Erro ao carregar candidatos da vaga.');
        console.error(error);
        this.voltar();
      }
    });
  }

}
