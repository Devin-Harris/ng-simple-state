import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { names } from '../state/names';
import { AsyncLoadStateService } from './state/async-load-state.service';

@Component({
   selector: 'ngx-simple-state-async-load-example',
   templateUrl: './async-load-example.component.html',
   styleUrls: [
      './async-load-example.component.scss',
      './../../styles/example-page.scss',
   ],
   standalone: true,
   imports: [CommonModule],
})
export class AsyncLoadComponent {
   readonly stateService = inject(AsyncLoadStateService);

   onLoad() {
      this.stateService.state.loadEntity({
         id: Math.floor(Math.random() * (names.length - 1)),
      });
   }
}
