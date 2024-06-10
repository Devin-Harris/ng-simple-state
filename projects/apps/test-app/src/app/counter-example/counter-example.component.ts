import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
   StoreSignal,
   createAction,
   createSelector,
   storeSlice,
} from 'projects/libs/ngx-simple-state/src/public-api';
import { CounterStore, CounterStoreType } from './state/counter.model';

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

   s: StoreSignal<CounterStoreType>;

   constructor() {
      this.s = storeSlice<CounterStoreType>({
         count: 0,
         setCount: createAction((state, count) => state.count.set(count)),
         increment: createAction((state) => state.count.update((c) => c + 1)),
         decrement: createAction((state) => state.count.update((c) => c - 1)),
         reset: createAction((state) => state.setCount(0)),
         lessThan5: createSelector((state) => state.count() < 5),
         lessThan10: createSelector((state) => state.count() < 10),
         between5and10: createSelector(
            (state) => !state.lessThan5() && state.lessThan10()
         ),
      });
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
