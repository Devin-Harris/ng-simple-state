import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { CounterStateService } from './state/counter-state.service';

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

   constructor() {
      this.stateService.state.$setCount.subscribe((t) => {
         console.log('here');
      });
   }

   onIncrement() {
      this.stateService.state.increment();
   }
   onDecrement() {
      this.stateService.state.decrement();
   }
   onReset() {
      this.stateService.state.reset();
   }
   onSetTo100() {
      this.stateService.state.setCount(100);
   }
}
