import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { actionToSubject } from 'projects/libs/ngxss/src/public-api';
import { names } from '../state/names';
import { AsyncLoadState } from './state/async-load.model';

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
   readonly state = inject(AsyncLoadState);

   constructor() {
      actionToSubject(this.state.loadEntity).subscribe(({ id }) => {
         console.log(`Loading Entity ${id}`);
      });
      actionToSubject(this.state.loadEntitySuccess).subscribe(
         ({ entityId, entityName }) => {
            console.log(`Entity ${entityId} (${entityName}) has loaded`);
         }
      );
   }

   onLoad() {
      this.state.loadEntity({
         id: Math.floor(Math.random() * (names.length - 1)),
      });
   }
}
