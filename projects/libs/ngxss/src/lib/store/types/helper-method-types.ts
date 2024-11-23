import { NGX_SIMPLE_STATE_HELPER_METHOD_TOKEN } from '../tokens/store-tokens';
import { EventsHelperMethod } from './event-types';
import { PatchHelperMethod } from './patch-types';
import { ResetHelperMethod } from './reset-types';
import { Store, StoreMutability } from './store-types';
import { ViewHelperMethod } from './view-types';

export type WithHelperMethodToken<T> = T & {
   [NGX_SIMPLE_STATE_HELPER_METHOD_TOKEN]: true;
};

export type HelperMethodUnion =
   | PatchHelperMethod<any>
   | ViewHelperMethod<any>
   | ResetHelperMethod<any>
   | EventsHelperMethod<any>;

export type StoreSignalHelperMethods<
   T,
   Mutability extends StoreMutability = StoreMutability.writable
> = {
   [x in Mutability extends StoreMutability.writable
      ? 'patch'
      : never]: PatchHelperMethod<T extends Store<infer T2> ? T2 : T>;
} & {
   view: ViewHelperMethod<T extends Store<infer T2> ? T2 : T>;
   reset: ResetHelperMethod<T extends Store<infer T2> ? T2 : T>;
   events: EventsHelperMethod<T extends Store<infer T2> ? T2 : T>;
};

export type ExcludeStoreSignalHelperMethods<T> = {
   [x in keyof T]: x extends keyof StoreSignalHelperMethods<T> ? never : x;
}[keyof T];
