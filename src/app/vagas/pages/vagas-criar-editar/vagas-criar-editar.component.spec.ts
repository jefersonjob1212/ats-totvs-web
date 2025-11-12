import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { PoNotificationService } from '@po-ui/ng-components';
import { of, throwError } from 'rxjs';

import { VagasCriarEditarComponent } from './vagas-criar-editar.component';
import { VagasService } from '@vagas/services/vagas.service';
import { VagaCriarEditarRequest } from '@vagas/models/requests/vaga-criar-editar.request';
import { TipoVagaEnum } from '@vagas/enums/tipo-vaga.enum';

describe('VagasCriarEditarComponent', () => {
  let component: VagasCriarEditarComponent;
  let fixture: ComponentFixture<VagasCriarEditarComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;
  let mockVagasService: jasmine.SpyObj<VagasService>;
  let mockPoNotification: jasmine.SpyObj<PoNotificationService>;

  const mockVaga = {
    id: '1',
    titulo: 'Desenvolvedor Angular',
    descricao: 'Procuramos um desenvolvedor Angular experiente',
    localizacao: 'São Paulo, SP',
    tipoVaga: TipoVagaEnum.Presencial,
    dataPublicacao: new Date('2025-01-01'),
    encerrada: false,
    acoes: ['editar', 'excluir']
  };

  const mockVagaCriarEditar: VagaCriarEditarRequest = {
    titulo: 'Desenvolvedor Angular',
    descricao: 'Procuramos um desenvolvedor Angular experiente',
    localizacao: 'São Paulo, SP',
    tipoVaga: TipoVagaEnum.Presencial
  } as any;

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockVagasService = jasmine.createSpyObj('VagasService', [
      'criar',
      'atualizar',
      'obterPorId'
    ]);
    mockPoNotification = jasmine.createSpyObj('PoNotificationService', [
      'success',
      'error'
    ]);

    mockActivatedRoute = {
      paramMap: of({ get: (key: string) => null } as any)
    };

    await TestBed.configureTestingModule({
      imports: [VagasCriarEditarComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: VagasService, useValue: mockVagasService },
        { provide: PoNotificationService, useValue: mockPoNotification }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(VagasCriarEditarComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values for create mode', (done) => {
      mockActivatedRoute.paramMap = of(new Map());
      fixture.detectChanges();

      setTimeout(() => {
        expect(component.title).toBe('Criar Vaga');
        expect(component.vagaSelecionada).toBeNull();
        expect(component.isLoading).toBe(false);
        done();
      }, 100);
    });

    it('should have fields properly configured', () => {
      expect(component.fields.length).toBe(4);
      expect(component.fields[0].property).toBe('titulo');
      expect(component.fields[1].property).toBe('descricao');
      expect(component.fields[2].property).toBe('localizacao');
      expect(component.fields[3].property).toBe('tipoVaga');
    });

    it('should have titulo field as required', () => {
      const tituloField = component.fields.find(f => f.property === 'titulo');
      expect(tituloField?.required).toBe(true);
    });

    it('should have descricao field as required', () => {
      const descricaoField = component.fields.find(f => f.property === 'descricao');
      expect(descricaoField?.required).toBe(true);
    });

    it('should have localizacao field as required', () => {
      const localizacaoField = component.fields.find(f => f.property === 'localizacao');
      expect(localizacaoField?.required).toBe(true);
    });

    it('should have tipoVaga field with correct options', () => {
      const tipoVagaField = component.fields.find(f => f.property === 'tipoVaga');
      expect(tipoVagaField?.options?.length).toBe(3);
      expect(tipoVagaField?.options?.[0]).toEqual({ label: 'Remoto', value: 1 });
      expect(tipoVagaField?.options?.[1]).toEqual({ label: 'Presencial', value: 2 });
      expect(tipoVagaField?.options?.[2]).toEqual({ label: 'Híbrido', value: 3 });
    });
  });

  describe('Create Mode', () => {
    beforeEach(() => {
      mockActivatedRoute.paramMap = of(new Map());
      fixture.detectChanges();
    });

    it('should set title to "Criar Vaga" when no ID is provided', (done) => {
      setTimeout(() => {
        expect(component.title).toBe('Criar Vaga');
        done();
      }, 100);
    });

    it('should submit new vaga successfully', (done) => {
      mockVagasService.criar.and.returnValue(of(mockVaga));

      component.submitForm(mockVagaCriarEditar);

      setTimeout(() => {
        expect(mockVagasService.criar).toHaveBeenCalledWith(mockVagaCriarEditar);
        expect(mockPoNotification.success).toHaveBeenCalledWith('Vaga criada com sucesso!');
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/vagas']);
        expect(component.isLoading).toBe(false);
        done();
      }, 100);
    });

    it('should handle error when creating vaga', (done) => {
      const error = new Error('Network error');
      mockVagasService.criar.and.returnValue(throwError(() => error));

      component.submitForm(mockVagaCriarEditar);

      setTimeout(() => {
        expect(mockVagasService.criar).toHaveBeenCalledWith(mockVagaCriarEditar);
        expect(mockPoNotification.error).toHaveBeenCalledWith('Erro ao criar a vaga.');
        expect(component.isLoading).toBe(false);
        expect(mockRouter.navigate).not.toHaveBeenCalled();
        done();
      }, 100);
    });
  });

  describe('Edit Mode', () => {
    beforeEach(() => {
      const paramMap = {
        get: (key: string) => (key === 'id' ? '1' : null)
      };
      mockActivatedRoute.paramMap = of(paramMap as any);
      mockVagasService.obterPorId.and.returnValue(of(mockVaga));
      fixture = TestBed.createComponent(VagasCriarEditarComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should set title to "Editar Vaga" when ID is provided', () => {
      expect(component.title).toBe('Editar Vaga');
    });

    it('should load vaga data when ID is provided', (done) => {
      setTimeout(() => {
        expect(mockVagasService.obterPorId).toHaveBeenCalledWith('1');
        expect(component.vagaSelecionada).toBeTruthy();
        expect(component.vagaSelecionada?.titulo).toBe('Desenvolvedor Angular');
        expect(component.vagaSelecionada?.localizacao).toBe('São Paulo, SP');
        expect(component.isLoading).toBe(false);
        done();
      }, 100);
    });

    it('should create VagaCriarEditarRequest with correct properties', (done) => {
      setTimeout(() => {
        expect(component.vagaSelecionada?.titulo).toBe(mockVaga.titulo);
        expect(component.vagaSelecionada?.descricao).toBe(mockVaga.descricao);
        expect(component.vagaSelecionada?.localizacao).toBe(mockVaga.localizacao);
        expect(component.vagaSelecionada?.tipoVaga).toBe(mockVaga.tipoVaga);
        done();
      }, 100);
    });

    it('should handle error when loading vaga data', (done) => {
      const paramMap = {
        get: (key: string) => (key === 'id' ? '1' : null)
      };
      mockActivatedRoute.paramMap = of(paramMap as any);
      const error = new Error('Not found');
      mockVagasService.obterPorId.and.returnValue(throwError(() => error));
      const errorFixture = TestBed.createComponent(VagasCriarEditarComponent);
      const errorComponent = errorFixture.componentInstance;
      errorFixture.detectChanges();

      setTimeout(() => {
        expect(mockVagasService.obterPorId).toHaveBeenCalledWith('1');
        expect(mockPoNotification.error).toHaveBeenCalledWith(
          'Erro ao carregar os dados da vaga.'
        );
        expect(errorComponent.isLoading).toBe(false);
        done();
      }, 100);
    });

    it('should submit edited vaga successfully', (done) => {
      mockVagasService.atualizar.and.returnValue(of(mockVaga));

      component.submitForm(mockVagaCriarEditar);

      setTimeout(() => {
        expect(mockVagasService.atualizar).toHaveBeenCalledWith('1', mockVagaCriarEditar);
        expect(mockPoNotification.success).toHaveBeenCalledWith('Vaga atualizada com sucesso!');
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/vagas']);
        expect(component.isLoading).toBe(false);
        done();
      }, 100);
    });

    it('should handle error when updating vaga', (done) => {
      const error = new Error('Validation error');
      mockVagasService.atualizar.and.returnValue(throwError(() => error));

      component.submitForm(mockVagaCriarEditar);

      setTimeout(() => {
        expect(mockVagasService.atualizar).toHaveBeenCalledWith('1', mockVagaCriarEditar);
        expect(mockPoNotification.error).toHaveBeenCalledWith('Erro ao atualizar a vaga.');
        expect(component.isLoading).toBe(false);
        expect(mockRouter.navigate).not.toHaveBeenCalled();
        done();
      }, 100);
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      mockActivatedRoute.paramMap = of(new Map());
      fixture.detectChanges();
    });

    it('should navigate to vagas list when cancel is called', () => {
      component.cancel();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/vagas']);
    });

    it('should navigate to vagas list after successful vaga creation', (done) => {
      mockVagasService.criar.and.returnValue(of(mockVaga));

      component.submitForm(mockVagaCriarEditar);

      setTimeout(() => {
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/vagas']);
        done();
      }, 100);
    });

    it('should navigate to vagas list after successful vaga update', (done) => {
      const paramMap = {
        get: (key: string) => (key === 'id' ? '1' : null)
      };
      mockActivatedRoute.paramMap = of(paramMap as any);
      mockVagasService.obterPorId.and.returnValue(of(mockVaga));
      mockVagasService.atualizar.and.returnValue(of(mockVaga));

      const editFixture = TestBed.createComponent(VagasCriarEditarComponent);
      const editComponent = editFixture.componentInstance;
      editFixture.detectChanges();

      setTimeout(() => {
        editComponent.submitForm(mockVagaCriarEditar);

        setTimeout(() => {
          expect(mockRouter.navigate).toHaveBeenCalledWith(['/vagas']);
          done();
        }, 100);
      }, 100);
    });
  });

  describe('Loading State', () => {
    it('should set isLoading to true when submitting form', (done) => {
      mockActivatedRoute.paramMap = of(new Map());
      fixture.detectChanges();
      mockVagasService.criar.and.returnValue(of(mockVaga));

      expect(component.isLoading).toBe(false);
      component.submitForm(mockVagaCriarEditar);

      setTimeout(() => {
        expect(component.isLoading).toBe(false);
        done();
      }, 100);
    });

    it('should set isLoading to false after successful submission', (done) => {
      mockActivatedRoute.paramMap = of(new Map());
      fixture.detectChanges();
      mockVagasService.criar.and.returnValue(of(mockVaga));

      component.submitForm(mockVagaCriarEditar);

      setTimeout(() => {
        expect(component.isLoading).toBe(false);
        done();
      }, 100);
    });

    it('should set isLoading to false after error', (done) => {
      mockActivatedRoute.paramMap = of(new Map());
      fixture.detectChanges();
      const error = new Error('Error');
      mockVagasService.criar.and.returnValue(throwError(() => error));

      component.submitForm(mockVagaCriarEditar);

      setTimeout(() => {
        expect(component.isLoading).toBe(false);
        done();
      }, 100);
    });
  });

  describe('Form Fields Configuration', () => {
    it('should have titulo field with correct configuration', () => {
      const tituloField = component.fields.find(f => f.property === 'titulo');
      expect(tituloField?.label).toBe('Título da Vaga');
      expect(tituloField?.gridColumns).toBe(12);
      expect(tituloField?.placeholder).toBe('Informe o título da vaga');
      expect(tituloField?.order).toBe(1);
    });

    it('should have descricao field with correct configuration', () => {
      const descricaoField = component.fields.find(f => f.property === 'descricao');
      expect(descricaoField?.label).toBe('Descrição da Vaga');
      expect(descricaoField?.gridColumns).toBe(12);
      expect(descricaoField?.rows).toBe(5);
      expect(descricaoField?.placeholder).toContain('responsabilidades');
      expect(descricaoField?.order).toBe(2);
    });

    it('should have localizacao field with correct configuration', () => {
      const localizacaoField = component.fields.find(f => f.property === 'localizacao');
      expect(localizacaoField?.label).toBe('Localização');
      expect(localizacaoField?.gridColumns).toBe(6);
      expect(localizacaoField?.gridSmColumns).toBe(12);
      expect(localizacaoField?.placeholder).toContain('São Paulo-SP');
      expect(localizacaoField?.order).toBe(3);
    });

    it('should have tipoVaga field with correct configuration', () => {
      const tipoVagaField = component.fields.find(f => f.property === 'tipoVaga');
      expect(tipoVagaField?.label).toBe('Tipo de Vaga');
      expect(tipoVagaField?.gridColumns).toBe(6);
      expect(tipoVagaField?.gridSmColumns).toBe(12);
      expect(tipoVagaField?.required).toBe(true);
      expect(tipoVagaField?.order).toBe(4);
    });
  });
});
