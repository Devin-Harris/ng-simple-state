import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { stateSignal } from 'projects/libs/ngx-simple-state/src/public-api';
import { NonSingletonCounterStateService } from './state/non-singleton-counter-state.service';
import { SingletonCounterStateService } from './state/singleton-counter-state.service';
import { initialValue } from './state/singleton-counter.model';

@Component({
   selector: 'ngx-simple-state-singleton-vs-nonsingleton',
   templateUrl: './singleton-vs-nonsingleton.component.html',
   styleUrls: [
      './singleton-vs-nonsingleton.component.scss',
      './../../styles/example-page.scss',
   ],
   standalone: true,
   imports: [CommonModule],
   providers: [NonSingletonCounterStateService],
})
export class SingletonVsNonSingletonComponent {
   @Input() id: number = 0;

   @Output() removeInstance = new EventEmitter<void>();

   readonly singletonService = inject(SingletonCounterStateService);

   readonly nonSingletonService = inject(NonSingletonCounterStateService);

   readonly componentState = stateSignal(initialValue);

   incrementComponentState() {
      this.componentState.count.update((c) => c + 1);
   }
}
