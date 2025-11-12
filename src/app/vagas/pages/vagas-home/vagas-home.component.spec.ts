import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { PoNotificationService } from '@po-ui/ng-components';
import { of, throwError } from 'rxjs';

import { VagasHomeComponent } from './vagas-home.component';
import { VagasService } from '@vagas/services/vagas.service';
import { VagaResponse } from '@vagas/models/responses/vaga.response';
import { TipoVagaEnum } from '@vagas/enums/tipo-vaga.enum';

describe('VagasHomeComponent', () => {
  let component: VagasHomeComponent;
  let fixture: ComponentFixture<VagasHomeComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockVagasService: jasmine.SpyObj<VagasService>;
  let mockPoNotification: jasmine.SpyObj<PoNotificationService>;

  const mockVaga1: VagaResponse = {
    id: '1',
    titulo: 'Desenvolvedor Angular',
    localizacao: 'São Paulo, SP',
    dataPublicacao: new Date('2025-01-01'),
    tipoVaga: TipoVagaEnum.Presencial,
    encerrada: false,
    descricao: 'Procuramos um desenvolvedor Angular',
    acoes: ['editar', 'excluir', 'encerrar', 'visualizar']
  } as any;

  const mockVaga2: VagaResponse = {
    id: '2',
    titulo: 'Desenvolvedor Backend',
    localizacao: 'Rio de Janeiro, RJ',
    dataPublicacao: new Date('2025-01-05'),
    tipoVaga: TipoVagaEnum.Remoto,
    encerrada: false,
    descricao: 'Procuramos um desenvolvedor Backend',
    acoes: ['editar', 'excluir', 'encerrar', 'visualizar']
  } as any;

  const mockVagaEncerrada: VagaResponse = {
    id: '3',
    titulo: 'Vaga Encerrada',
    localizacao: 'Belo Horizonte, MG',
    dataPublicacao: new Date('2024-12-01'),
    tipoVaga: TipoVagaEnum.Hibrido,
    encerrada: true,
    descricao: 'Esta vaga foi encerrada',
    acoes: []
  } as any;

  const mockPagedResponse = {
    items: [mockVaga1, mockVaga2, mockVagaEncerrada],
    totalItems: 3,
    pageNumber: 1,
    pageSize: 5,
    totalPages: 1
  };

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockVagasService = jasmine.createSpyObj('VagasService', [
      'listar',
      'obterPorId',
      'criar',
      'atualizar',
      'excluir',
      'encerrar'
    ]);
    mockPoNotification = jasmine.createSpyObj('PoNotificationService', [
      'success',
      'error',
      'warning'
    ]);

    mockVagasService.listar.and.returnValue(of(mockPagedResponse));

    await TestBed.configureTestingModule({
      imports: [VagasHomeComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: mockRouter },
        { provide: VagasService, useValue: mockVagasService },
        { provide: PoNotificationService, useValue: mockPoNotification }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(VagasHomeComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.vagas.length).toBe(0);
      expect(component.isLoading).toBe(false);
      expect(component.disableMoreRows).toBe(false);
      expect(component.contentModal).toBe('');
      expect(component.filter.PageNumber).toBe(1);
      expect(component.filter.PageSize).toBe(5);
      expect(component.filter.SomenteAtivas).toBe(false);
    });

    it('should have columns properly configured', () => {
      expect(component.columns.length).toBe(6);
      expect(component.columns[0].property).toBe('titulo');
      expect(component.columns[1].property).toBe('localizacao');
      expect(component.columns[2].property).toBe('dataPublicacao');
      expect(component.columns[3].property).toBe('tipoVaga');
      expect(component.columns[4].property).toBe('encerrada');
      expect(component.columns[5].property).toBe('acoes');
    });

    it('should have modal actions configured', () => {
      expect(component.primaryAction.label).toBe('Sim');
      expect(component.primaryAction.danger).toBe(true);
      expect(component.primaryActionEncerrar.label).toBe('Sim');
      expect(component.primaryActionEncerrar.danger).toBe(true);
      expect(component.secondaryAction.label).toBe('Não');
    });
  });

  describe('ngOnInit', () => {
    it('should load vagas on init', () => {
      fixture.detectChanges();

      expect(mockVagasService.listar).toHaveBeenCalled();
      expect(component.vagas.length).toBe(3);
    });
  });

  describe('loadVagas', () => {
    it('should load vagas successfully', (done) => {
      component['loadVagas']();

      setTimeout(() => {
        expect(mockVagasService.listar).toHaveBeenCalled();
        expect(component.vagas.length).toBe(3);
        expect(component.isLoading).toBe(false);
        done();
      }, 100);
    });

    it('should add acoes to each vaga', (done) => {
      component['loadVagas']();

      setTimeout(() => {
        component.vagas.forEach(vaga => {
          expect(vaga.acoes).toContain('editar');
          expect(vaga.acoes).toContain('excluir');
          expect(vaga.acoes).toContain('encerrar');
          expect(vaga.acoes).toContain('visualizar');
        });
        done();
      }, 100);
    });

    it('should set disableMoreRows to true when all vagas are loaded', (done) => {
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

  describe('criarVaga', () => {
    it('should navigate to create vaga page', () => {
      component.criarVaga();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/vagas/novo']);
    });
  });

  describe('editarVaga', () => {
    it('should navigate to edit vaga page with vaga id', () => {
      component.editarVaga(mockVaga1);

      expect(mockRouter.navigate).toHaveBeenCalledWith([`/vagas/editar/${mockVaga1.id}`]);
    });

    it('should navigate to edit with correct vaga id', () => {
      component.editarVaga(mockVaga2);

      expect(mockRouter.navigate).toHaveBeenCalledWith([`/vagas/editar/${mockVaga2.id}`]);
    });
  });

  describe('openModalExcluirVaga', () => {
    beforeEach(() => {
      spyOn(component.poModal, 'open');
    });

    it('should open modal with correct title for delete', () => {
      component.openModalExcluirVaga(mockVaga1);

      expect(component.poModal.title).toBe('Excluir Vaga');
      expect(component.poModal.open).toHaveBeenCalled();
    });

    it('should set correct content modal message', () => {
      component.openModalExcluirVaga(mockVaga1);

      expect(component.contentModal).toContain('Tem certeza que deseja excluir');
      expect(component.contentModal).toContain(mockVaga1.titulo);
    });

    it('should store vaga id for exclusion', () => {
      component.openModalExcluirVaga(mockVaga1);

      expect(component['idVagaExcluir']).toBe(mockVaga1.id);
    });

    it('should set primaryAction to modal', () => {
      component.openModalExcluirVaga(mockVaga1);

      expect(component.poModal.primaryAction).toEqual(component.primaryAction);
    });
  });

  describe('excluirVaga', () => {
    beforeEach(() => {
      component['idVagaExcluir'] = mockVaga1.id;
      spyOn(component.poModal, 'close');
    });

    it('should delete vaga successfully', (done) => {
      mockVagasService.excluir.and.returnValue(of(void 0));

      component.excluirVaga();

      setTimeout(() => {
        expect(mockVagasService.excluir).toHaveBeenCalledWith(mockVaga1.id);
        expect(mockPoNotification.success).toHaveBeenCalledWith('Vaga excluída com sucesso!');
        expect(component.poModal.close).toHaveBeenCalled();
        expect(mockVagasService.listar).toHaveBeenCalled();
        done();
      }, 100);
    });

    it('should reload vagas after successful deletion', (done) => {
      mockVagasService.excluir.and.returnValue(of(void 0));
      const initialCallCount = mockVagasService.listar.calls.count();

      component.excluirVaga();

      setTimeout(() => {
        expect(mockVagasService.listar.calls.count()).toBeGreaterThan(initialCallCount);
        done();
      }, 100);
    });

    it('should handle error when deleting vaga', (done) => {
      const error = new Error('Delete error');
      mockVagasService.excluir.and.returnValue(throwError(() => error));

      component.excluirVaga();

      setTimeout(() => {
        expect(mockPoNotification.error).toHaveBeenCalledWith('Erro ao excluir a vaga.');
        expect(component.isLoading).toBe(false);
        done();
      }, 100);
    });
  });

  describe('openModalEncerrarVaga', () => {
    beforeEach(() => {
      spyOn(component.poModal, 'open');
    });

    it('should open modal with correct title for close', () => {
      component.openModalEncerrarVaga(mockVaga1);

      expect(component.poModal.title).toBe('Encerrar Vaga');
      expect(component.poModal.open).toHaveBeenCalled();
    });

    it('should set correct content modal message for close', () => {
      component.openModalEncerrarVaga(mockVaga1);

      expect(component.contentModal).toContain('Tem certeza que deseja encerrar');
      expect(component.contentModal).toContain(mockVaga1.titulo);
    });

    it('should store vaga id for closure', () => {
      component.openModalEncerrarVaga(mockVaga1);

      expect(component['idVagaExcluir']).toBe(mockVaga1.id);
    });

    it('should set primaryActionEncerrar to modal', () => {
      component.openModalEncerrarVaga(mockVaga1);

      expect(component.poModal.primaryAction).toEqual(component.primaryActionEncerrar);
    });
  });

  describe('encerrarVaga', () => {
    beforeEach(() => {
      component['idVagaExcluir'] = mockVaga1.id;
      spyOn(component.poModal, 'close');
    });

    it('should close vaga successfully', (done) => {
      mockVagasService.encerrar.and.returnValue(of(mockVaga1 as any));

      component.encerrarVaga();

      setTimeout(() => {
        expect(mockVagasService.encerrar).toHaveBeenCalledWith(mockVaga1.id);
        expect(mockPoNotification.success).toHaveBeenCalledWith('A vaga foi encerrada com sucesso!');
        expect(component.poModal.close).toHaveBeenCalled();
        expect(mockVagasService.listar).toHaveBeenCalled();
        done();
      }, 100);
    });

    it('should reload vagas after successful closure', (done) => {
      mockVagasService.encerrar.and.returnValue(of(mockVaga1 as any));
      const initialCallCount = mockVagasService.listar.calls.count();

      component.encerrarVaga();

      setTimeout(() => {
        expect(mockVagasService.listar.calls.count()).toBeGreaterThan(initialCallCount);
        done();
      }, 100);
    });

    it('should handle error when closing vaga', (done) => {
      const error = new Error('Close error');
      mockVagasService.encerrar.and.returnValue(throwError(() => error));

      component.encerrarVaga();

      setTimeout(() => {
        expect(mockPoNotification.error).toHaveBeenCalledWith('Erro ao encerrar a vaga.');
        expect(component.isLoading).toBe(false);
        done();
      }, 100);
    });
  });

  describe('verCandidatos', () => {
    it('should navigate to candidatos page for vaga', () => {
      component.verCandidatos(mockVaga1);

      expect(mockRouter.navigate).toHaveBeenCalledWith([`/vagas/${mockVaga1.id}/candidatos`]);
    });

    it('should navigate with correct vaga id', () => {
      component.verCandidatos(mockVaga2);

      expect(mockRouter.navigate).toHaveBeenCalledWith([`/vagas/${mockVaga2.id}/candidatos`]);
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

    it('should keep SomenteAtivas filter as false', () => {
      component.showMore();

      expect(component.filter.SomenteAtivas).toBe(false);
    });

    it('should keep page number the same', () => {
      component.filter.PageNumber = 1;
      component.showMore();

      expect(component.filter.PageNumber).toBe(1);
    });
  });

  describe('Modal Actions', () => {
    beforeEach(() => {
      component['idVagaExcluir'] = mockVaga1.id;
      spyOn(component.poModal, 'close');
    });

    it('should execute primaryAction when called', (done) => {
      spyOn<any>(component, 'excluirVaga');
      mockVagasService.excluir.and.returnValue(of(void 0));

      component.primaryAction.action!();

      setTimeout(() => {
        expect(component['excluirVaga']).toHaveBeenCalled();
        done();
      }, 100);
    });

    it('should execute primaryActionEncerrar when called', (done) => {
      spyOn<any>(component, 'encerrarVaga');
      mockVagasService.encerrar.and.returnValue(of(mockVaga1 as any));

      component.primaryActionEncerrar.action!();

      setTimeout(() => {
        expect(component['encerrarVaga']).toHaveBeenCalled();
        done();
      }, 100);
    });

    it('should close modal when secondaryAction is called', () => {
      component.secondaryAction.action!();

      expect(component.poModal.close).toHaveBeenCalled();
    });
  });

  describe('Filter and Pagination', () => {
    it('should have correct initial filter values', () => {
      expect(component.filter.PageNumber).toBe(1);
      expect(component.filter.PageSize).toBe(5);
      expect(component.filter.SomenteAtivas).toBe(false);
    });

    it('should update filter when showing more rows', () => {
      const originalPageSize = component.filter.PageSize;
      component.showMore();

      expect(component.filter.PageSize).toBe(originalPageSize + 5);
    });
  });

  describe('Table Columns Configuration', () => {
    it('should have titulo column', () => {
      const tituloColumn = component.columns.find(c => c.property === 'titulo');
      expect(tituloColumn?.label).toBe('Vaga');
    });

    it('should have localizacao column', () => {
      const localizacaoColumn = component.columns.find(c => c.property === 'localizacao');
      expect(localizacaoColumn?.label).toBe('Localização');
    });

    it('should have dataPublicacao column', () => {
      const dataColumn = component.columns.find(c => c.property === 'dataPublicacao');
      expect(dataColumn?.type).toBe('date');
    });

    it('should have tipoVaga column with labels', () => {
      const tipoVagaColumn = component.columns.find(c => c.property === 'tipoVaga');
      expect(tipoVagaColumn?.type).toBe('label');
      expect(tipoVagaColumn?.labels?.length).toBe(3);
    });

    it('should have encerrada column', () => {
      const encerradaColumn = component.columns.find(c => c.property === 'encerrada');
      expect(encerradaColumn?.label).toBe('Status');
      expect(encerradaColumn?.type).toBe('columnTemplate');
    });

    it('should have acoes column with icon type', () => {
      const acoesColumn = component.columns.find(c => c.property === 'acoes');
      expect(acoesColumn?.type).toBe('icon');
      expect(acoesColumn?.icons?.length).toBe(4);
    });
  });

  describe('Loading State', () => {
    it('should set isLoading to false after successful load', (done) => {
      component['loadVagas']();

      setTimeout(() => {
        expect(component.isLoading).toBe(false);
        done();
      }, 100);
    });

    it('should set isLoading to false after error', (done) => {
      const error = new Error('Error');
      mockVagasService.listar.and.returnValue(throwError(() => error));

      component['loadVagas']();

      setTimeout(() => {
        expect(component.isLoading).toBe(false);
        done();
      }, 100);
    });
  });
});
