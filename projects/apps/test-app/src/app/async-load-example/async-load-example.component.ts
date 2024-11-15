import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { actionToSubject } from 'projects/libs/ngxss/src/public-api';
import { names } from '../state/names';
import { AsyncLoadStore } from './state/async-load.model';

@Component({
   selector: 'ngxss-async-load-example',
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
      actionToSubject(this.store.loadEntity).subscribe(({ id }) => {
         console.log(`Loading Entity ${id}`);
      });
      actionToSubject(this.store.loadEntitySuccess).subscribe(
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
}
