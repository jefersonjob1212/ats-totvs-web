import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { CandidatosService } from './candidatos.service';
import { environment } from '@env';

describe('CandidatosService', () => {
  let service: CandidatosService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/${environment.apiVersion}/Candidatos`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), CandidatosService]
    });
    service = TestBed.inject(CandidatosService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('listar should perform GET with encoded query params and return paged response', () => {
    const filter = {
      Nome: 'João Silva',
      Email: 'joao.silva@example.com',
      Telefone: '(11) 99999-9999',
      PageNumber: 2,
      PageSize: 5
    } as any;

    const mockResponse = { items: [{ id: '1', nome: 'João' }], total: 1, pageNumber: 2, pageSize: 5 } as any;

    service.listar(filter).subscribe(resp => {
      expect(resp).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(r => r.method === 'GET' && r.url === baseUrl);
    expect(req).toBeTruthy();

    // Service encodes values before appending them to HttpParams
    expect(req.request.params.get('Nome')).toEqual(`${encodeURIComponent(filter.Nome)}`);
    expect(req.request.params.get('Email')).toEqual(`${encodeURIComponent(filter.Email)}`);
    expect(req.request.params.get('Telefone')).toEqual(`${encodeURIComponent(filter.Telefone)}`);
    expect(req.request.params.get('PageNumber')).toEqual(`${filter.PageNumber}`);
    expect(req.request.params.get('PageSize')).toEqual(`${filter.PageSize}`);

    req.flush(mockResponse);
  });

  it('obterPorId should GET the candidato by id', () => {
    const id = 'abc-123';
    const mockCandidato = { id, nome: 'Maria' } as any;

    service.obterPorId(id).subscribe(resp => expect(resp).toEqual(mockCandidato));

    const req = httpMock.expectOne(`${baseUrl}/${id}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockCandidato);
  });

  it('criar should POST and map response to { id }', () => {
    const payload = { nome: 'Novo' } as any;
    const serverResponse = 'new-id-456';

    service.criar(payload).subscribe(res => {
      expect(res).toEqual({ id: serverResponse });
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    // server returns plain string id
    req.flush(serverResponse);
  });

  it('editar should PUT to /{id} and return the updated candidato', () => {
    const id = 'upd-1';
    const payload = { nome: 'Atualizado' } as any;
    const mockResp = { id, nome: 'Atualizado' } as any;

    service.editar(id, payload).subscribe(resp => expect(resp).toEqual(mockResp));

    const req = httpMock.expectOne(`${baseUrl}/${id}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    req.flush(mockResp);
  });

  it('excluir should DELETE /{id} and return void', () => {
    const id = 'del-1';

    service.excluir(id).subscribe(resp => expect(resp).toBeNull());

    const req = httpMock.expectOne(`${baseUrl}/${id}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
