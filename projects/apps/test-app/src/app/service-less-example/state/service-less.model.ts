import {
   StateSelector,
   createStateSelector,
   stateSignal,
} from 'projects/libs/ngx-simple-state/src/lib/state-signal';

export interface State {
   count: number;
}

export interface Selectors {
   lessThan5: StateSelector<State & Selectors, boolean>;
   lessThan10: StateSelector<State & Selectors, boolean>;
   between5and10: StateSelector<State & Selectors, boolean>;
}

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
export const serviceLessState = stateSignal({
   count: 0,
   ...selectors,
});
