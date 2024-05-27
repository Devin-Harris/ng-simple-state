import { EffectService } from 'projects/libs/ngx-simple-state/src/lib/effect-service';
import { decrement, increment, reset } from '../counter.actions';
import { State } from '../counter.model';

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
export class CounterEffects extends EffectService<State> {
   registerEffects() {
      this.createActionEffect(increment, (state, action) => {
         state.count.update((c) => c + 1);
      });
      this.createActionEffect(decrement, (state, action) => {
         state.count.update((c) => c - 1);
      });
      this.createActionEffect(reset, (state, action) => {
         state.count.set(0);
      });
   }
}
