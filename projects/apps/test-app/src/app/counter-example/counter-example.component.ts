import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CounterCardComponent } from './components/counter-card.component';
import { CounterStore } from './state/counter.model';

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
}
