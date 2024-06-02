import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { CounterStore } from './state/counter.model';

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
   readonly store = inject(CounterStore);

   constructor() {
      this.store.$setCount.subscribe((t) => {
         console.log('setCount called');
      });
   }

   onIncrement() {
      this.store.increment();
   }
   onDecrement() {
      this.store.decrement();
   }
   onReset() {
      this.store.reset();
   }
   onSetTo100() {
      this.store.setCount(100);
   }
}
