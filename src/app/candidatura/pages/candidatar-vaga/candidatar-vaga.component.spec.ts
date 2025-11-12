import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { PoNotificationService } from '@po-ui/ng-components';
import { of, throwError } from 'rxjs';

import { CandidatarVagaComponent } from './candidatar-vaga.component';
import { CandidatosService } from '@candidatos/services/candidatos.service';
import { CandidaturaService } from '@candidaturas/services/candidatura.service';
import { VagasService } from '@vagas/services/vagas.service';
import { CandidatoResponse } from '@candidatos/models/responses/candidato.response';
import { VagaResponse } from '@vagas/models/responses/vaga.response';
import { SexoEnum } from '@candidatos/enums/sexo.enum';
import { TipoVagaEnum } from '@vagas/enums/tipo-vaga.enum';

describe('CandidatarVagaComponent', () => {
  let component: CandidatarVagaComponent;
  let fixture: ComponentFixture<CandidatarVagaComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockCandidatosService: jasmine.SpyObj<CandidatosService>;
  let mockCandidaturaService: jasmine.SpyObj<CandidaturaService>;
  let mockVagasService: jasmine.SpyObj<VagasService>;
  let mockPoNotification: jasmine.SpyObj<PoNotificationService>;

  const mockCandidato: CandidatoResponse = {
    id: '1',
    cpf: '123.456.789-00',
    nome: 'João Silva',
    email: 'joao@example.com',
    telefone: '(11) 99999-9999',
    sexo: SexoEnum.Masculino
  } as any;

  const mockCandidatoFeminino: CandidatoResponse = {
    id: '2',
    cpf: '987.654.321-00',
    nome: 'Maria Santos',
    email: 'maria@example.com',
    telefone: '(11) 88888-8888',
    sexo: SexoEnum.Feminino
  } as any;

  const mockVaga1: VagaResponse = {
    id: '1',
    titulo: 'Desenvolvedor Angular',
    localizacao: 'São Paulo, SP',
    dataPublicacao: new Date('2025-01-01'),
    tipoVaga: TipoVagaEnum.Presencial,
    encerrada: false,
    acoes: ['candidatar', 'remover']
  } as any;

  const mockVaga2: VagaResponse = {
    id: '2',
    titulo: 'Desenvolvedor Backend',
    localizacao: 'Rio de Janeiro, RJ',
    dataPublicacao: new Date('2025-01-05'),
    tipoVaga: TipoVagaEnum.Remoto,
    encerrada: false,
    acoes: ['candidatar', 'remover']
  } as any;

  const mockVagaEncerrada: VagaResponse = {
    id: '3',
    titulo: 'Vaga Encerrada',
    localizacao: 'Belo Horizonte, MG',
    dataPublicacao: new Date('2024-12-01'),
    tipoVaga: TipoVagaEnum.Hibrido,
    encerrada: true,
    acoes: []
  } as any;

  const mockPagedVagasResponse = {
    items: [mockVaga1, mockVaga2, mockVagaEncerrada],
    totalItems: 3,
    pageNumber: 1,
    pageSize: 5,
    totalPages: 1
  };

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockCandidatosService = jasmine.createSpyObj('CandidatosService', ['obterPorCpf']);
    mockCandidaturaService = jasmine.createSpyObj('CandidaturaService', [
      'realizarInscricaoCandidato',
      'removerInscricao'
    ]);
    mockVagasService = jasmine.createSpyObj('VagasService', ['listar']);
    mockPoNotification = jasmine.createSpyObj('PoNotificationService', [
      'success',
      'error',
      'warning'
    ]);

    mockVagasService.listar.and.returnValue(of(mockPagedVagasResponse));

    await TestBed.configureTestingModule({
      imports: [CandidatarVagaComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: mockRouter },
        { provide: CandidatosService, useValue: mockCandidatosService },
        { provide: CandidaturaService, useValue: mockCandidaturaService },
        { provide: VagasService, useValue: mockVagasService },
        { provide: PoNotificationService, useValue: mockPoNotification }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CandidatarVagaComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with correct default values', () => {
      expect(component.candidato).toBeNull();
      expect(component.vagaSelecionada).toBeNull();
      expect(component.vagas.length).toBe(0);
      expect(component.isLoading).toBe(false);
      expect(component.disableMoreRows).toBe(false);
    });

    it('should have correct filter initial values', () => {
      expect(component.filter.PageNumber).toBe(1);
      expect(component.filter.PageSize).toBe(5);
      expect(component.filter.SomenteAtivas).toBe(true);
    });

    it('should have columns properly configured', () => {
      expect(component.columns.length).toBe(5);
      expect(component.columns[0].property).toBe('titulo');
      expect(component.columns[1].property).toBe('localizacao');
      expect(component.columns[2].property).toBe('dataPublicacao');
      expect(component.columns[3].property).toBe('tipoVaga');
      expect(component.columns[4].property).toBe('acoes');
    });

    it('should have cpf field configured', () => {
      expect(component.fields.length).toBe(1);
      expect(component.fields[0].property).toBe('cpf');
      expect(component.fields[0].required).toBe(true);
    });

    it('should have modal actions configured', () => {
      expect(component.primaryAction.label).toBe('Sim');
      expect(component.primaryActionRemover.label).toBe('Sim');
      expect(component.secondaryAction.label).toBe('Não');
    });
  });

  describe('submitForm - Candidato Search', () => {
    it('should load candidato by CPF successfully', (done) => {
      mockCandidatosService.obterPorCpf.and.returnValue(of(mockCandidato));

      component.submitForm({ cpf: mockCandidato.cpf });

      setTimeout(() => {
        expect(mockCandidatosService.obterPorCpf).toHaveBeenCalledWith(mockCandidato.cpf);
        expect(component.candidato).toEqual(mockCandidato);
        expect(mockVagasService.listar).toHaveBeenCalled();
        expect(component.isLoading).toBe(false);
        done();
      }, 100);
    });

    it('should handle 404 error when candidato not found', (done) => {
      const error = { status: 404 };
      mockCandidatosService.obterPorCpf.and.returnValue(throwError(() => error));

      component.submitForm({ cpf: '000.000.000-00' });

      setTimeout(() => {
        expect(mockPoNotification.error).toHaveBeenCalledWith('Candidato não encontrado.');
        expect(component.isLoading).toBe(false);
        expect(component.candidato).toBeNull();
        done();
      }, 100);
    });

    it('should handle generic error when searching candidato', (done) => {
      const error = new Error('Network error');
      mockCandidatosService.obterPorCpf.and.returnValue(throwError(() => error));

      component.submitForm({ cpf: mockCandidato.cpf });

      setTimeout(() => {
        expect(mockPoNotification.error).toHaveBeenCalledWith('Erro ao buscar candidato.');
        expect(component.isLoading).toBe(false);
        done();
      }, 100);
    });

    it('should handle empty result when obterPorCpf returns null', (done) => {
      mockCandidatosService.obterPorCpf.and.returnValue(of(null as any));

      component.submitForm({ cpf: mockCandidato.cpf });

      setTimeout(() => {
        expect(mockPoNotification.error).toHaveBeenCalledWith('Candidato não encontrado.');
        expect(component.candidato).toBeNull();
        expect(component.isLoading).toBe(false);
        done();
      }, 100);
    });
  });

  describe('obterNomeCandidato', () => {
    it('should return "Candidato" prefix for male candidate', () => {
      component.candidato = mockCandidato;
      const result = component.obterNomeCandidato();

      expect(result).toContain('Candidato');
      expect(result).toContain(mockCandidato.nome);
    });

    it('should return "Candidata" prefix for female candidate', () => {
      component.candidato = mockCandidatoFeminino;
      const result = component.obterNomeCandidato();

      expect(result).toContain('Candidata');
      expect(result).toContain(mockCandidatoFeminino.nome);
    });

    it('should return default text when candidato is null', () => {
      component.candidato = null;
      const result = component.obterNomeCandidato();

      expect(result).toContain('Candidato');
    });
  });

  describe('abrirModalInscricao', () => {
    beforeEach(() => {
      component.candidato = mockCandidato;
      spyOn(component.poModal, 'open');
    });

    it('should open modal for job application with correct title', () => {
      component.abrirModalInscricao(mockVaga1);

      expect(component.poModal.title).toBe('Remover candidatura');
      expect(component.poModal.open).toHaveBeenCalled();
    });

    it('should set vagaSelecionada when opening modal', () => {
      component.abrirModalInscricao(mockVaga1);

      expect(component.vagaSelecionada).toEqual(mockVaga1);
    });

    it('should set contentModal with correct message for male candidate', () => {
      component.candidato = mockCandidato;
      component.abrirModalInscricao(mockVaga1);

      expect(component.contentModal).toContain('do candidato');
      expect(component.contentModal).toContain(mockCandidato.nome);
      expect(component.contentModal).toContain(mockVaga1.titulo);
    });

    it('should set contentModal with correct message for female candidate', () => {
      component.candidato = mockCandidatoFeminino;
      component.abrirModalInscricao(mockVaga1);

      expect(component.contentModal).toContain('da candidata');
      expect(component.contentModal).toContain(mockCandidatoFeminino.nome);
    });

    it('should set primaryAction to modal', () => {
      component.abrirModalInscricao(mockVaga1);

      expect(component.poModal.primaryAction).toEqual(component.primaryAction);
    });
  });

  describe('abrirModalRemoverInscricao', () => {
    beforeEach(() => {
      component.candidato = mockCandidato;
      spyOn(component.poModal, 'open');
    });

    it('should open modal for removing application with correct title', () => {
      component.abrirModalRemoverInscricao(mockVaga1);

      expect(component.poModal.title).toBe('Realizar inscrição');
      expect(component.poModal.open).toHaveBeenCalled();
    });

    it('should set vagaSelecionada when opening modal', () => {
      component.abrirModalRemoverInscricao(mockVaga1);

      expect(component.vagaSelecionada).toEqual(mockVaga1);
    });

    it('should set contentModal with correct message', () => {
      component.abrirModalRemoverInscricao(mockVaga1);

      expect(component.contentModal).toContain('do candidato');
      expect(component.contentModal).toContain(mockCandidato.nome);
      expect(component.contentModal).toContain(mockVaga1.titulo);
    });

    it('should set primaryActionRemover to modal', () => {
      component.abrirModalRemoverInscricao(mockVaga1);

      expect(component.poModal.primaryAction).toEqual(component.primaryActionRemover);
    });
  });

  describe('loadVagas', () => {
    it('should load vagas successfully', (done) => {
      component['loadVagas']();

      setTimeout(() => {
        expect(mockVagasService.listar).toHaveBeenCalled();
        expect(component.isLoading).toBe(false);
        done();
      }, 100);
    });

    it('should filter out closed vagas', (done) => {
      mockVagasService.listar.and.returnValue(of(mockPagedVagasResponse));

      component['loadVagas']();

      setTimeout(() => {
        expect(component.vagas.length).toBe(2);
        expect(component.vagas.every(v => !v.encerrada)).toBe(true);
        done();
      }, 100);
    });

    it('should add acoes to each vaga', (done) => {
      mockVagasService.listar.and.returnValue(of(mockPagedVagasResponse));

      component['loadVagas']();

      setTimeout(() => {
        component.vagas.forEach(vaga => {
          expect(vaga.acoes).toContain('candidatar');
        });
        done();
      }, 100);
    });

    it('should set disableMoreRows to true when all vagas are loaded', (done) => {
      mockVagasService.listar.and.returnValue(of(mockPagedVagasResponse));

      component['loadVagas']();

      setTimeout(() => {
        expect(component.disableMoreRows).toBe(true);
        done();
      }, 100);
    });

    it('should set disableMoreRows to false when there are more pages', (done) => {
      const pagedResponseWithMore = {
        items: [mockVaga1, mockVaga2],
        totalItems: 20,
        pageNumber: 1,
        pageSize: 5,
        totalPages: 4
      };
      mockVagasService.listar.and.returnValue(of(pagedResponseWithMore));

      component['loadVagas']();

      setTimeout(() => {
        expect(component.disableMoreRows).toBe(false);
        done();
      }, 100);
    });

    it('should handle error when loading vagas', (done) => {
      const error = new Error('Network error');
      mockVagasService.listar.and.returnValue(throwError(() => error));

      component['loadVagas']();

      setTimeout(() => {
        expect(component.isLoading).toBe(false);
        done();
      }, 100);
    });
  });

  describe('showMore', () => {
    it('should increase page size by 5', () => {
      component.filter.PageSize = 5;
      component.showMore();

      expect(component.filter.PageSize).toBe(10);
    });

    it('should call loadVagas', () => {
      spyOn<any>(component, 'loadVagas');
      component.showMore();

      expect(component['loadVagas']).toHaveBeenCalled();
    });

    it('should keep SomenteAtivas filter as true', () => {
      component.showMore();

      expect(component.filter.SomenteAtivas).toBe(true);
    });
  });

  describe('realizarInscricao', () => {
    beforeEach(() => {
      component.candidato = mockCandidato;
      component.vagaSelecionada = mockVaga1;
      spyOn(component.poModal, 'close');
    });

    it('should successfully perform job application', (done) => {
      mockCandidaturaService.realizarInscricaoCandidato.and.returnValue(of({ id: '1' } as any));

      component['realizarInscricao']();

      setTimeout(() => {
        expect(mockCandidaturaService.realizarInscricaoCandidato).toHaveBeenCalledWith(
          mockCandidato.id,
          mockVaga1.id
        );
        expect(mockPoNotification.success).toHaveBeenCalledWith('Candidatura realizada com sucesso');
        expect(component.poModal.close).toHaveBeenCalled();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/vagas']);
        done();
      }, 100);
    });

    it('should handle error when candidato is already applying', (done) => {
      const error = {
        error: 'Candidato já está concorrendo a esta vaga'
      };
      mockCandidaturaService.realizarInscricaoCandidato.and.returnValue(throwError(() => error));

      component['realizarInscricao']();

      setTimeout(() => {
        expect(mockPoNotification.warning).toHaveBeenCalledWith(
          'Candidato já está concorrendo a esta vaga'
        );
        expect(component.poModal.close).toHaveBeenCalled();
        done();
      }, 100);
    });

    it('should handle generic error when performing job application', (done) => {
      const error = new Error('Generic error');
      mockCandidaturaService.realizarInscricaoCandidato.and.returnValue(throwError(() => error));

      component['realizarInscricao']();

      setTimeout(() => {
        expect(mockPoNotification.error).toHaveBeenCalledWith(
          'Não foi possível realizar a candidatura. Tente novamente mais tarde'
        );
        expect(component.poModal.close).toHaveBeenCalled();
        done();
      }, 100);
    });
  });

  describe('removerInscricao', () => {
    beforeEach(() => {
      component.candidato = mockCandidato;
      component.vagaSelecionada = mockVaga1;
      spyOn(component.poModal, 'close');
    });

    it('should successfully remove job application', (done) => {
      mockCandidaturaService.removerInscricao.and.returnValue(of({ id: '1' } as any));

      component['removerInscricao']();

      setTimeout(() => {
        expect(mockCandidaturaService.removerInscricao).toHaveBeenCalledWith(
          mockCandidato.id,
          mockVaga1.id
        );
        expect(mockPoNotification.success).toHaveBeenCalledWith('Candidatura realizada com sucesso');
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
        done();
      }, 100);
    });

    it('should handle error when removing job application', (done) => {
      const error = new Error('Error removing application');
      mockCandidaturaService.removerInscricao.and.returnValue(throwError(() => error));

      component['removerInscricao']();

      setTimeout(() => {
        expect(mockPoNotification.error).toHaveBeenCalledWith(
          'Não foi possível realizar a candidatura. Tente novamente mais tarde'
        );
        done();
      }, 100);
    });
  });

  describe('Navigation', () => {
    it('should navigate to candidatos list when cancel is called', () => {
      component.cancel();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/candidatos']);
    });
  });

  describe('Modal Actions', () => {
    beforeEach(() => {
      component.candidato = mockCandidato;
      component.vagaSelecionada = mockVaga1;
      spyOn(component.poModal, 'close');
    });

    it('should execute primaryAction when called', () => {
      spyOn<any>(component, 'realizarInscricao');
      component.primaryAction.action!();

      expect(component['realizarInscricao']).toHaveBeenCalled();
    });

    it('should execute primaryActionRemover when called', () => {
      spyOn<any>(component, 'removerInscricao');
      component.primaryActionRemover.action!();

      expect(component['removerInscricao']).toHaveBeenCalled();
    });

    it('should close modal when secondaryAction is called', () => {
      component.secondaryAction.action!();

      expect(component.poModal.close).toHaveBeenCalled();
    });
  });
});
