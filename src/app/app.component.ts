import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';

import {
  PoMenuItem,
  PoMenuModule,
  PoPageModule,
  PoToolbarModule,
} from '@po-ui/ng-components';
import { Router, RouterModule } from "@angular/router";

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    PoToolbarModule,
    PoMenuModule,
    PoPageModule,
    RouterModule
],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {

  private readonly router: Router = inject(Router);

  readonly menus: Array<PoMenuItem> = [
    { label: 'Home', link: '/' },
    { label: 'Candidatos', link: '/candidatos' },
    { label: 'Vagas', link: '/vagas' },
    { label: 'Candidatar-se', link: '/candidatar' }
  ];
}
