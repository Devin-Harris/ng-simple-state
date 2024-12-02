import { Subject } from 'rxjs';
import { CreateAction, CreateSelector, Store } from '../../../public-api';
import { WithHelperMethodToken } from './helper-method-types';

export type StoreEvents<T> = {
   [x in keyof T]: T[x] extends CreateAction<any, infer P>
      ? Subject<P>
      : T[x] extends CreateSelector<any, infer R>
      ? Subject<R>
      : T[x] extends Store<infer T2>
      ? StoreEvents<T2>
      : Subject<T[x]>;
};

export type EventsHelperMethod<T> = WithHelperMethodToken<StoreEvents<T>>;
