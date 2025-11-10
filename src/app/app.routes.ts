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
    }
];
