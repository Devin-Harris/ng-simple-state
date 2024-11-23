import { Subject } from 'rxjs';
import { CreateAction } from '../../../public-api';
import { WithHelperMethodToken } from './helper-method-types';

export type StoreEvents<T> = {
   [x in keyof T as T[x] extends CreateAction<any, any>
      ? x
      : never]: T[x] extends CreateAction<any, infer P> ? Subject<P> : never;
};

export type EventsHelperMethod<T> = WithHelperMethodToken<StoreEvents<T>>;
