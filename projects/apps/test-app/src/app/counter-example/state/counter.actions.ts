import { createAction } from 'projects/libs/ngx-simple-state/src/lib/state-action';

export const increment = createAction('increment');
export const decrement = createAction('decrement');
export const reset = createAction('reset');
