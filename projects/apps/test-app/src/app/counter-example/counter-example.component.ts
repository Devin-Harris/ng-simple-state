import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
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
}
