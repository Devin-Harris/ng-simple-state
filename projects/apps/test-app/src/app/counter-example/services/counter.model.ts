import {
   StateSelector,
   createStateSelector,
} from 'projects/libs/ngx-simple-state/src/lib/state-signal';

export interface State {
   count: number;

   lessThan10: StateSelector<State, boolean>;
   lessThan100: StateSelector<State, boolean>;
   between10and100: StateSelector<State, boolean>;
}

export const initialValue: State = {
   count: 0,

   lessThan10: createStateSelector((state) => state.count() < 10),
   lessThan100: createStateSelector((state) => state.count() < 100),
   between10and100: createStateSelector(
      (state) => !state.lessThan10() && state.lessThan100()
   ),
};
