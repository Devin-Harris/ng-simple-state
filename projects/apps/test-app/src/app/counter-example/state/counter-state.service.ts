import { Injectable } from '@angular/core';
import { StateService } from 'projects/libs/ngx-simple-state/src/lib/state-service';
import { initialValue } from './counter.model';
import { CounterEffects } from './effects/counter.effect';

/**
 * Utilizing the StateService, you can pass an intial value and an array of effects classes.
 * Every field in the initialValue will be turned into a writable signal or a normal computed signal,
 * depending on if the field was created using the createStateSelector function. The effects array should be
 * an array of classes that extend the EffectService<State> class where State is the same type as the initialValue.
 * The StateService will automatically call the registerEffects method on all these effects classes.
 */
@Injectable({ providedIn: 'root' })
export class CounterStateService extends StateService(initialValue, [
   CounterEffects,
]) {}
