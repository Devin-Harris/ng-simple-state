import { Subject } from 'rxjs';
import { CreateAction, Store } from '../../../public-api';
import { WithHelperMethodToken } from './helper-method-types';

export type StoreEvents<T> = {
   [x in keyof T as T[x] extends CreateAction<any, any>
      ? x
      : T[x] extends Store<any>
      ? x
      : never]: T[x] extends CreateAction<any, infer P>
      ? Subject<P>
      : T[x] extends Store<infer T2>
      ? StoreEvents<T2>
      : never;
};

export type EventsHelperMethod<T> = WithHelperMethodToken<StoreEvents<T>>;
