import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { store } from 'projects/libs/ngxss/src/public-api';
import { CounterCardComponent } from './components/counter-card.component';
import { CounterStore, counterStoreInput } from './state/counter.model';

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

   readonlyStore = store.readonly(counterStoreInput);
   readonlyInjectableStore = inject(
      store.readonly.injectable(counterStoreInput, { providedIn: 'root' })
   );
   injectableStore = inject(
      store.injectable(counterStoreInput, { providedIn: 'root' })
   );
   injectableReadonlyStore = inject(
      store.injectable.readonly(counterStoreInput, { providedIn: 'root' })
   );
}
