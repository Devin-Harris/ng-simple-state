import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { CounterStateService } from './state/counter-state.service';
import { decrement, increment, reset } from './state/counter.actions';

@Component({
   selector: 'ngx-simple-state-counter-example',
   templateUrl: './counter-example.component.html',
   styleUrls: [
      './counter-example.component.scss',
      './../../styles/example-page.scss',
   ],
   standalone: true,
   imports: [CommonModule],
})
export class CounterExampleComponent {
   readonly stateService = inject(CounterStateService);

   onIncrement() {
      increment();
   }
   onDecrement() {
      decrement();
   }
   onReset() {
      reset();
   }
}
