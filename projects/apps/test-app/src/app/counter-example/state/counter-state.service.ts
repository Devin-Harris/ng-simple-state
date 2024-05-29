import { Injectable } from '@angular/core';
import { StateService } from 'projects/libs/ngx-simple-state/src/lib/state-service';
import { initialValue } from './counter.model';

/**
 * Utilizing the StateService, you can pass an intial value and every field in the initialValue
 * will be turned into a writable signal, normal computed signal, or a callable action function and its subject counterpart.
 * This depends on if the field was created using the createStateSelector function or the createStateAction function.
 */
@Injectable({ providedIn: 'root' })
export class CounterStateService extends StateService(initialValue) {}
