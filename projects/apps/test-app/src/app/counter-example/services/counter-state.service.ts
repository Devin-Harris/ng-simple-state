import { Injectable } from '@angular/core';
import { StateServiceFromInitialValue } from 'projects/libs/ngx-simple-state/src/lib/state-service';
import { initialValue } from './counter.model';
import { CounterEffects } from './effects/counter.effect';

@Injectable({ providedIn: 'root' })
export class CounterStateService extends StateServiceFromInitialValue(
   initialValue,
   {
      lessThan10: (state) => state.count() < 10,
      lessThan100: (state) => state.count() < 100,
      // between10and100: (state) => !state.lessThan10() && state.lessThan100(),
   },
   [CounterEffects]
) {}
