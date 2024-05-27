import {
   StateSelector,
   createStateSelector,
} from 'projects/libs/ngx-simple-state/src/lib/state-signal';

export interface State {
   count: number;

   lessThan5: StateSelector<State, boolean>;
   lessThan10: StateSelector<State, boolean>;
   between5and10: StateSelector<State, boolean>;
}

export const initialValue: State = {
   count: 0,

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
