import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CandidatoCriarEditarRequest } from '@candidatos/models/requests/candidato-criar-editar.request';
import { CandidatoFilterRequest } from '@candidatos/models/requests/candidato-filter.request';
import { CandidatoResponse } from '@candidatos/models/responses/candidato.response';
import { environment } from '@env';
import { PagedResponse } from '@shared/models/responses/paged.response';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CandidatosService {
  
  private baseUrl: string = `${environment.apiUrl}/${environment.apiVersion}/Candidatos`;
  private httpClient: HttpClient = inject(HttpClient);

  public listar(filter: CandidatoFilterRequest): Observable<PagedResponse<CandidatoResponse>> {
    const params = this.montarQueryParams(filter);
    return this.httpClient.get<PagedResponse<CandidatoResponse>>(this.baseUrl, { params });
  }

  public obterPorId(id: string): Observable<CandidatoResponse> {
    return this.httpClient.get<CandidatoResponse>(`${this.baseUrl}/${id}`);
  }

  public criar(candidato: CandidatoCriarEditarRequest): Observable<{ id: string }> {
    return this.httpClient.post<string>(this.baseUrl, candidato)
      .pipe(map((response: any) => ({ id: response })));
  }

  public editar(id: string, candidato: CandidatoCriarEditarRequest): Observable<CandidatoResponse> {
    return this.httpClient.put<CandidatoResponse>(`${this.baseUrl}/${id}`, candidato);
  }

  public excluir(id: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.baseUrl}/${id}`);
  }

  private montarQueryParams(filter: CandidatoFilterRequest): HttpParams {
    let params: HttpParams = new HttpParams();
    if (filter.Nome) {
      params = params.append('Nome', `${encodeURIComponent(filter.Nome)}`);
    }
    if (filter.Email) {
      params = params.append('Email',`${encodeURIComponent(filter.Email)}`);
    }
    if (filter.Telefone) {
      params = params.append('Telefone',`${encodeURIComponent(filter.Telefone)}`);
    }
    params = params.append('PageNumber', `${filter.PageNumber}`);
    params = params.append('PageSize', `${filter.PageSize}`);
    return params;
  }
}
