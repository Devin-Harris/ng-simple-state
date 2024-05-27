import {
   StateSelector,
   StateSignal,
   createStateSelector,
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
export type State = RootState & Selectors;

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
   ...selectors,
});
