import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { names } from '../state/names';
import { AsyncLoadWithCallStateStore } from './state/async-load.model';

@Component({
   selector: 'ngxss-nested-stores-example',
   templateUrl: './nested-stores-example.component.html',
   styleUrls: [
      './nested-stores-example.component.scss',
      './../../styles/example-page.scss',
   ],
   standalone: true,
   imports: [CommonModule],
})
export class NestedStoresComponent {
   readonly store = inject(AsyncLoadWithCallStateStore);

   constructor() {
      this.store.loadEntity.subject.subscribe(({ id }) => {
         console.log(`Loading Entity ${id}`);
      });
      this.store.loadEntitySuccess.subject.subscribe(
         ({ entityId, entityName }) => {
            console.log(`Entity ${entityId} (${entityName}) has loaded`);
         }
      );
   }

   onLoad() {
      this.store.loadEntity({
         id: Math.floor(Math.random() * (names.length - 1)),
      });
   }

   onReset() {
      this.store.reset();
   }

   onResetCallState() {
      this.store.callStateStore.reset();
   }
}
