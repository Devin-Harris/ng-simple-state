import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { routes } from './app.config';

@Component({
   selector: 'ngx-simple-state-root',
   templateUrl: './app.component.html',
   styleUrls: ['./app.component.scss'],
   standalone: true,
   imports: [CommonModule, RouterModule],
})
export class AppComponent {
   readonly routes = routes;
}
