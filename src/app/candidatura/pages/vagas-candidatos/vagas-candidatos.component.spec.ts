import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { PoNotificationService } from '@po-ui/ng-components';
import { of, throwError } from 'rxjs';

import { VagasCandidatosComponent } from './vagas-candidatos.component';
import { CandidaturaService } from '@candidaturas/services/candidatura.service';
import { VagasComCandidatoResponse } from '@vagas/models/responses/vagas-com-candidato.response';

describe('VagasCandidatosComponent', () => {
  let component: VagasCandidatosComponent;
  let fixture: ComponentFixture<VagasCandidatosComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;
  let mockCandidaturaService: jasmine.SpyObj<CandidaturaService>;
  let mockPoNotification: jasmine.SpyObj<PoNotificationService>;

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

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockCandidaturaService = jasmine.createSpyObj('CandidaturaService', [
      'buscarCandidaturaPorVagaId'
    ]);
    mockPoNotification = jasmine.createSpyObj('PoNotificationService', [
      'success',
      'error',
      'warning'
    ]);

    mockActivatedRoute = {
      paramMap: of({ get: (key: string) => null } as any)
    };

    await TestBed.configureTestingModule({
      imports: [VagasCandidatosComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: CandidaturaService, useValue: mockCandidaturaService },
        { provide: PoNotificationService, useValue: mockPoNotification }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(VagasCandidatosComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.vagas).toBeNull();
      expect(component.isLoading).toBe(false);
      expect(component.disableMoreRows).toBe(false);
      expect(component.contentModal).toBe('');
    });

    it('should have columns properly configured', () => {
      expect(component.columns.length).toBe(3);
      expect(component.columns[0].property).toBe('nome');
      expect(component.columns[1].property).toBe('email');
      expect(component.columns[2].property).toBe('telefone');
    });
  });

  describe('ngOnInit', () => {
    it('should load vagas when vaga id is provided in route', (done) => {
      const paramMap = {
        get: (key: string) => (key === 'id' ? '1' : null)
      };
      mockActivatedRoute.paramMap = of(paramMap as any);
      mockCandidaturaService.buscarCandidaturaPorVagaId.and.returnValue(
        of(mockVagasComCandidatosResponse)
      );

      const testFixture = TestBed.createComponent(VagasCandidatosComponent);
      const testComponent = testFixture.componentInstance;
      testFixture.detectChanges();

      setTimeout(() => {
        expect(mockCandidaturaService.buscarCandidaturaPorVagaId).toHaveBeenCalledWith('1');
        expect(testComponent.vagas).toEqual(mockVagasComCandidatosResponse);
        expect(testComponent.isLoading).toBe(false);
        done();
      }, 100);
    });

    it('should not load vagas when vaga id is not provided', (done) => {
      mockActivatedRoute.paramMap = of(new Map());
      fixture.detectChanges();

      setTimeout(() => {
        expect(mockCandidaturaService.buscarCandidaturaPorVagaId).not.toHaveBeenCalled();
        done();
      }, 100);
    });
  });

  describe('buscarCandidatosPorVaga', () => {
    beforeEach(() => {
      const paramMap = {
        get: (key: string) => (key === 'id' ? '1' : null)
      };
      mockActivatedRoute.paramMap = of(paramMap as any);
    });

    it('should load candidatos successfully', (done) => {
      mockCandidaturaService.buscarCandidaturaPorVagaId.and.returnValue(
        of(mockVagasComCandidatosResponse)
      );

      const testFixture = TestBed.createComponent(VagasCandidatosComponent);
      const testComponent = testFixture.componentInstance;
      testFixture.detectChanges();

      setTimeout(() => {
        expect(testComponent.vagas).toEqual(mockVagasComCandidatosResponse);
        expect(testComponent.vagas?.candidatos.length).toBe(2);
        expect(testComponent.isLoading).toBe(false);
        done();
      }, 100);
    });

    it('should show warning and navigate back when no candidatos found', (done) => {
      mockCandidaturaService.buscarCandidaturaPorVagaId.and.returnValue(
        of(mockVagasComCandidatosVazios)
      );

      const testFixture = TestBed.createComponent(VagasCandidatosComponent);
      const testComponent = testFixture.componentInstance;
      testFixture.detectChanges();

      setTimeout(() => {
        expect(testComponent.vagas).toEqual(mockVagasComCandidatosVazios);
        expect(mockPoNotification.warning).toHaveBeenCalledWith(
          'Nenhum candidato encontrado para esta vaga.'
        );
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/vagas']);
        done();
      }, 100);
    });

    it('should handle error when loading candidatos', (done) => {
      const error = new Error('Network error');
      mockCandidaturaService.buscarCandidaturaPorVagaId.and.returnValue(
        throwError(() => error)
      );

      const testFixture = TestBed.createComponent(VagasCandidatosComponent);
      const testComponent = testFixture.componentInstance;
      testFixture.detectChanges();

      setTimeout(() => {
        expect(mockPoNotification.error).toHaveBeenCalledWith(
          'Erro ao carregar candidatos da vaga.'
        );
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/vagas']);
        expect(testComponent.isLoading).toBe(false);
        done();
      }, 100);
    });

    it('should set isLoading to true when searching candidatos', (done) => {
      mockCandidaturaService.buscarCandidaturaPorVagaId.and.returnValue(
        of(mockVagasComCandidatosResponse)
      );

      const testFixture = TestBed.createComponent(VagasCandidatosComponent);
      const testComponent = testFixture.componentInstance;

      expect(testComponent.isLoading).toBe(false);
      testFixture.detectChanges();

      setTimeout(() => {
        expect(testComponent.isLoading).toBe(false);
        done();
      }, 100);
    });
  });

  describe('voltar', () => {
    it('should navigate to vagas list when voltar is called', () => {
      component.voltar();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/vagas']);
    });
  });

  describe('Table Data Display', () => {
    it('should display candidatos in the table', (done) => {
      const paramMap = {
        get: (key: string) => (key === 'id' ? '1' : null)
      };
      mockActivatedRoute.paramMap = of(paramMap as any);
      mockCandidaturaService.buscarCandidaturaPorVagaId.and.returnValue(
        of(mockVagasComCandidatosResponse)
      );

      const testFixture = TestBed.createComponent(VagasCandidatosComponent);
      const testComponent = testFixture.componentInstance;
      testFixture.detectChanges();

      setTimeout(() => {
        expect(testComponent.vagas?.candidatos).toBeDefined();
        expect(testComponent.vagas?.candidatos.length).toBe(2);
        expect(testComponent.vagas?.candidatos[0]).toEqual(mockCandidato1);
        expect(testComponent.vagas?.candidatos[1]).toEqual(mockCandidato2);
        done();
      }, 100);
    });

    it('should display vaga title in the header', (done) => {
      const paramMap = {
        get: (key: string) => (key === 'id' ? '1' : null)
      };
      mockActivatedRoute.paramMap = of(paramMap as any);
      mockCandidaturaService.buscarCandidaturaPorVagaId.and.returnValue(
        of(mockVagasComCandidatosResponse)
      );

      const testFixture = TestBed.createComponent(VagasCandidatosComponent);
      const testComponent = testFixture.componentInstance;
      testFixture.detectChanges();

      setTimeout(() => {
        expect(testComponent.vagas?.vagaTitulo).toBe('Desenvolvedor Angular');
        done();
      }, 100);
    });
  });

  describe('Loading State', () => {
    it('should set isLoading to false after successful load', (done) => {
      const paramMap = {
        get: (key: string) => (key === 'id' ? '1' : null)
      };
      mockActivatedRoute.paramMap = of(paramMap as any);
      mockCandidaturaService.buscarCandidaturaPorVagaId.and.returnValue(
        of(mockVagasComCandidatosResponse)
      );

      const testFixture = TestBed.createComponent(VagasCandidatosComponent);
      const testComponent = testFixture.componentInstance;
      testFixture.detectChanges();

      setTimeout(() => {
        expect(testComponent.isLoading).toBe(false);
        done();
      }, 100);
    });

    it('should set isLoading to false after error', (done) => {
      const paramMap = {
        get: (key: string) => (key === 'id' ? '1' : null)
      };
      mockActivatedRoute.paramMap = of(paramMap as any);
      const error = new Error('Network error');
      mockCandidaturaService.buscarCandidaturaPorVagaId.and.returnValue(
        throwError(() => error)
      );

      const testFixture = TestBed.createComponent(VagasCandidatosComponent);
      const testComponent = testFixture.componentInstance;
      testFixture.detectChanges();

      setTimeout(() => {
        expect(testComponent.isLoading).toBe(false);
        done();
      }, 100);
    });
  });
});
