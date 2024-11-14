import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
   actionToSubject,
   createState,
   StateSignal,
} from 'projects/libs/ngxss/src/public-api';
import {
   CounterState,
   counterStateInput,
   CounterStateType,
} from './state/counter.model';

@Component({
   selector: 'ngxss-counter-example',
   templateUrl: './counter-example.component.html',
   styleUrls: [
      './counter-example.component.scss',
      './../../styles/example-page.scss',
   ],
   standalone: true,
   imports: [CommonModule],
})
export class CounterExampleComponent {
   readonly globalState = CounterState;

   readonly componentLevelState: StateSignal<CounterStateType>;

   constructor() {
      this.componentLevelState =
         createState<CounterStateType>(counterStateInput);

      actionToSubject(this.globalState.setCount).subscribe((t) => {
         console.log('Global Store: setCount called', t);
      });
      actionToSubject(this.componentLevelState.setCount).subscribe((t) => {
         console.log('Component Store: setCount called', t);
      });
   }

   onIncrement() {
      this.globalState.increment();
      this.componentLevelState.increment();
   }
   onDecrement() {
      this.globalState.decrement();
      this.componentLevelState.decrement();
   }
   onResetCount() {
      this.globalState.resetCount();
      this.componentLevelState.resetCount();
   }
   onSetTo100() {
      this.globalState.setCount(100);
      this.componentLevelState.setCount(100);
   }
}
