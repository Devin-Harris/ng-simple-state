import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import {
   NonSingletonCounterState,
   SingletonCounterState,
} from './state/singleton-counter.model';

@Component({
   selector: 'ngxss-singleton-vs-nonsingleton',
   templateUrl: './singleton-vs-nonsingleton.component.html',
   styleUrls: [
      './singleton-vs-nonsingleton.component.scss',
      './../../styles/example-page.scss',
   ],
   standalone: true,
   imports: [CommonModule],
   providers: [NonSingletonCounterState],
})
export class SingletonVsNonSingletonComponent {
   @Input() id: number = 0;

   @Output() removeInstance = new EventEmitter<void>();

   readonly singletonState = inject(SingletonCounterState);

   readonly nonSingletonState = inject(NonSingletonCounterState);
}
