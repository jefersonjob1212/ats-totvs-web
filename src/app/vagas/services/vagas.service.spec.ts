import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { VagasService } from './vagas.service';
import { environment } from '@env';
import { TipoVagaEnum } from '@vagas/enums/tipo-vaga.enum';

describe('VagasService', () => {
  let service: VagasService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/${environment.apiVersion}/Vagas`;

  const mockVaga1 = {
    id: '1',
    titulo: 'Desenvolvedor Angular',
    descricao: 'Procuramos um desenvolvedor Angular',
    localizacao: 'São Paulo, SP',
    tipoVaga: TipoVagaEnum.Presencial,
    dataPublicacao: new Date('2025-01-01'),
    encerrada: false,
    acoes: ['editar', 'excluir']
  };

  const mockVaga2 = {
    id: '2',
    titulo: 'Desenvolvedor Backend',
    descricao: 'Procuramos um desenvolvedor Backend',
    localizacao: 'Rio de Janeiro, RJ',
    tipoVaga: TipoVagaEnum.Remoto,
    dataPublicacao: new Date('2025-01-05'),
    encerrada: false,
    acoes: ['editar', 'excluir']
  };

  const mockVagaEncerrada = {
    id: '3',
    titulo: 'Vaga Encerrada',
    descricao: 'Esta vaga foi encerrada',
    localizacao: 'Belo Horizonte, MG',
    tipoVaga: TipoVagaEnum.Hibrido,
    dataPublicacao: new Date('2024-12-01'),
    encerrada: true,
    acoes: []
  };

  const mockPagedResponse = {
    items: [mockVaga1, mockVaga2],
    totalItems: 2,
    pageNumber: 1,
    pageSize: 10,
    totalPages: 1
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), VagasService]
    });
    service = TestBed.inject(VagasService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('listar', () => {
    it('should fetch vagas with filter parameters', () => {
      const filter = {
        Titulo: 'Desenvolvedor',
        TipoVaga: 'Presencial',
        Localizacao: 'São Paulo',
        SomenteAtivas: true,
        PageNumber: 1,
        PageSize: 10
      } as any;

      service.listar(filter).subscribe(response => {
        expect(response).toEqual(mockPagedResponse);
      });

      const req = httpMock.expectOne(r => r.method === 'GET' && r.url === baseUrl);
      expect(req).toBeTruthy();

      // Verify encoded parameters
      expect(req.request.params.get('Titulo')).toEqual(encodeURIComponent(filter.Titulo));
      expect(req.request.params.get('TipoVaga')).toEqual(encodeURIComponent(filter.TipoVaga));
      expect(req.request.params.get('Localizacao')).toEqual(encodeURIComponent(filter.Localizacao));
      expect(req.request.params.get('SomenteAtivas')).toEqual(`${filter.SomenteAtivas}`);
      expect(req.request.params.get('PageNumber')).toEqual(`${filter.PageNumber}`);
      expect(req.request.params.get('PageSize')).toEqual(`${filter.PageSize}`);

      req.flush(mockPagedResponse);
    });

    it('should return paged response with vagas', () => {
      const filter = {
        PageNumber: 1,
        PageSize: 10
      } as any;

      service.listar(filter).subscribe(response => {
        expect(response.items.length).toBe(2);
        expect(response.totalItems).toBe(2);
        expect(response.pageNumber).toBe(1);
        expect(response.pageSize).toBe(10);
        expect(response.items[0]).toEqual(mockVaga1);
        expect(response.items[1]).toEqual(mockVaga2);
      });

      const req = httpMock.expectOne(r => r.method === 'GET' && r.url === baseUrl);
      req.flush(mockPagedResponse);
    });

    it('should construct correct URL with filter parameters', () => {
      const filter = {
        Titulo: 'teste',
        PageNumber: 2,
        PageSize: 5
      } as any;

      service.listar(filter).subscribe();

      const req = httpMock.expectOne(r => r.method === 'GET' && r.url === baseUrl);
      expect(req.request.url).toBe(baseUrl);
      expect(req.request.params.get('Titulo')).toBeDefined();
      expect(req.request.params.get('PageNumber')).toEqual('2');
      expect(req.request.params.get('PageSize')).toEqual('5');
      req.flush({});
    });

    it('should handle filters with only pagination parameters', () => {
      const filter = {
        PageNumber: 1,
        PageSize: 20
      } as any;

      service.listar(filter).subscribe();

      const req = httpMock.expectOne(r => r.method === 'GET' && r.url === baseUrl);
      expect(req.request.params.get('PageNumber')).toEqual('1');
      expect(req.request.params.get('PageSize')).toEqual('20');
      // Other optional parameters should not be present
      expect(req.request.params.get('Titulo')).toBeNull();
      req.flush({});
    });

    it('should return vagas with different tipos', () => {
      const filter = { PageNumber: 1, PageSize: 10 } as any;
      const responseWithDifferentTypes = {
        items: [
          { ...mockVaga1, tipoVaga: TipoVagaEnum.Presencial },
          { ...mockVaga2, tipoVaga: TipoVagaEnum.Remoto },
          { ...mockVagaEncerrada, tipoVaga: TipoVagaEnum.Hibrido }
        ],
        totalItems: 3,
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1
      };

      service.listar(filter).subscribe(response => {
        expect(response.items[0].tipoVaga).toBe(TipoVagaEnum.Presencial);
        expect(response.items[1].tipoVaga).toBe(TipoVagaEnum.Remoto);
        expect(response.items[2].tipoVaga).toBe(TipoVagaEnum.Hibrido);
      });

      const req = httpMock.expectOne(r => r.method === 'GET' && r.url === baseUrl);
      req.flush(responseWithDifferentTypes);
    });
  });

  describe('obterPorId', () => {
    it('should fetch vaga by id', () => {
      const id = '1';

      service.obterPorId(id).subscribe(response => {
        expect(response).toEqual(mockVaga1);
      });

      const req = httpMock.expectOne(`${baseUrl}/${id}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockVaga1);
    });

    it('should construct correct URL with vaga id', () => {
      const id = 'vaga-123';

      service.obterPorId(id).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/${id}`);
      expect(req.request.url).toBe(`${baseUrl}/${id}`);
      req.flush({});
    });

    it('should return vaga with all properties', () => {
      const id = '1';

      service.obterPorId(id).subscribe(response => {
        expect(response.id).toBe(mockVaga1.id);
        expect(response.titulo).toBe(mockVaga1.titulo);
        expect(response.descricao).toBe(mockVaga1.descricao);
        expect(response.localizacao).toBe(mockVaga1.localizacao);
        expect(response.tipoVaga).toBe(mockVaga1.tipoVaga);
        expect(response.encerrada).toBe(false);
      });

      const req = httpMock.expectOne(`${baseUrl}/${id}`);
      req.flush(mockVaga1);
    });

    it('should handle error when vaga not found', () => {
      const id = '999';

      service.obterPorId(id).subscribe(
        () => fail('should have failed'),
        (error) => {
          expect(error.status).toBe(404);
        }
      );

      const req = httpMock.expectOne(`${baseUrl}/${id}`);
      req.flush('Vaga não encontrada', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('criar', () => {
    it('should POST vaga and map response to { id }', () => {
      const vagaData = {
        titulo: 'Nova Vaga',
        descricao: 'Descrição da nova vaga',
        localizacao: 'São Paulo',
        tipoVaga: TipoVagaEnum.Presencial
      };
      const serverResponse = 'new-vaga-id-456';

      service.criar(vagaData as any).subscribe(response => {
        expect(response).toEqual({ id: serverResponse });
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(vagaData);
      req.flush(serverResponse);
    });

    it('should send correct POST body', () => {
      const vagaData = {
        titulo: 'Vaga Test',
        descricao: 'Test',
        localizacao: 'Test City',
        tipoVaga: TipoVagaEnum.Remoto
      };

      service.criar(vagaData as any).subscribe();

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body.titulo).toBe(vagaData.titulo);
      expect(req.request.body.descricao).toBe(vagaData.descricao);
      expect(req.request.body.localizacao).toBe(vagaData.localizacao);
      expect(req.request.body.tipoVaga).toBe(vagaData.tipoVaga);
      req.flush('id-123');
    });

    it('should map plain string response to object with id property', () => {
      const vagaData = {
        titulo: 'Vaga',
        descricao: 'Desc',
        localizacao: 'Local',
        tipoVaga: 1
      } as any;
      const serverResponse = 'response-id-789';

      service.criar(vagaData).subscribe(response => {
        expect(response.id).toBe(serverResponse);
        expect(typeof response).toBe('object');
        expect(Object.keys(response)).toContain('id');
      });

      const req = httpMock.expectOne(baseUrl);
      req.flush(serverResponse);
    });

    it('should handle error when creating vaga', () => {
      const vagaData = {
        titulo: 'Vaga',
        descricao: 'Desc',
        localizacao: 'Local',
        tipoVaga: 1
      } as any;

      service.criar(vagaData).subscribe(
        () => fail('should have failed'),
        (error) => {
          expect(error.status).toBe(400);
        }
      );

      const req = httpMock.expectOne(baseUrl);
      req.flush('Dados inválidos', { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('atualizar', () => {
    it('should PUT vaga and return updated vaga', () => {
      const id = '1';
      const vagaData = {
        titulo: 'Vaga Atualizada',
        descricao: 'Descrição atualizada',
        localizacao: 'São Paulo',
        tipoVaga: TipoVagaEnum.Hibrido
      };
      const mockResponse = { ...mockVaga1, ...vagaData };

      service.atualizar(id, vagaData as any).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/${id}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(vagaData);
      req.flush(mockResponse);
    });

    it('should construct correct URL with vaga id', () => {
      const id = 'vaga-upd-123';
      const vagaData = {
        titulo: 'Teste',
        descricao: 'Teste',
        localizacao: 'Teste',
        tipoVaga: 1
      } as any;

      service.atualizar(id, vagaData).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/${id}`);
      expect(req.request.url).toBe(`${baseUrl}/${id}`);
      req.flush({});
    });

    it('should send correct PUT body', () => {
      const id = '1';
      const vagaData = {
        titulo: 'Updated Title',
        descricao: 'Updated Description',
        localizacao: 'Updated Location',
        tipoVaga: 3
      } as any;

      service.atualizar(id, vagaData).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/${id}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(vagaData);
      req.flush({});
    });

    it('should handle error when updating vaga', () => {
      const id = '999';
      const vagaData = {
        titulo: 'Test',
        descricao: 'Test',
        localizacao: 'Test',
        tipoVaga: 1
      } as any;

      service.atualizar(id, vagaData).subscribe(
        () => fail('should have failed'),
        (error) => {
          expect(error.status).toBe(404);
        }
      );

      const req = httpMock.expectOne(`${baseUrl}/${id}`);
      req.flush('Vaga não encontrada', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('excluir', () => {
    it('should DELETE vaga by id', () => {
      const id = '1';

      service.excluir(id).subscribe(response => {
        expect(response).toBeNull();
      });

      const req = httpMock.expectOne(`${baseUrl}/${id}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should construct correct URL with vaga id', () => {
      const id = 'vaga-del-123';

      service.excluir(id).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/${id}`);
      expect(req.request.url).toBe(`${baseUrl}/${id}`);
      req.flush(null);
    });

    it('should send DELETE request without body', () => {
      const id = '1';

      service.excluir(id).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/${id}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should handle error when deleting vaga', () => {
      const id = '999';

      service.excluir(id).subscribe(
        () => fail('should have failed'),
        (error) => {
          expect(error.status).toBe(404);
        }
      );

      const req = httpMock.expectOne(`${baseUrl}/${id}`);
      req.flush('Vaga não encontrada', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('encerrar', () => {
    it('should PATCH vaga to close it', () => {
      const id = '1';
      const mockEncerradaResponse = { ...mockVaga1, encerrada: true };

      service.encerrar(id).subscribe(response => {
        expect(response).toEqual(mockEncerradaResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/${id}/encerrar`);
      expect(req.request.method).toBe('PATCH');
      req.flush(mockEncerradaResponse);
    });

    it('should construct correct URL with vaga id', () => {
      const id = 'vaga-encerrar-123';

      service.encerrar(id).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/${id}/encerrar`);
      expect(req.request.url).toBe(`${baseUrl}/${id}/encerrar`);
      req.flush({});
    });

    it('should send PATCH request with empty body', () => {
      const id = '1';

      service.encerrar(id).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/${id}/encerrar`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({});
      req.flush({});
    });

    it('should return vaga with encerrada flag set to true', () => {
      const id = '1';
      const mockResponse = { ...mockVaga1, encerrada: true };

      service.encerrar(id).subscribe(response => {
        expect(response.encerrada).toBe(true);
        expect(response.id).toBe(mockVaga1.id);
        expect(response.titulo).toBe(mockVaga1.titulo);
      });

      const req = httpMock.expectOne(`${baseUrl}/${id}/encerrar`);
      req.flush(mockResponse);
    });

    it('should handle error when closing vaga', () => {
      const id = '999';

      service.encerrar(id).subscribe(
        () => fail('should have failed'),
        (error) => {
          expect(error.status).toBe(404);
        }
      );

      const req = httpMock.expectOne(`${baseUrl}/${id}/encerrar`);
      req.flush('Vaga não encontrada', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('Service Methods Integration', () => {
    it('should handle multiple sequential requests', () => {
      const id = '1';
      const filter = { PageNumber: 1, PageSize: 10 } as any;

      // First request: listar
      service.listar(filter).subscribe();
      let req = httpMock.expectOne(r => r.method === 'GET' && r.url === baseUrl);
      req.flush(mockPagedResponse);

      // Second request: obterPorId
      service.obterPorId(id).subscribe();
      req = httpMock.expectOne(`${baseUrl}/${id}`);
      req.flush(mockVaga1);

      // Third request: criar
      service.criar({
        titulo: 'Nova',
        descricao: 'Nova',
        localizacao: 'Nova',
        tipoVaga: 1
      } as any).subscribe();
      req = httpMock.expectOne(baseUrl);
      req.flush('new-id');

      // Fourth request: atualizar
      service.atualizar(id, {
        titulo: 'Atualizada',
        descricao: 'Atualizada',
        localizacao: 'Atualizada',
        tipoVaga: 2
      } as any).subscribe();
      req = httpMock.expectOne(`${baseUrl}/${id}`);
      req.flush(mockVaga1);

      // Fifth request: encerrar
      service.encerrar(id).subscribe();
      req = httpMock.expectOne(`${baseUrl}/${id}/encerrar`);
      req.flush(mockVaga1);

      // Sixth request: excluir
      service.excluir(id).subscribe();
      req = httpMock.expectOne(`${baseUrl}/${id}`);
      req.flush(null);
    });
  });

  describe('Query Parameter Encoding', () => {
    it('should encode titulo parameter', () => {
      const filter = {
        Titulo: 'Desenvolvedor & Arquiteto',
        PageNumber: 1,
        PageSize: 10
      } as any;

      service.listar(filter).subscribe();

      const req = httpMock.expectOne(r => r.method === 'GET' && r.url === baseUrl);
      expect(req.request.params.get('Titulo')).toEqual(encodeURIComponent('Desenvolvedor & Arquiteto'));
      req.flush({});
    });

    it('should encode localizacao parameter', () => {
      const filter = {
        Localizacao: 'São Paulo, SP',
        PageNumber: 1,
        PageSize: 10
      } as any;

      service.listar(filter).subscribe();

      const req = httpMock.expectOne(r => r.method === 'GET' && r.url === baseUrl);
      expect(req.request.params.get('Localizacao')).toEqual(encodeURIComponent('São Paulo, SP'));
      req.flush({});
    });

    it('should encode tipoVaga parameter', () => {
      const filter = {
        TipoVaga: 'Home Office',
        PageNumber: 1,
        PageSize: 10
      } as any;

      service.listar(filter).subscribe();

      const req = httpMock.expectOne(r => r.method === 'GET' && r.url === baseUrl);
      expect(req.request.params.get('TipoVaga')).toEqual(encodeURIComponent('Home Office'));
      req.flush({});
    });
  });
});
