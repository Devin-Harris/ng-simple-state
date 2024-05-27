import { Injectable } from '@angular/core';
import { StateService } from 'projects/libs/ngx-simple-state/src/lib/state-service';
import { initialValue } from './async-load.model';
import { AsyncLoadEffects } from './effects/async-load.effect';

@Injectable({ providedIn: 'root' })
export class AsyncLoadStateService extends StateService(initialValue, [
   AsyncLoadEffects,
]) {}
