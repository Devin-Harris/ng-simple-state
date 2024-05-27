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
