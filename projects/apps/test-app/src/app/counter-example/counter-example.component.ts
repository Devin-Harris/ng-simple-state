import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { store } from 'projects/libs/ngxss/src/public-api';
import { CounterCardComponent } from './components/counter-card.component';
import { CounterStore, counterStoreInput } from './state/counter.model';

const ReadonlyStore = store.readonly(counterStoreInput);
const InjectableStore = store.injectable(counterStoreInput, {
   providedIn: 'root',
});
const InjectableReadonlyStore = store.injectable.readonly(counterStoreInput, {
   providedIn: 'root',
});
const ReadonlyInjectableStore = store.readonly.injectable(counterStoreInput, {
   providedIn: 'root',
});

@Component({
   selector: 'ngxss-counter-example',
   templateUrl: './counter-example.component.html',
   styleUrls: [
      './counter-example.component.scss',
      './../../styles/example-page.scss',
   ],
   standalone: true,
   imports: [CommonModule, CounterCardComponent],
})
export class CounterExampleComponent {
   readonly globalStore = CounterStore;
   readonly readonlyStore = ReadonlyStore;
   readonly injectableStore = inject(InjectableStore);
   readonly injectableReadonlyStore = inject(InjectableReadonlyStore);
   readonly readonlyInjectableStore = inject(ReadonlyInjectableStore);

   constructor() {
      const { count, between5and10, lessThan5 } = this.globalStore.events;
      count.pipe(takeUntilDestroyed()).subscribe((c) => {
         console.log('new count', c);
      });
      between5and10.pipe(takeUntilDestroyed()).subscribe((c) => {
         console.log('new between5and10', c);
      });
      lessThan5.pipe(takeUntilDestroyed()).subscribe((c) => {
         console.log('new lessThan5', c);
      });
   }
}
