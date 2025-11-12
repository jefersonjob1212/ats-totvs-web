import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { CandidaturaService } from './candidatura.service';
import { environment } from '@env';
import { VagasComCandidatoResponse } from '@vagas/models/responses/vagas-com-candidato.response';

describe('CandidaturaService', () => {
  let service: CandidaturaService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/${environment.apiVersion}/Candidaturas`;

  const mockCandidato1 = {
    id: '1',
    nome: 'João Silva',
    cpf: '123.456.789-00',
    email: 'joao@example.com',
    telefone: '(11) 99999-9999'
  };

  const mockCandidato2 = {
    id: '2',
    nome: 'Maria Santos',
    cpf: '987.654.321-00',
    email: 'maria@example.com',
    telefone: '(11) 88888-8888'
  };

  const mockVagasComCandidatosResponse: VagasComCandidatoResponse = {
    id: '1',
    vagaTitulo: 'Desenvolvedor Angular',
    candidatos: [mockCandidato1, mockCandidato2]
  } as any;

  const mockVagasComCandidatosVazios: VagasComCandidatoResponse = {
    id: '2',
    vagaTitulo: 'Desenvolvedor Backend',
    candidatos: []
  } as any;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), CandidaturaService]
    });
    service = TestBed.inject(CandidaturaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('buscarCandidaturaPorVagaId', () => {
    it('should fetch candidatos for a specific vaga', () => {
      const vagaId = '1';
      const expectedUrl = `${baseUrl}/vaga/${vagaId}`;

      service.buscarCandidaturaPorVagaId(vagaId).subscribe(response => {
        expect(response).toEqual(mockVagasComCandidatosResponse);
      });

      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockVagasComCandidatosResponse);
    });

    it('should return vaga with candidatos', () => {
      const vagaId = '1';
      const expectedUrl = `${baseUrl}/vaga/${vagaId}`;

      service.buscarCandidaturaPorVagaId(vagaId).subscribe(response => {
        expect((response as any).id).toBe('1');
        expect(response.vagaTitulo).toBe('Desenvolvedor Angular');
        expect(response.candidatos.length).toBe(2);
        expect(response.candidatos[0]).toEqual(mockCandidato1);
        expect(response.candidatos[1]).toEqual(mockCandidato2);
      });

      const req = httpMock.expectOne(expectedUrl);
      req.flush(mockVagasComCandidatosResponse);
    });

    it('should return vaga with empty candidatos list', () => {
      const vagaId = '2';
      const expectedUrl = `${baseUrl}/vaga/${vagaId}`;

      service.buscarCandidaturaPorVagaId(vagaId).subscribe(response => {
        expect(response.candidatos.length).toBe(0);
      });

      const req = httpMock.expectOne(expectedUrl);
      req.flush(mockVagasComCandidatosVazios);
    });

    it('should construct correct URL with vaga id', () => {
      const vagaId = 'test-vaga-123';
      const expectedUrl = `${baseUrl}/vaga/test-vaga-123`;

      service.buscarCandidaturaPorVagaId(vagaId).subscribe();

      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.url).toBe(expectedUrl);
      req.flush({});
    });

    it('should handle errors gracefully', () => {
      const vagaId = '999';
      const expectedUrl = `${baseUrl}/vaga/${vagaId}`;
      const errorMessage = 'Vaga não encontrada';

      service.buscarCandidaturaPorVagaId(vagaId).subscribe(
        () => fail('should have failed'),
        (error) => {
          expect(error.status).toBe(404);
        }
      );

      const req = httpMock.expectOne(expectedUrl);
      req.flush(errorMessage, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('realizarInscricaoCandidato', () => {
    it('should POST to correct endpoint and map response to { id }', () => {
      const candidatoId = '1';
      const vagaId = '1';
      const expectedUrl = `${baseUrl}/vagas/${vagaId}/candidatos/${candidatoId}`;
      const serverResponse = 'inscricao-id-123';

      service.realizarInscricaoCandidato(candidatoId, vagaId).subscribe(response => {
        expect(response).toEqual({ id: serverResponse });
      });

      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush(serverResponse);
    });

    it('should send empty body in POST request', () => {
      const candidatoId = '1';
      const vagaId = '1';
      const expectedUrl = `${baseUrl}/vagas/${vagaId}/candidatos/${candidatoId}`;

      service.realizarInscricaoCandidato(candidatoId, vagaId).subscribe();

      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.body).toEqual({});
      req.flush('new-inscricao-id');
    });

    it('should construct correct URL with candidato and vaga ids', () => {
      const candidatoId = 'candidato-123';
      const vagaId = 'vaga-456';
      const expectedUrl = `${baseUrl}/vagas/vaga-456/candidatos/candidato-123`;

      service.realizarInscricaoCandidato(candidatoId, vagaId).subscribe();

      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.url).toBe(expectedUrl);
      req.flush('inscricao-id');
    });

    it('should map plain string response to object with id property', () => {
      const candidatoId = '1';
      const vagaId = '1';
      const expectedUrl = `${baseUrl}/vagas/${vagaId}/candidatos/${candidatoId}`;
      const serverResponse = 'response-id-789';

      service.realizarInscricaoCandidato(candidatoId, vagaId).subscribe(response => {
        expect(response.id).toBe(serverResponse);
        expect(typeof response).toBe('object');
        expect(Object.keys(response)).toContain('id');
      });

      const req = httpMock.expectOne(expectedUrl);
      req.flush(serverResponse);
    });

    it('should handle error when candidato is already applying', () => {
      const candidatoId = '1';
      const vagaId = '1';
      const expectedUrl = `${baseUrl}/vagas/${vagaId}/candidatos/${candidatoId}`;
      const errorMessage = 'Candidato já está concorrendo a esta vaga';

      service.realizarInscricaoCandidato(candidatoId, vagaId).subscribe(
        () => fail('should have failed'),
        (error) => {
          expect(error.status).toBe(400);
        }
      );

      const req = httpMock.expectOne(expectedUrl);
      req.flush(errorMessage, { status: 400, statusText: 'Bad Request' });
    });

    it('should handle server error', () => {
      const candidatoId = '1';
      const vagaId = '1';
      const expectedUrl = `${baseUrl}/vagas/${vagaId}/candidatos/${candidatoId}`;

      service.realizarInscricaoCandidato(candidatoId, vagaId).subscribe(
        () => fail('should have failed'),
        (error) => {
          expect(error.status).toBe(500);
        }
      );

      const req = httpMock.expectOne(expectedUrl);
      req.flush('Internal Server Error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('removerInscricao', () => {
    it('should DELETE candidatura for a specific vaga', () => {
      const candidatoId = '1';
      const vagaId = '1';
      const expectedUrl = `${baseUrl}/vagas/${vagaId}/candidatos/${candidatoId}`;

      service.removerInscricao(candidatoId, vagaId).subscribe(response => {
        expect(response).toBeNull();
      });

      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should send DELETE request with empty body', () => {
      const candidatoId = '1';
      const vagaId = '1';
      const expectedUrl = `${baseUrl}/vagas/${vagaId}/candidatos/${candidatoId}`;

      service.removerInscricao(candidatoId, vagaId).subscribe();

      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.body).toEqual(null);
      req.flush(null);
    });

    it('should construct correct URL with candidato and vaga ids', () => {
      const candidatoId = 'candidato-456';
      const vagaId = 'vaga-789';
      const expectedUrl = `${baseUrl}/vagas/vaga-789/candidatos/candidato-456`;

      service.removerInscricao(candidatoId, vagaId).subscribe();

      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.url).toBe(expectedUrl);
      req.flush(null);
    });

    it('should handle error when candidatura not found', () => {
      const candidatoId = '999';
      const vagaId = '999';
      const expectedUrl = `${baseUrl}/vagas/${vagaId}/candidatos/${candidatoId}`;

      service.removerInscricao(candidatoId, vagaId).subscribe(
        () => fail('should have failed'),
        (error) => {
          expect(error.status).toBe(404);
        }
      );

      const req = httpMock.expectOne(expectedUrl);
      req.flush('Candidatura não encontrada', { status: 404, statusText: 'Not Found' });
    });

    it('should handle server error', () => {
      const candidatoId = '1';
      const vagaId = '1';
      const expectedUrl = `${baseUrl}/vagas/${vagaId}/candidatos/${candidatoId}`;

      service.removerInscricao(candidatoId, vagaId).subscribe(
        () => fail('should have failed'),
        (error) => {
          expect(error.status).toBe(500);
        }
      );

      const req = httpMock.expectOne(expectedUrl);
      req.flush('Internal Server Error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('Service Methods Integration', () => {
    it('should handle multiple sequential requests', () => {
      const vagaId = '1';
      const candidatoId = '1';

      // First request: buscar candidatos
      service.buscarCandidaturaPorVagaId(vagaId).subscribe();
      let req = httpMock.expectOne(`${baseUrl}/vaga/${vagaId}`);
      req.flush(mockVagasComCandidatosResponse);

      // Second request: realizar inscricao
      service.realizarInscricaoCandidato(candidatoId, vagaId).subscribe();
      req = httpMock.expectOne(`${baseUrl}/vagas/${vagaId}/candidatos/${candidatoId}`);
      req.flush('inscricao-id');

      // Third request: remover inscricao
      service.removerInscricao(candidatoId, vagaId).subscribe();
      req = httpMock.expectOne(`${baseUrl}/vagas/${vagaId}/candidatos/${candidatoId}`);
      req.flush(null);
    });
  });
});
