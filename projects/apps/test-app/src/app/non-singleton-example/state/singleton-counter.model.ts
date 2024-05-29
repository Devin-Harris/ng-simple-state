import {
   StateAction,
   createStateAction,
} from 'projects/libs/ngx-simple-state/src/public-api';

export interface State {
   count: number;

   increment: StateAction<State>;
}

export const initialValue: State = {
   count: 0,

   increment: createStateAction((state) => state.count.update((c) => c + 1)),
};
