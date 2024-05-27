import { type ApplicationConfig } from '@angular/core';
import { Routes, provideRouter } from '@angular/router';
import { AsyncLoadComponent } from './async-load-example/async-load-example.component';
import { CounterExampleComponent } from './counter-example/counter-example.component';
import { ServiceLessExampleComponent } from './service-less-example/service-less-example.component';

export const routes: Routes = [
   {
      path: 'counter-example',
      component: CounterExampleComponent,
   },
   {
      path: 'service-less-example',
      component: ServiceLessExampleComponent,
   },
   {
      path: 'async-load-example',
      component: AsyncLoadComponent,
   },
];

export const appConfig: ApplicationConfig = {
   providers: [provideRouter(routes)],
};
