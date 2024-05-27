import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { routes } from './app.config';
import { AppStateService } from './state/app-state.service';

@Component({
   selector: 'ngx-simple-state-root',
   templateUrl: './app.component.html',
   styleUrls: ['./app.component.scss'],
   standalone: true,
   imports: [CommonModule, RouterModule],
})
export class AppComponent {
   readonly appState = inject(AppStateService);

   readonly routes = routes;
}
