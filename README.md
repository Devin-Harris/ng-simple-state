# NgxSimpleState

Simple state management for angular.

The goal of NgxSimpleState is to provide a clean, signal based approach to handling state in angular applications. Many libraries such as ngrx, ngxs, and others require extensive boilerplate and knowledge of patterns such as redux. Libraries like these can provide consistency and more flexibility for large scale applications, but in some opinions could be cumbersome. NgxSimpleState attempts to provide a simple, declarative approach to defining how your state looks and can change, while also building on top of the new signal and computed primitives provided in recent angular versions.

This library also took some inspiration from ngrx [SignalStore](https://ngrx.io/guide/signals/signal-store). This library has some concepts such as only creating computed signal fields, restricting of selectors within selectors, and proxy logic to recursively create signals for object fields. In my opinion these are strange implementations and were the main reasons for creating this library. Of course I am sure there are reasons for all of those implementations within ngrx's SignalStore, but for my needs a simpler and more flexible approach seemed warranted.

---

## Table of Contents

<!-- -  [Live Demo](https://ngx-highlight.netlify.app/) | [Stackblitz](https://stackblitz.com/edit/ngx-highlightjs) -->

-  [Installation](#installation)
-  [Basic Concepts](#basics)
-  [Usage](#usage)
   -  [Counter Example](#counter)
   -  [Async Example](#async)
   -  [Nested Stores Example](#nested)
-  [Issues](#issues)

<a name="installation"/>

## Installation

Install with **NPM**

```bash
npm i ngx-simple-state
```

<a name="basics"/>

## Basic Concepts

The basic idea behind ngx-simple-state is to provide a set of helper function and types for declaring state, state mutations, and derived state easily. There are 4 main concepts within this library to note:

-  Root State
-  Selectors
-  Actions
-  Store Slices

At first glance you may already see some similarities to patterns like redux and libraries like ngrx but lets dive deeper into each of these.

1. The root state is the root level fields of your store. Each root level field will be converted into a writable signal that you can update and retrieve as you wish.

2. Selectors are derived state from the given root state fields. There are often times when you are storing some value in state, but want to do some computations on that value before say displaying it in the UI. Selectors are great for this as you can consume all the root state fields within the store AND all the other selectors within the store as well. Each selectors is converted into a computed (readonly) signal.

3. Actions are callable functions that can have some effect on how the state changes. An action, when called, has access to what the state currently is, as well as the capability to change said state in some callback function. Each action can have a payload defined and is a required input when calling the action. Each action also has a \$ prefixed subject added to the store in case more complex rxjs operations need to be triggered off an action call. Actions built inside the `store` helper function also have access to dependency injection which can be useful in certain instances.

4. Store slices are a way of utilizing nested stores. In some instances a generic store, such as for handling whether there is asynchronous data being received and what the state of that request is, would be nice to have defined once and then imposed into other more specific store objects. A store slice can essentially wrap a store with some special notations and allow one store to be used in another.

<a name="usage"/>

## Usage

<a name="counter"/>

### Counter example

Lets start with a simple counter example. The first step is to define the Store type...

```typescript
export type CounterStore = Store<{
   count: number;

   setCount: Action<number>;
   increment: Action;
   decrement: Action;
   reset: Action;

   lessThan5: Selector<boolean>;
   lessThan10: Selector<boolean>;
   between5and10: Selector<boolean>;
}>;
```

This example defines one root level field as well as some Action and Selector fields which we will explore further later.

Once your type is defined you can create the input for your counter store using said store type as well as the `StoreSignalInput` generic type.

```typescript
const counterStoreInput: StoreSignalInput<CounterStore> = {
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

Finally we can use this input with the `store` method. This method takes the input we've defined and a config option where you can define where the store is providedIn.

```typescript
export const CounterStore = store(counterStoreInput, {
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

Notice how the store has an automatically imposed `view` signal. This is a computed signal with all the values of the writable signals and computed selector signals created from the passed in input object to the store. Of course you can also utilize the individual signals as well (for example `store.count()`, `store.count.set(1)`, or `store.lessThan10()`), but the `view` is a nice way to get all the state properties of the store.

Also notice how actions are imposed as callable functions on the store object as well. These actions can have optional parameters which will be sent to the callback function defined in the input object. Actions also have a \$ prefixed field imposed on the store object as you can see in the constructor. This \$ prefixed field is a subject that is nexted with the parameters sent to the action when it is called. In the above example you could see how both the Reset and SetCount action will trigger the subscription done in this constructor since actions can call other actions within a store.

<a name="async"/>

### Async example

Of course a simple counter isn't always the best representation of real world use cases. Lets explore an example that deals with asynchronous interactions and dependency injection.

Lets again start by defining a store type:

```typescript
// Helpers Types
export interface Error {
   message: string;
}
export enum LoadingState {
   Init,
   Loading,
   Loaded,
}
export type ErrorState = { error: Error };
export type CallState = LoadingState | ErrorState;
export function isErrorState(callstate: CallState): callstate is ErrorState {
   return !!Object.hasOwn(callstate as object, 'error');
}

// Store Type
export type AsyncStoreType = Store<{
   entityName: string | null;
   entityId: number | null;
   callState: CallState;

   loadEntity: Action<{ id: number }>;
   loadEntitySuccess: Action<{ entityName: string; entityId: number }>;
   loadEntityFailure: Action<{ error: Error }>;

   loading: Selector<boolean>;
   error: Selector<Error | null>;
}>;
```

Here you can see we have some basic information about some entity as well as whether the request for that entity is loading, loaded, or errored (based on the `CallState`).

You also see some actions for triggering a loadEntity and whether the response from that request was a failure with an error or a success with some name and id.

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

I can then define the input and pass it to the `store`. Also notice how we are not using the `StoreSignalInput` as we did in the above example. This requires us to pass the `AsyncStoreType` type to the store call so it can properly determine the type behind the store:

```typescript
export const AsyncLoadStore = store<AsyncStoreType>(
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

You can also see how `patch` is used in the `loadEntitySuccess` and `loadEntityFailure` actions. Patch will essentially set the provided keys to the provided values with the stores writable signals. Of course you can only patch root level state fields. i.e. patching selectors or actions is not allowed. This is useful for when you want to change multiple fields in the store at the same time without having to call the set method on each signal within the store manually.

Then utilizing this store you can see how async requests can be handled and mapped into new state mutations in a very straight forward and declarative manner:

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

<a name="nested"/>

## Nested Stores Example

Having the ability to nest stores is also possible with ngx-simple-state. This can be useful in a case where dealing with asynchronous interactions we always want to keep track the of `CallState` and we have multiple different stores for different entities in our application. Redefining all of the callstate related selectors, root fields, and actions could be cumbersome so nesting stores is a great opportunity to reduce code duplication.

For this we need to create 2 store inputs. Lets start with the CallStateStore input:

```typescript
export type CallStateStoreType = Store<{
   callState: CallState;

   setLoaded: Action;
   setLoading: Action;
   setError: Action<{ error: Error }>;

   loading: Selector<boolean>;
   error: Selector<Error | null>;
}>;

export const callStateStoreInput: StoreSignalInput<CallStateStoreType> = {
   callState: LoadingState.Init,

   setLoaded: createAction((state) => {
      state.patch({ callState: LoadingState.Loaded });
   }),
   setLoading: createAction((state) => {
      state.patch({ callState: LoadingState.Loading });
   }),
   setError: createAction((state, props) => {
      state.patch({ callState: { error: props.error } });
   }),

   loading: createSelector(
      (state) => state.callState() === LoadingState.Loading
   ),
   error: createSelector((state) => {
      const callState = state.callState();
      return isErrorState(callState) ? callState.error : null;
   }),
};
```

Very similar to above examples but notice how we dont pass this input to a `store` function call just yet...

Next we make the `NestedAsyncStoreType`:

```typescript
export type NestedAsyncStoreType = Store<{
   // Store slices
   callStateStore: StoreSlice<CallStateStoreType>;

   // Root State
   entityName: string | null;
   entityId: number | null;

   // Actions
   loadEntity: Action<{ id: number }>;
   loadEntitySuccess: Action<{ entityName: string; entityId: number }>;
   loadEntityFailure: Action<{ error: Error }>;
}>;
```

Notice how we have a new helper type called `StoreSlice`. This helper type takes a generic of the store you are trying to create a slice of (in our case our `CallStateStoreType`).

Building the input for this store then looks like this:

```typescript
export const AsyncLoadWithCallStateStore = store<NestedAsyncStoreType>(
   {
      // Store slices
      callStateStore: createStoreSlice(callStateStoreInput),

      // Root State
      entityName: null,
      entityId: null,

      // Actions
      loadEntity: createAction(
         async (state, props, apiService = inject(AsyncLoadApiService)) => {
            state.callStateStore.setLoading();
            try {
               const response = await apiService.getEntity(props.id);
               return state.loadEntitySuccess(response);
            } catch (error: any) {
               return state.loadEntityFailure({ error });
            }
         }
      ),
      loadEntitySuccess: createAction((state, props) => {
         state.patch({
            ...props,
            callStateStore: { callState: LoadingState.Loaded },
         });
      }),
      loadEntityFailure: createAction((state, { error }) => {
         state.callStateStore.setError({ error });
      }),
   },
   {
      providedIn: 'root',
   }
);
```

Similar to selectors and actions, we utilize a helper function called `createStoreSlice` which takes in the `callStateStoreInput`. With this store slice injected into our `AsyncLoadWithCallStateStore` we can now use the root fields, selectors, and actions from the CallStateStore directly in our `AsyncLoadWithCallStateStore` as you can see in the `loadEntity` action where we `state.callStateStore.setLoading();`. The view, and patch methods are also available on the `callStateStore` field within our `AsyncLoadWithCallStateStore`, and the top level `AsyncLoadWithCallStateStore` will recursively call the `callStateStore` patch and view methods when necessary.

<a name="issues"/>

## Issues

If you identify any errors in the library, or have an idea for an improvement, please open
an [issue](https://github.com/Devin-Harris/ngx-simple-state/issues).
