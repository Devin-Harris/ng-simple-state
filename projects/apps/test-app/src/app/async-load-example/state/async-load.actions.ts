import {
   createAction,
   props,
} from 'projects/libs/ngx-simple-state/src/lib/state-action';

export const loadEntity = createAction('loadEntity', props<{ id: number }>());
export const loadEntitySuccess = createAction(
   'loadEntity success',
   props<{ entityName: string; entityId: number }>()
);
export const loadEntityFailure = createAction(
   'loadEntity failure',
   props<{ error: Error }>()
);
