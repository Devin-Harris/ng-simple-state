import { EffectService } from 'projects/libs/ngx-simple-state/src/lib/effect-service';
import { decrement, increment, reset } from '../counter.actions';
import { State } from '../counter.model';

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
