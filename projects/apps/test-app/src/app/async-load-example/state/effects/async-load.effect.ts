import { inject } from '@angular/core';
import { EffectService } from 'projects/libs/ngx-simple-state/src/lib/effect-service';
import { AsyncLoadApiService } from '../async-load-api.service';
import { LoadingState } from '../async-load-helper.model';
import {
   loadEntity,
   loadEntityFailure,
   loadEntitySuccess,
} from '../async-load.actions';
import { State } from '../async-load.model';

/**
 * Effect classes extends the base EffectService class.
 * They require a State generic type to be defined which should match the state type
 * of the StateService that will be consuming the effect class. Effect classes can
 * in theory be consumed by multiple stateservices but it is unlikely and not advised.
 * Each class has a abstract registerEffects method that should be responsible for defining the
 * actions and how they update the state on the stateService. Utilize the this.createActionEffect
 * method to automatically link up the stateSignal and destroyed subjects. This ensures the correct state
 * signal is manipulated and the subscriptions to the actions are properly disposed of when the state service is destroyed
 */
export class AsyncLoadEffects extends EffectService<State> {
   readonly apiService = inject(AsyncLoadApiService);

   registerEffects() {
      this.createAsyncActionEffect(loadEntity, async (state, action) => {
         state.callState.set(LoadingState.Loading);
         try {
            const response = await this.apiService.getEntity(action.payload.id);
            return loadEntitySuccess(response);
         } catch (error: any) {
            return loadEntityFailure({ error });
         }
      });
      this.createActionEffect(loadEntitySuccess, (state, action) => {
         state.patch({ ...action.payload, callState: LoadingState.Loaded });
      });
      this.createActionEffect(loadEntityFailure, (state, action) => {
         state.patch({ callState: { error: action.payload.error } });
      });
   }
}
