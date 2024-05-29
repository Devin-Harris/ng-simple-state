import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SingletonVsNonSingletonComponent } from './singleton-vs-nonsingleton.component';

@Component({
   selector: 'ngx-simple-state-non-singleton-example',
   templateUrl: './non-singleton-example.component.html',
   styleUrls: [
      './non-singleton-example.component.scss',
      './../../styles/example-page.scss',
   ],
   standalone: true,
   imports: [CommonModule, SingletonVsNonSingletonComponent],
})
export class NonSingletonExampleComponent {
   instances = [1, 2];

   trackBy = (index: number, item: number) => item;

   addInstance() {
      this.instances.push(Math.max(...this.instances) + 1);
   }

   removeInstance(id: number) {
      this.instances = this.instances.filter((i) => i !== id);
   }
}
