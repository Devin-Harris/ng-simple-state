import {
   Action,
   createAction,
   store,
} from 'projects/libs/ngx-simple-state/src/public-api';

export interface State {
   count: number;
   increment: Action<State>;
}

export const counterStoreInitialValue: State = {
   count: 0,
   increment: createAction((state) => state.count.update((c) => c + 1)),
};

export const SingletonCounterStore = store<State>(counterStoreInitialValue, {
   providedIn: 'root',
});
export const NonSingletonCounterStore = store<State>(counterStoreInitialValue, {
   providedIn: 'root',
});
