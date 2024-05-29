import {
   StateEffect,
   createStateEffect,
} from 'projects/libs/ngx-simple-state/src/lib/state-effect';
import {
   StateSelector,
   createStateSelector,
} from 'projects/libs/ngx-simple-state/src/lib/state-selector';
import { stateSignal } from 'projects/libs/ngx-simple-state/src/lib/state-signal';

interface RootState {
   count: number;
}
interface Selectors {
   lessThan5: StateSelector<State, boolean>;
   lessThan10: StateSelector<State, boolean>;
   between5and10: StateSelector<State, boolean>;
}
interface Effects {
   setCount: StateEffect<State, number>;
   increment: StateEffect<State>;
   decrement: StateEffect<State>;
   reset: StateEffect<State>;
}
export type State = RootState & Selectors & Effects;

/**
 * Note serviceLessState defined globally like this will not be lazy loaded
 * This state will be allocated when the app initializes regardless of where it is first used.
 * State Services build there stateSignal internally thus are not created until they are injected somwhere.
 * Globally defined state may be a pattern you want depending on your use case, but should be cautioned if memory usage is a concern
 */
const initialValue: State = {
   count: 0,

   setCount: createStateEffect((state, count) => state.count.set(count)),
   increment: createStateEffect((state) => state.count.update((c) => c + 1)),
   decrement: createStateEffect((state) => state.count.update((c) => c - 1)),
   reset: createStateEffect((state) => state.setCount(0)),

   lessThan5: createStateSelector((state) => state.count() < 5),
   lessThan10: createStateSelector((state) => state.count() < 10),
   between5and10: createStateSelector(
      (state) => !state.lessThan5() && state.lessThan10()
   ),
};
export const serviceLessState = stateSignal(initialValue);
