import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { names } from '../state/names';
import { AsyncLoadStore } from './state/async-load.model';

@Component({
   selector: 'ngx-simple-state-async-load-example',
   templateUrl: './async-load-example.component.html',
   styleUrls: [
      './async-load-example.component.scss',
      './../../styles/example-page.scss',
   ],
   standalone: true,
   imports: [CommonModule],
})
export class AsyncLoadComponent {
   readonly store = inject(AsyncLoadStore);

   constructor() {
      this.store.$loadEntity.subscribe(({ id }) => {
         console.log(`Loading Entity ${id}`);
      });
      this.store.$loadEntitySuccess.subscribe(({ entityId, entityName }) => {
         console.log(`Entity ${entityId} (${entityName}) has loaded`);
      });
   }

   onLoad() {
      this.store.loadEntity({
         id: Math.floor(Math.random() * (names.length - 1)),
      });
   }
}
