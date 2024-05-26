import { StateSignal } from 'projects/libs/ngx-simple-state/src/lib/state-signal';

export interface State {
   count: number;
}

export const initialValue: State = {
   count: 0,
};

export const selectors = {
   lessThan10: (state: StateSignal<State>) => state.count() < 10,
};
