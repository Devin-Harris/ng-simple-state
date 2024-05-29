import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { serviceLessState } from './state/service-less.model';

@Component({
   selector: 'ngx-simple-state-service-less-example',
   templateUrl: './service-less-example.component.html',
   styleUrls: [
      './service-less-example.component.scss',
      './../../styles/example-page.scss',
   ],
   standalone: true,
   imports: [CommonModule],
})
export class ServiceLessExampleComponent {
   readonly serviceLessState = serviceLessState;

   onIncrement() {
      serviceLessState.increment();
   }
   onDecrement() {
      serviceLessState.decrement();
   }
   onReset() {
      serviceLessState.reset();
   }
   onSetTo100() {
      serviceLessState.setCount(100);
   }
}
