import {
   Action,
   State,
   createAction,
   createInjectableState,
} from 'projects/libs/ngxss/src/public-api';

export type CounterStateType = State<{
   count: number;
   increment: Action;
}>;

export const counterStateInput: CounterStateType = {
   count: 0,
   increment: createAction((state) => state.count.update((c) => c + 1)),
};

export const SingletonCounterState = createInjectableState<CounterStateType>(
   counterStateInput,
   {
      providedIn: 'root',
   }
);
export const NonSingletonCounterState = createInjectableState<CounterStateType>(
   counterStateInput,
   {
      providedIn: 'root',
   }
);
