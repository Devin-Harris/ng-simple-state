import { Injectable } from '@angular/core';
import { StateService } from 'projects/libs/ngx-simple-state/src/lib/state-service';
import { initialValue } from './counter.model';
import { CounterEffects } from './effects/counter.effect';

@Injectable({ providedIn: 'root' })
export class CounterStateService extends StateService(initialValue, [
   CounterEffects,
]) {}
