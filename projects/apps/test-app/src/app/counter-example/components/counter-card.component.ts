import { CommonModule } from '@angular/common';
import {
   Component,
   Input,
   OnChanges,
   OnDestroy,
   SimpleChanges,
} from '@angular/core';
import { store, StoreSignal } from 'projects/libs/ngxss/src/public-api';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { counterStoreInput, CounterStoreType } from '../state/counter.model';

@Component({
   selector: 'ngxss-counter-card',
   templateUrl: './counter-card.component.html',
   styleUrls: [
      './counter-card.component.scss',
      './../../../styles/example-page.scss',
   ],
   standalone: true,
   imports: [CommonModule],
})
export class CounterCardComponent implements OnChanges, OnDestroy {
   @Input() store: StoreSignal<CounterStoreType> = store<CounterStoreType>({
      ...counterStoreInput,
   });

   @Input() label: string = '';

   private $: Subscription | null = null;
   private destroyed = new Subject<void>();

   constructor() {
      this.store.setCount.subject.subscribe((t) => {
         console.log(`Store on ${this.label} card: setCount called with`, t);
      });
   }

   ngOnChanges(changes: SimpleChanges): void {
      if (changes['store']) {
         this.$?.unsubscribe();
         this.$ = this.store.setCount.subject
            .pipe(takeUntil(this.destroyed))
            .subscribe((t) => {
               console.log(
                  `Store on ${this.label} card: setCount called with`,
                  t
               );
            });
      }
   }

   ngOnDestroy(): void {
      this.destroyed.next();
   }

   onIncrement() {
      this.store.increment();
   }
   onDecrement() {
      this.store.decrement();
   }
   onResetCount() {
      this.store.resetCount();
   }
   onSetTo100() {
      this.store.setCount(100);
   }
}
