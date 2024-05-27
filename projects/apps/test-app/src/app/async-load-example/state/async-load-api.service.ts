import { Injectable } from '@angular/core';
import { names } from '../../state/names';

@Injectable({ providedIn: 'root' })
export class AsyncLoadApiService {
   async getEntity(id: number) {
      return new Promise<{ entityName: string; entityId: number }>(
         (res, rej) => {
            setTimeout(() => {
               const shouldError = Math.round(Math.random() * 100) > 75;
               if (shouldError) {
                  rej('Some error happened');
               }
               res({
                  entityName: names[id],
                  entityId: id,
               });
            }, Math.round(Math.random() * 3000));
         }
      );
   }
}
