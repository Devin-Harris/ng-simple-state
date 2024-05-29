import { Injectable } from '@angular/core';
import { StateService } from 'projects/libs/ngx-simple-state/src/lib/state-service';
import { initialValue } from './singleton-counter.model';

@Injectable()
export class NonSingletonCounterStateService extends StateService(
   initialValue
) {}
