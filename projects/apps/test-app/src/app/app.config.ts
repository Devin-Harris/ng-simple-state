import { type ApplicationConfig } from '@angular/core';
import { Routes, provideRouter } from '@angular/router';
import { AsyncLoadComponent } from './async-load-example/async-load-example.component';

export const routes: Routes = [
   // {
   //    path: 'counter-example',
   //    component: CounterExampleComponent,
   // },
   {
      path: 'async-load-example',
      component: AsyncLoadComponent,
   },
   // {
   //    path: 'nested-stores-example',
   //    component: NestedStoresComponent,
   // },
   // {
   //    path: 'non-singleton-example',
   //    component: NonSingletonExampleComponent,
   // },
];

export const appConfig: ApplicationConfig = {
   providers: [provideRouter(routes)],
};
