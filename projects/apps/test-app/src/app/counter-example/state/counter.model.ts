import {
   StateAction,
   createStateAction,
} from 'projects/libs/ngx-simple-state/src/lib/state-action';
import {
   StateSelector,
   createStateSelector,
} from 'projects/libs/ngx-simple-state/src/lib/state-selector';
import {} from 'projects/libs/ngx-simple-state/src/lib/state-signal';

export interface State {
   count: number;

   setCount: StateAction<State, number>;
   increment: StateAction<State>;
   decrement: StateAction<State>;
   reset: StateAction<State>;

   lessThan5: StateSelector<State, boolean>;
   lessThan10: StateSelector<State, boolean>;
   between5and10: StateSelector<State, boolean>;
}

const setCount = createStateAction<State, number>((state, count) =>
   state.count.set(count)
);
const increment = createStateAction<State>((state) =>
   state.count.update((c) => c + 1)
);
const decrement = createStateAction<State>((state) =>
   state.count.update((c) => c - 1)
);
const reset = createStateAction<State>((state) => state.setCount(0));

export const initialValue: State = {
   count: 0,

   /**
    * Actions should be defined with the createStateAction method.
    * This method puts a special token on the function objects which is used
    * when building the stateSignal to automatically impose the state objects when calling
    * the Actions. It also creates another field with a $ prefix which is a subject of the given
    * Action. This is useful when you want to use rxjs or dependency injection to
    * trigger other events from a interaction.
    */
   setCount,
   increment,
   decrement,
   reset,

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
