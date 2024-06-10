import {
   Action,
   Store,
   createAction,
   createStore,
} from 'projects/libs/ngx-simple-state/src/public-api';

export type CounterStoreType = Store<{
   count: number;
   increment: Action;
}>;

export const counterStoreInput: CounterStoreType = {
   count: 0,
   increment: createAction((state) => state.count.update((c) => c + 1)),
};

export const SingletonCounterStore = createStore<CounterStoreType>(
   counterStoreInput,
   {
      providedIn: 'root',
   }
);
export const NonSingletonCounterStore = createStore<CounterStoreType>(
   counterStoreInput,
   {
      providedIn: 'root',
   }
);
