import { Injectable, inject } from '@angular/core';
import { StateService } from 'projects/libs/ngx-simple-state/src/lib/state-service';
import { takeUntil } from 'rxjs';
import { AsyncLoadApiService } from './async-load-api.service';
import { initialValue } from './async-load.model';

/**
 * Utilizing the StateService, you can pass an intial value and an array of effects classes.
 * Every field in the initialValue will be turned into a writable signal or a normal computed signal,
 * depending on if the field was created using the createStateSelector function. The effects array should be
 * an array of classes that extend the EffectService<State> class where State is the same type as the initialValue.
 * The StateService will automatically call the registerEffects method on all these effects classes.
 */
@Injectable({ providedIn: 'root' })
export class AsyncLoadStateService extends StateService(initialValue) {
   readonly apiService = inject(AsyncLoadApiService);

   constructor() {
      super();
      this.state.$loadEntity
         .pipe(takeUntil(this.destroyed))
         .subscribe(async (props) => {
            try {
               const response = await this.apiService.getEntity(props.id);
               return this.state.loadEntitySuccess(response);
            } catch (error: any) {
               return this.state.loadEntityFailure({ error });
            }
         });
   }
}
