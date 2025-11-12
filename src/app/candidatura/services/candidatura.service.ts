import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env';
import { VagasComCandidatoResponse } from '@vagas/models/responses/vagas-com-candidato.response';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CandidaturaService {
  
  private apiUrl = `${environment.apiUrl}/${environment.apiVersion}/Candidaturas`;
  private readonly httpClient = inject(HttpClient);

  buscarCandidaturaPorVagaId(vagaId: string): Observable<VagasComCandidatoResponse> {
    return this.httpClient.get<VagasComCandidatoResponse>(`${this.apiUrl}/vaga/${vagaId}`);
  }

  realizarInscricaoCandidato(candidatoId: string, vagaId: string) : Observable<{ id: string }> {
    return this.httpClient.post<string>(`${this.apiUrl}/vagas/${vagaId}/candidatos/${candidatoId}`, {})
        .pipe(map((response: any) => ({ id: response })));
  }

  removerInscricao(candidatoId: string, vagaId: string) : Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrl}/vagas/${vagaId}/candidatos/${candidatoId}`, {});
  }
}
