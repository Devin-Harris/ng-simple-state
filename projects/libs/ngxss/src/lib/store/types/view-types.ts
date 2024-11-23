import { Signal } from '@angular/core';
import { CreateAction, CreateSelector } from '../../../public-api';
import { WithHelperMethodToken } from './helper-method-types';

type ExcludeActions<T> = {
   [K in keyof T]: T[K] extends CreateAction<any, any> ? never : K;
}[keyof T];

export type ViewHelperMethod<T> = WithHelperMethodToken<
   Signal<{
      [x in ExcludeActions<T>]: T[x] extends CreateSelector<any, infer R>
         ? R
         : T[x];
   }>
>;
