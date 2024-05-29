import {
   StateEffect,
   createStateEffect,
} from 'projects/libs/ngx-simple-state/src/lib/state-effect';
import {
   StateSelector,
   createStateSelector,
} from 'projects/libs/ngx-simple-state/src/lib/state-selector';
import {} from 'projects/libs/ngx-simple-state/src/lib/state-signal';

export interface State {
   count: number;

   setCount: StateEffect<State, number>;
   increment: StateEffect<State>;
   decrement: StateEffect<State>;
   reset: StateEffect<State>;

   lessThan5: StateSelector<State, boolean>;
   lessThan10: StateSelector<State, boolean>;
   between5and10: StateSelector<State, boolean>;
}

export const initialValue: State = {
   count: 0,

   /**
    * Effects should be defined with the createStateEffect method.
    * This method puts a special token on the function objects which is used
    * when building the stateSignal to automatically impose the state objects when calling
    * the effects. It also creates another field with a $ prefix which is a subject of the given
    * effect. This is useful when you want to use rxjs to trigger other events from a interaction.
    */
   setCount: createStateEffect((state, count) => state.count.set(count)),
   increment: createStateEffect((state) => state.count.update((c) => c + 1)),
   decrement: createStateEffect((state) => state.count.update((c) => c - 1)),
   reset: createStateEffect((state) => state.setCount(0)),

   /**
    * Selectors should be defined with the createStateSelector method.
    * This method puts a special token on the function objects which is used
    * when building the stateSignal to force the selectors to be readonly signals
    * instead of writable ones.
    */
   lessThan5: createStateSelector((state) => state.count() < 5),
   lessThan10: createStateSelector((state) => state.count() < 10),
   between5and10: createStateSelector(
      (state) => !state.lessThan5() && state.lessThan10()
   ),
};
