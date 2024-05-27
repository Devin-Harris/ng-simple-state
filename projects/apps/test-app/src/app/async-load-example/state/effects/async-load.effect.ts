import { inject } from '@angular/core';
import { EffectService } from 'projects/libs/ngx-simple-state/src/lib/effect-service';
import { AsyncLoadApiService } from '../async-load-api.service';
import {
   loadEntity,
   loadEntityFailure,
   loadEntitySuccess,
} from '../async-load.actions';
import { LoadingState, State } from '../async-load.model';

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
