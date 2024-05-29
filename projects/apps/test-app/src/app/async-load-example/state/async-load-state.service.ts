import { Injectable, inject } from '@angular/core';
import { StateService } from 'projects/libs/ngx-simple-state/src/lib/state-service';
import { takeUntil } from 'rxjs';
import { AsyncLoadApiService } from './async-load-api.service';
import { initialValue } from './async-load.model';

/**
 * Utilizing the StateService, you can pass an intial value and every field in the initialValue
 * will be turned into a writable signal, normal computed signal, or a callable action function and its subject counterpart.
 * This depends on if the field was created using the createStateSelector function or the createStateAction function.
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
