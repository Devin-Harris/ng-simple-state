import { Injectable, computed, inject } from '@angular/core';
import { StateService } from 'projects/libs/ngx-simple-state/src/lib/state-service';
import { AppStateService } from '../../state/app-state.service';
import { initialValue } from './async-load.model';
import { AsyncLoadEffects } from './effects/async-load.effect';

@Injectable({ providedIn: 'root' })
export class AsyncLoadStateService extends StateService(initialValue, [
   AsyncLoadEffects,
]) {
   private readonly appState = inject(AppStateService);

   matchingCurrentUserName = computed(() => {
      return this.state.entityName() === this.appState.state.currentUserName();
   });
}
