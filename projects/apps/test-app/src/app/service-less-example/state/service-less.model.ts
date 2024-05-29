import {
   StateEffect,
   createStateEffect,
} from 'projects/libs/ngx-simple-state/src/lib/state-effect';
import {
   StateSelector,
   createStateSelector,
} from 'projects/libs/ngx-simple-state/src/lib/state-selector';
import {
   StateSignal,
   stateSignal,
} from 'projects/libs/ngx-simple-state/src/lib/state-signal';

/**
 * Pull the selectors type and definition out into seperate objects in order to avoid circularly references
 */
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

const effects: Effects = {
   setCount: createStateEffect((state, count) => state.count.set(count)),
   increment: createStateEffect((state) => state.count.update((c) => c + 1)),
   decrement: createStateEffect((state) => state.count.update((c) => c - 1)),
   reset: createStateEffect((state) => state.setCount(0)),
};

const selectors: Selectors = {
   lessThan5: createStateSelector((state) => state.count() < 5),
   lessThan10: createStateSelector((state) => state.count() < 10),
   between5and10: createStateSelector(
      (state) => !state.lessThan5() && state.lessThan10()
   ),
};

/**
 * Note serviceLessState defined globally like this will not be lazy loaded
 * This state will be allocated when the app initializes regardless of where it is first used.
 * State Services build there stateSignal internally thus are not created until they are injected somwhere.
 * Globally defined state may be a pattern you want depending on your use case, but should be cautioned if memory usage is a concern
 */
export const serviceLessState: StateSignal<State> = stateSignal({
   count: 0,
   ...effects,
   ...selectors,
});
