import { Subject } from 'rxjs';
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

export class StateServiceBase<InitialValueType extends {}> {
   /**
    * State object with all fields as signals
    */
   readonly state: StateSignal<InitialValueType>;

   protected destroyed = new Subject<void>();

   constructor(intialValue: InitialValueType) {
      this.state = stateSignal(intialValue);
   }

   /**
    * Method for nexting internal destroyed subject.
    * Useful for services that may want to run some cleanup code when they are set to destroy.
    * Clears all subscriptions to effects build with createActionEffect and createAsyncActionEffect methods
    */
   destroy(): void {
      this.destroyed.next();
   }
}
