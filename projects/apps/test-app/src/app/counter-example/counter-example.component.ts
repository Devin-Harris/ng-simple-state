import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
   StoreSignal,
   createStoreSlice,
} from 'projects/libs/ngx-simple-state/src/public-api';
import {
   CounterStore,
   CounterStoreType,
   counterStoreInput,
} from './state/counter.model';

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

   readonly componentLevelStore: StoreSignal<CounterStoreType>;

   constructor() {
      this.componentLevelStore =
         createStoreSlice<CounterStoreType>(counterStoreInput);

      this.store.$setCount.subscribe((t) => {
         console.log('Global Store: setCount called');
      });
      this.store.$setCount.subscribe((t) => {
         console.log('Component Store: setCount called');
      });
   }

   onIncrement() {
      this.store.increment();
      this.componentLevelStore.increment();
   }
   onDecrement() {
      this.store.decrement();
      this.componentLevelStore.decrement();
   }
   onReset() {
      this.store.reset();
      this.componentLevelStore.reset();
   }
   onSetTo100() {
      this.store.setCount(100);
      this.componentLevelStore.setCount(100);
   }
}
