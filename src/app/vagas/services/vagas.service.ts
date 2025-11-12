import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env';
import { PagedResponse } from '@shared/models/responses/paged.response';
import { VagaCriarEditarRequest } from '@vagas/models/requests/vaga-criar-editar.request';
import { VagaFilterRequest } from '@vagas/models/requests/vaga-filter.request';
import { VagaResponse } from '@vagas/models/responses/vaga.response';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VagasService {

  private apiUrl = `${environment.apiUrl}/${environment.apiVersion}/Vagas`;
  private readonly httpClient = inject(HttpClient);

  listar(filter: VagaFilterRequest) : Observable<PagedResponse<VagaResponse>> {
    const params = this.montarQueryParams(filter);
    return this.httpClient.get<PagedResponse<VagaResponse>>(this.apiUrl, { params });
  }

  obterPorId(id: string): Observable<VagaResponse> {
    return this.httpClient.get<VagaResponse>(`${this.apiUrl}/${id}`);
  }

  criar(vaga: VagaCriarEditarRequest): Observable<{ id: string }> {
    return this.httpClient.post<string>(this.apiUrl, vaga)
          .pipe(map((response: any) => ({ id: response })));
  }

  atualizar(id: string, vaga: VagaCriarEditarRequest): Observable<VagaResponse> {
    return this.httpClient.put<VagaResponse>(`${this.apiUrl}/${id}`, vaga);
  }

  excluir(id: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrl}/${id}`);
  }

  encerrar(id: string): Observable<VagaResponse> {
    return this.httpClient.patch<VagaResponse>(`${this.apiUrl}/${id}/encerrar`, {});
  }

  private montarQueryParams(filter: VagaFilterRequest): HttpParams {
    let params: HttpParams = new HttpParams();
    if (filter.Titulo) {
      params = params.append('Titulo', `${encodeURIComponent(filter.Titulo)}`);
    }
    if (filter.TipoVaga) {
      params = params.append('TipoVaga',`${encodeURIComponent(filter.TipoVaga)}`);
    }
    if (filter.Localizacao) {
      params = params.append('Localizacao',`${encodeURIComponent(filter.Localizacao)}`);
    }
    if(filter.SomenteAtivas) {
      params = params.append('SomenteAtivas', `${filter.SomenteAtivas}`);
    }
    params = params.append('PageNumber', `${filter.PageNumber}`);
    params = params.append('PageSize', `${filter.PageSize}`);
    return params;
  }

}
