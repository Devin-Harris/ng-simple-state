import { Injectable } from '@angular/core';
import { StateService } from 'projects/libs/ngx-simple-state/src/lib/state-service';
import { initialValue } from './app-state.model';

@Injectable({ providedIn: 'root' })
export class AppStateService extends StateService(initialValue) {}
