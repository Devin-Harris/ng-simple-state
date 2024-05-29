import {
   StateAction,
   createStateAction,
} from 'projects/libs/ngx-simple-state/src/lib/state-action';
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
interface Actions {
   setCount: StateAction<State, number>;
   increment: StateAction<State>;
   decrement: StateAction<State>;
   reset: StateAction<State>;
}
export type State = RootState & Selectors & Actions;

/**
 * Note serviceLessState defined globally like this will not be lazy loaded
 * This state will be allocated when the app initializes regardless of where it is first used.
 * State Services build there stateSignal internally thus are not created until they are injected somwhere.
 * Globally defined state may be a pattern you want depending on your use case, but should be cautioned if memory usage is a concern
 */
export const serviceLessState = stateSignal<State>({
   count: 0,

   setCount: createStateAction((state, count) => state.count.set(count)),
   increment: createStateAction((state) => state.count.update((c) => c + 1)),
   decrement: createStateAction((state) => state.count.update((c) => c - 1)),
   reset: createStateAction((state) => state.setCount(0)),

   lessThan5: createStateSelector((state) => state.count() < 5),
   lessThan10: createStateSelector((state) => state.count() < 10),
   between5and10: createStateSelector(
      (state) => !state.lessThan5() && state.lessThan10()
   ),
});
