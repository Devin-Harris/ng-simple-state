# NgxSimpleState

Simple state management for angular

The goal of NgxSimpleState is to provide a clean, signal based approach to handling state in angular applications. Many libraries such as ngrx, ngxs, and others require extensive boilerplate. Libraries like these can provide consistency and more flexibility for large scale applications, but in my opinion could be cumbersome. NgxSimpleState attempts to provide a simple declarative approach to defining how your state looks and can change, while building on top of the new signal and computed primitives provided in recent angular versions.

---

## Table of Contents

<!-- -  [Live Demo](https://ngx-highlight.netlify.app/) | [Stackblitz](https://stackblitz.com/edit/ngx-highlightjs) -->

-  [Installation](#installation)
-  [Usage](#usage)
   -  [Counter Example](#counter)
   -  [Async Example](#async)
-  [Issues](#issues)

<a name="installation"/>

## Installation

Install with **NPM**

```bash
npm i ngx-simple-state
```

<a name="usage"/>

## Usage

<a name="counter"/>

### Counter example

Lets start with a simple counter example. The first step is to define the State interface...

```typescript
export interface State {
   count: number;

   setCount: Action<State, number>;
   increment: Action<State>;
   decrement: Action<State>;
   reset: Action<State>;

   lessThan5: Selector<State, boolean>;
   lessThan10: Selector<State, boolean>;
   between5and10: Selector<State, boolean>;
}
```

This example defines one root level field as well as some Action and Selector fields which we will explore further later.

Once your interface is defined you can create the InitialValue for your counter store using said interface as well as the `StoreSignalInput` generic type.

```typescript
const counterStoreInitialValue: StoreSignalInput<State> = {
   count: 0,

   /**
    * Actions should be defined with the createAction method.
    * This method puts a special token on the function objects which is used
    * when building the store to automatically impose the state objects when calling
    * the Actions. It also creates another field with a $ prefix which is a subject of the given
    * Action. This is useful when you want to use rxjs or dependency injection to
    * trigger other events from a interaction.
    */
   setCount: createAction((state, count) => state.count.set(count)),
   increment: createAction((state) => state.count.update((c) => c + 1)),
   decrement: createAction((state) => state.count.update((c) => c - 1)),
   reset: createAction((state) => state.setCount(0)),

   /**
    * Selectors should be defined with the createSelector method.
    * This method puts a special token on the function objects which is used
    * when building the store to force the selectors to be readonly signals
    * instead of writable ones. Also notice how selectors can be used in other selectors.
    * This can cause circular references so be mindful when using selectors within selectors.
    */
   lessThan5: createSelector((state) => state.count() < 5),
   lessThan10: createSelector((state) => state.count() < 10),
   between5and10: createSelector(
      (state) => !state.lessThan5() && state.lessThan10()
   ),
};
```

The `StoreSignalInput` prevents certain keys such as `patch`, `view`, and \$ prefixed actions (`$setCount`, `$increment`, `$decrement`, `$reset` in this case) from being defined as the store with automatically impose those fields on the store object.

Finally we can use this initial value with the `store` method. This method takes an initial value and a config option where you can define where the store is providedIn.

```typescript
export const CounterStore = store(counterStoreInitialValue, {
   providedIn: 'root',
});
```

This `CounterStore` can then be injected into a component like this:

```typescript
@Component({
   ...,
   template: `
      <h2>Counter Example</h2>

      <label>State View</label>
      <pre>{{ store.view() | json }}</pre>

      <button (click)="store.increment()">Increment</button>
      <button (click)="store.decrement()">Decrement</button>
      <button (click)="store.reset()">Reset</button>
      <button (click)="store.setCount(100)">Set to 100</button>
   `
})
export class CounterExampleComponent {
   readonly store = inject(CounterStore);

   constructor() {
      this.store.$setCount.subscribe((t) => {
         console.log('setCount called');
      });
   }
}
```

Notice how the store has an automatically imposed `view` signal. This is a computed signal with all the values of the writable signals and computed selector signals created from the passed in initial value object to the store. Of course you can also utilize the individual signals as well (for example `store.count()` or `store.count.set(1)`), but the `view` is a nice way to get all the state properties of the store.

Also notice how actions are imposed as callable functions on the store object as well. These actions can have optional parameters which will be sent to the callback function defined in the initial value object. Actions also have a \$ prefixed field imposed on the store object as you can see in the constructor. This \$ prefixed field is a subject that is nexted with the parameters sent to the action when it is called. In the above example you could see how both the Reset and SetCount action will trigger the subscription done in this constructor since actions can call other actions within a store.

<a name="async"/>

### Async example

Of course a simple counter isn't always the best representation of real world use cases. Lets explore an example that deals with asynchronous interactions and dependency injection.

Lets again start by defining a state interface:

```typescript
export interface State {
   entityName: string | null;
   entityId: number | null;
   callState: CallState;

   loadEntity: Action<State, { id: number }>;
   loadEntitySuccess: Action<State, { entityName: string; entityId: number }>;
   loadEntityFailure: Action<State, { error: Error }>;

   loading: Selector<State, boolean>;
   error: Selector<State, Error | null>;
}
```

Here you can see we have some basic information about some entity as well as whether the request for that entity is loading, loaded, or errored (based on the `CallState`). You also see some actions for triggering an asynchrounous load and the response from that async request, whether it was a failure with an error or a success with some name and id.

Then imagine we have some api service responsible for fetching entity information:

```typescript
/**
 * Fake api service representing an api request that could error
 * and takes some time to return a response
 */
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
```

I can then define the initial value and pass it to the `store`. Also notice how we are not using the `StoreSignalInput` as we did in the above example. This requires us to pass the generic `State` interface to the store call so it can properly determine the type behind the store:

```typescript
export const AsyncLoadStore = store<State>(
   {
      // Root State
      callState: LoadingState.Init,
      entityName: null,
      entityId: null,

      /**
       * Actions
       * Notice how you can utilize dependency injection in the state action callback
       * function parameters. These items should always be after the required parameters
       * so for actions that do not have props defined the signature should still
       * denote (state, ...rest of injection properties...) => ... but for actions with
       * props defined it should read (state, props, ...rest of injection properties...) => ...
       */
      loadEntity: createAction(
         async (state, props, apiService = inject(AsyncLoadApiService)) => {
            state.callState.set(LoadingState.Loading);
            try {
               const response = await apiService.getEntity(props.id);
               return state.loadEntitySuccess(response);
            } catch (error: any) {
               return state.loadEntityFailure({ error });
            }
         }
      ),
      loadEntitySuccess: createAction((state, props) =>
         state.patch({ ...props, callState: LoadingState.Loaded })
      ),
      loadEntityFailure: createAction((state, props) =>
         state.patch({ callState: { error: props.error } })
      ),

      // Selectors
      loading: createSelector(
         (state) => state.callState() === LoadingState.Loading
      ),
      error: createSelector((state) => {
         const callState = state.callState();
         return isErrorState(callState) ? callState.error : null;
      }),
   },
   { providedIn: 'root' }
);
```

You can also see how `patch` is used in the `loadEntitySuccess` and `loadEntityFailure` actions. Patch will essentially set the provided keys to the provided values with the stores writable signals. Of course you can only patch root level state fields. i.e. patching selectors or actions is not allowed. This is useful for when you want to change multiple fields in the store at the same time without having to call the set method on each signal within the store.

Then finally utilizing this store you can see how async requests can be handled and mapped into new state mutations in a very straight forward and declarative manner:

```typescript
@Component({
   ...
   template: `
      <label>State View</label>
      <pre>{{ store.view() | json }}</pre>
      <button [disabled]="store.loading()" (click)="onLoad()">Load Entity</button>
   `
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
```

<a name="issues"/>

## Issues

If you identify any errors in the library, or have an idea for an improvement, please open
an [issue](https://github.com/Devin-Harris/ngx-simple-state/issues).
