import { type ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { AsyncLoadComponent } from './async-load-example/async-load-example.component';
import { CounterExampleComponent } from './counter-example/counter-example.component';

export const appConfig: ApplicationConfig = {
   providers: [
      provideRouter([
         {
            path: 'counter-example',
            component: CounterExampleComponent,
         },
         {
            path: 'async-load-example',
            component: AsyncLoadComponent,
         },
      ]),
   ],
};
