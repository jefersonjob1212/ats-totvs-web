import { Routes } from '@angular/router';

export const routes: Routes = [
    { 
        path: 'candidatos',
        loadComponent: () => import('./candidatos/pages/candidatos-home/candidatos-home.component').then(m => m.CandidatosHomeComponent) 
    },
    { 
        path: 'candidatos/novo',
        loadComponent: () => import('./candidatos/pages/candidatos-criar-editar/candidatos-criar-editar.component').then(m => m.CandidatosCriarEditarComponent) 
    },
    { 
        path: 'candidatos/editar/:id',
        loadComponent: () => import('./candidatos/pages/candidatos-criar-editar/candidatos-criar-editar.component').then(m => m.CandidatosCriarEditarComponent) 
    },
    { 
        path: 'vagas',
        loadComponent: () => import('./vagas/pages/vagas-home/vagas-home.component').then(m => m.VagasHomeComponent) 
    },
    { 
        path: 'vagas/novo',
        loadComponent: () => import('./vagas/pages/vagas-criar-editar/vagas-criar-editar.component').then(m => m.VagasCriarEditarComponent)
    },
    { 
        path: 'vagas/editar/:id',
        loadComponent: () => import('./vagas/pages/vagas-criar-editar/vagas-criar-editar.component').then(m => m.VagasCriarEditarComponent)
    },
    {
        path: 'vagas/:id/candidatos',
        loadComponent: () => import('./candidatura/pages/vagas-candidatos/vagas-candidatos.component').then(m => m.VagasCandidatosComponent)
    },
    {
        path: 'candidatar',
        loadComponent: () => import('./candidatura/pages/candidatar-vaga/candidatar-vaga.component').then(m => m.CandidatarVagaComponent)
    }
];
