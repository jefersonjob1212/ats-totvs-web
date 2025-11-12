import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { PoNotificationService } from '@po-ui/ng-components';
import { of, throwError, EMPTY } from 'rxjs';

import { CandidatosHomeComponent } from './candidatos-home.component';
import { CandidatosService } from '@candidatos/services/candidatos.service';
import { CandidatoResponse } from '@candidatos/models/responses/candidato.response';
import { SexoEnum } from '@candidatos/enums/sexo.enum';

describe('CandidatosHomeComponent', () => {
  let component: CandidatosHomeComponent;
  let fixture: ComponentFixture<CandidatosHomeComponent>;
  let candidatosService: jasmine.SpyObj<CandidatosService>;
  let router: jasmine.SpyObj<Router>;
  let notificationService: jasmine.SpyObj<PoNotificationService>;
  let httpMock: HttpTestingController;

  const mockCandidato = new CandidatoResponse({
    id: '1',
    nome: 'João Silva',
    cpf: '12345678900',
    email: 'joao@example.com',
    telefone: '11999999999',
    sexo: SexoEnum.Masculino
  });

  const mockCandidato2 = new CandidatoResponse({
    id: '2',
    nome: 'Maria Santos',
    cpf: '98765432100',
    email: 'maria@example.com',
    telefone: '11988888888',
    sexo: SexoEnum.Feminino
  });

  const mockPagedResponse = {
    items: [mockCandidato, mockCandidato2],
    total: 2,
    totalItems: 2,
    pageNumber: 1,
    pageSize: 10,
    totalPages: 1
  };

  beforeEach(async () => {
    const candidatosServiceSpy = jasmine.createSpyObj('CandidatosService', [
      'listar',
      'obterPorId',
      'criar',
      'editar',
      'excluir'
    ]);

    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const notificationServiceSpy = jasmine.createSpyObj('PoNotificationService', ['success', 'error']);

    await TestBed.configureTestingModule({
      imports: [CandidatosHomeComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: CandidatosService, useValue: candidatosServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: PoNotificationService, useValue: notificationServiceSpy }
      ]
    }).compileComponents();

    candidatosService = TestBed.inject(CandidatosService) as jasmine.SpyObj<CandidatosService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    notificationService = TestBed.inject(PoNotificationService) as jasmine.SpyObj<PoNotificationService>;
    httpMock = TestBed.inject(HttpTestingController);

    // Mock padrão do listar
    candidatosService.listar.and.returnValue(of(mockPagedResponse));
  });

  const createComponent = () => {
    fixture = TestBed.createComponent(CandidatosHomeComponent);
    component = fixture.componentInstance;
  };

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    createComponent();
    expect(component).toBeTruthy();
  });

  it('should load candidatos on ngOnInit', () => {
    createComponent();
    fixture.detectChanges();

    expect(candidatosService.listar).toHaveBeenCalled();
    expect(component.candidatos.length).toBe(2);
    expect(component.candidatos[0]).toEqual(mockCandidato);
    expect(component.candidatos[1]).toEqual(mockCandidato2);
  });

  it('should set disableMoreRows to true when all candidatos are loaded in one page', () => {
    createComponent();
    fixture.detectChanges();

    expect(component.disableMoreRows).toBe(true);
  });

  it('should set disableMoreRows to false when there are more pages', () => {
    const pagedResponseWithMorePages = {
      items: [mockCandidato, mockCandidato2],
      total: 20,
      totalItems: 20,
      pageNumber: 1,
      pageSize: 10,
      totalPages: 3
    };

    candidatosService.listar.and.returnValue(of(pagedResponseWithMorePages));
    createComponent();
    fixture.detectChanges();

    expect(component.disableMoreRows).toBe(false);
  });

  it('should add acoes property to each candidato', () => {
    createComponent();
    fixture.detectChanges();

    component.candidatos.forEach(candidato => {
      expect(candidato.acoes).toEqual(['editar', 'excluir']);
    });
  });

  it('should handle error when loading candidatos', (done) => {
    const error = new Error('Network error');
    candidatosService.listar.and.returnValue(throwError(() => error));

    createComponent();
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      expect(component.isLoading).toBe(false);
      done();
    });
  });

  it('should navigate to create page when criarCandidato is called', () => {
    createComponent();
    component.criarCandidato();

    expect(router.navigate).toHaveBeenCalledWith(['/candidatos/novo']);
  });

  it('should navigate to edit page with candidato id when editarCandidato is called', () => {
    createComponent();
    component.editarCandidato(mockCandidato);

    expect(router.navigate).toHaveBeenCalledWith([`/candidatos/editar/${mockCandidato.id}`]);
  });

  it('should open modal with correct content for masculino candidato', () => {
    createComponent();
    component.openModalExcluirCandidato(mockCandidato);

    expect(component.poModal.title).toBe('Excluir Candidato');
    expect(component.contentModal).toContain('o candidato');
    expect(component.contentModal).toContain(mockCandidato.nome);
  });

  it('should open modal with correct content for feminino candidato', () => {
    createComponent();
    component.openModalExcluirCandidato(mockCandidato2);

    expect(component.poModal.title).toBe('Excluir Candidato');
    expect(component.contentModal).toContain('a candidata');
    expect(component.contentModal).toContain(mockCandidato2.nome);
  });

  it('should call poModal.open when openModalExcluirCandidato is called', () => {
    createComponent();
    spyOn(component.poModal, 'open');

    component.openModalExcluirCandidato(mockCandidato);

    expect(component.poModal.open).toHaveBeenCalled();
  });

  it('should delete candidato and reload list when excluirCandidato is called', (done) => {
    createComponent();
    fixture.detectChanges();

    candidatosService.excluir.and.returnValue(of(void 0));
    spyOn(component.poModal, 'close');

    component.excluirCandidato();

    fixture.whenStable().then(() => {
      expect(candidatosService.excluir).toHaveBeenCalled();
      expect(notificationService.success).toHaveBeenCalledWith('Candidato excluído com sucesso!');
      expect(component.poModal.close).toHaveBeenCalled();
      done();
    });
  });

  it('should show error notification when excluirCandidato fails', (done) => {
    createComponent();
    fixture.detectChanges();

    const error = new Error('Error deleting candidato');
    candidatosService.excluir.and.returnValue(throwError(() => error));

    component.excluirCandidato();

    fixture.whenStable().then(() => {
      expect(notificationService.error).toHaveBeenCalledWith('Erro ao excluir o candidato.');
      expect(component.isLoading).toBe(false);
      done();
    });
  });

  it('should set isLoading to false after loading candidatos', () => {
    createComponent();
    fixture.detectChanges();

    expect(component.isLoading).toBe(false);
  });

  it('should initialize with correct columns configuration', () => {
    createComponent();
    expect(component.columns.length).toBe(6);
    expect(component.columns[0].property).toBe('cpf');
    expect(component.columns[1].property).toBe('nome');
    expect(component.columns[2].property).toBe('email');
    expect(component.columns[3].property).toBe('telefone');
    expect(component.columns[4].property).toBe('sexo');
    expect(component.columns[5].property).toBe('acoes');
  });

  it('should have primaryAction and secondaryAction configured', () => {
    createComponent();
    expect(component.primaryAction.label).toBe('Sim');
    expect(component.primaryAction.danger).toBe(true);
    expect(component.secondaryAction.label).toBe('Não');
  });

  it('should reload candidatos after successful deletion', () => {
    createComponent();
    fixture.detectChanges();
    const initialCallCount = candidatosService.listar.calls.count();

    candidatosService.excluir.and.returnValue(of(void 0));

    component.excluirCandidato();

    // A chamada após a deleção deve ter incrementado o contador
    expect(candidatosService.listar.calls.count()).toBe(initialCallCount + 1);
  });

  it('should increase page size when showMore is called', () => {
    createComponent();
    fixture.detectChanges();
    
    const initialPageSize = component.filter.PageSize;
    component.showMore();

    expect(component.filter.PageSize).toBe(initialPageSize + 5);
  });

  it('should call listar when showMore is called', () => {
    createComponent();
    fixture.detectChanges();
    
    const callCount = candidatosService.listar.calls.count();
    component.showMore();

    expect(candidatosService.listar.calls.count()).toBe(callCount + 1);
  });
});
