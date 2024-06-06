import {
   StateAction,
   createStateAction,
   stateSignal,
} from 'projects/libs/ngx-simple-state/src/public-api';

export interface State {
   count: number;
   increment: StateAction<State>;
}

export const counterStoreInitialValue: State = {
   count: 0,
   increment: createStateAction((state) => state.count.update((c) => c + 1)),
};

export const SingletonCounterStore = stateSignal<State>(
   counterStoreInitialValue,
   {
      providedIn: 'root',
   }
);
export const NonSingletonCounterStore = stateSignal<State>(
   counterStoreInitialValue,
   {
      providedIn: 'root',
   }
);
