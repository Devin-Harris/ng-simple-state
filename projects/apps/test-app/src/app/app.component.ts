import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AppStateService } from './state/app-state.service';

@Component({
   selector: 'ngx-simple-state-root',
   templateUrl: './app.component.html',
   styleUrls: ['./app.component.scss'],
   standalone: true,
   imports: [RouterLink, RouterOutlet],
})
export class AppComponent {
   readonly appState = inject(AppStateService);
}
