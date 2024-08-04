import { effect, signal, untracked } from '@angular/core';
import { NGX_SIMPLE_LAST_ACTION_KEY_TOKEN } from './action';
import { StoreSignal } from './store-signal';

export type StoreLog<T> = {
   state: T;
   diff?: any;
   action?: string | number | symbol;
};

export type StoreLogOptions = { maxHistorySize?: number };

export abstract class StoreLogger<T = any> {
   readonly logging = signal(false);

   readonly history = signal<StoreLog<T>[]>([]);
   private readonly historySync$ = effect(() => {
      const view = this.store.view();
      untracked(() => {
         const action =
            this.store[NGX_SIMPLE_LAST_ACTION_KEY_TOKEN]() ?? undefined;
         let historyLength = this.history().length;
         this.history.mutate((h) => {
            if (this.options?.maxHistorySize) {
               while (historyLength >= this.options.maxHistorySize) {
                  h.shift();
                  --historyLength;
               }
            }
            h.push({
               action,
               state: view,
            });
         });
      });
   });
   private readonly historyLog$ = effect(() => {
      if (this.logging()) {
         this.log(this.history());
      }
   });
   constructor(
      private store: StoreSignal<T>,
      private options?: StoreLogOptions
   ) {}

   abstract log(history: StoreLog<T>[]): void;

   start() {
      this.logging.set(true);
   }

   stop() {
      this.logging.set(false);
   }
}

export class DefaultStoreLogger<T = any> extends StoreLogger<T> {
   log(history: StoreLog<T>[]) {
      console.log(history);
   }
}
