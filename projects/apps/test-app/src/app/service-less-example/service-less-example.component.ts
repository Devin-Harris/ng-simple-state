import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { serviceLessState } from './state/service-less.model';

@Component({
   selector: 'ngx-simple-state-service-less-example',
   templateUrl: './service-less-example.component.html',
   styleUrls: ['./service-less-example.component.scss'],
   standalone: true,
   imports: [CommonModule],
})
export class ServiceLessExampleComponent {
   readonly serviceLessState = serviceLessState;

   /**
    * Lack of StateService forces the updates to the state to be done imperatively.
    * The StateSignal should have all the mutatable fields defined as signals automatically,
    * so simply manipulating them in such a manner can allow you some flexibility on how and where
    * the state changes. This can lead to difficult debugging if state changes happen in many places
    * so its important to keep track of where your stateSignal is used.
    */
   onIncrement() {
      this.serviceLessState.count.update((c) => c + 1);
   }
   onDecrement() {
      this.serviceLessState.count.update((c) => c - 1);
   }
   onReset() {
      this.serviceLessState.count.set(0);
   }
}
