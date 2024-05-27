import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { NonSingletonCounterStateService } from './state/non-singleton-counter-state.service';
import { SingletonCounterStateService } from './state/singleton-counter-state.service';

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

   readonly singletonService = inject(SingletonCounterStateService);

   readonly nonSingletonService = inject(NonSingletonCounterStateService);
}
