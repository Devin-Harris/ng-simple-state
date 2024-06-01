import { inject } from '@angular/core';
import { Subject } from 'rxjs';
import { Actions } from './state-action';
import { StateSignal, stateSignal } from './state-signal';

type StateServiceFromInitialValueConstructor<T extends {}> = new (
   ...args: any[]
) => StateServiceBase<T>;

export function StateService<InitialValueType extends {}>(
   intialValue: InitialValueType
): StateServiceFromInitialValueConstructor<InitialValueType> {
   return class extends StateServiceBase<InitialValueType> {
      constructor() {
         super(intialValue);
      }
   };
}

class StateServiceBase<InitialValueType extends {}> {
   /**
    * State object with all fields as signals
    */
   readonly state: StateSignal<InitialValueType>;

   readonly actions = inject(Actions);

   protected destroyed = new Subject<void>();

   constructor(intialValue: InitialValueType) {
      this.state = stateSignal(intialValue);
   }

   /**
    * Method for nexting internal destroyed subject.
    * Useful for services that may want to run some cleanup code when they are set to destroy.
    */
   destroy(): void {
      this.destroyed.next();
   }
}
