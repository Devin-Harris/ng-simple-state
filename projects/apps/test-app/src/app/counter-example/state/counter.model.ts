import {
   Action,
   createAction,
} from 'projects/libs/ngx-simple-state/src/lib/action';
import {
   Selector,
   createSelector,
} from 'projects/libs/ngx-simple-state/src/lib/selector';
import {
   Store,
   StoreSignalInput,
   store,
} from 'projects/libs/ngx-simple-state/src/lib/store-signal';

export type CounterStore = Store<{
   count: number;

   setCount: Action<number>;
   increment: Action;
   decrement: Action;
   reset: Action;

   lessThan5: Selector<boolean>;
   lessThan10: Selector<boolean>;
   between5and10: Selector<boolean>;
}>;

const counterStoreInput: StoreSignalInput<CounterStore> = {
   count: 0,

   /**
    * Actions should be defined with the createAction method.
    * This method puts a special token on the function objects which is used
    * when building the store to automatically impose the state objects when calling
    * the Actions. It also creates another field with a $ prefix which is a subject of the given
    * Action. This is useful when you want to use rxjs or dependency injection to
    * trigger other events from a interaction.
    */
   setCount: createAction((state, count) => state.count.set(count)),
   increment: createAction((state) => state.count.update((c) => c + 1)),
   decrement: createAction((state) => state.count.update((c) => c - 1)),
   reset: createAction((state) => state.setCount(0)),

   /**
    * Selectors should be defined with the createSelector method.
    * This method puts a special token on the function objects which is used
    * when building the store to force the selectors to be readonly signals
    * instead of writable ones.
    */
   lessThan5: createSelector((state) => state.count() < 5),
   lessThan10: createSelector((state) => state.count() < 10),
   between5and10: createSelector(
      (state) => !state.lessThan5() && state.lessThan10()
   ),
};

export const CounterStore = store(counterStoreInput, {
   providedIn: 'root',
});
