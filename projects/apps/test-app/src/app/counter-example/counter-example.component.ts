import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
   actionToSubject,
   store,
   StoreSignal,
} from 'projects/libs/ngxss/src/public-api';
import {
   CounterStore,
   counterStoreInput,
   CounterStoreType,
} from './state/counter.model';

@Component({
   selector: 'ngxss-counter-example',
   templateUrl: './counter-example.component.html',
   styleUrls: [
      './counter-example.component.scss',
      './../../styles/example-page.scss',
   ],
   standalone: true,
   imports: [CommonModule],
})
export class CounterExampleComponent {
   readonly globalStore = CounterStore;

   readonly componentLevelStore: StoreSignal<CounterStoreType>;

   constructor() {
      this.componentLevelStore = store<CounterStoreType>(counterStoreInput);

      actionToSubject(this.globalStore.setCount).subscribe((t) => {
         console.log('Global Store: setCount called', t);
      });
      actionToSubject(this.componentLevelStore.setCount).subscribe((t) => {
         console.log('Component Store: setCount called', t);
      });
   }

   onIncrement() {
      this.globalStore.increment();
      this.componentLevelStore.increment();
   }
   onDecrement() {
      this.globalStore.decrement();
      this.componentLevelStore.decrement();
   }
   onResetCount() {
      this.globalStore.resetCount();
      this.componentLevelStore.resetCount();
   }
   onSetTo100() {
      this.globalStore.setCount(100);
      this.componentLevelStore.setCount(100);
   }
}
