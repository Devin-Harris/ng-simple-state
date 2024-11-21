# NgxSimpleState

Simple state management for angular.

The goal of NgxSimpleState is to provide a clean, signal based approach to handling state in angular applications. Many libraries such as ngrx, ngxs, and others require extensive boilerplate and knowledge of patterns such as redux. Libraries like these can provide consistency and more flexibility for large scale applications, but in some opinions could be cumbersome. NgxSimpleState attempts to provide a simple, declarative approach to defining how your state looks and can change, while also building on top of the new signal and computed primitives provided in recent angular versions.

This library started with inspiration from ngrx [SignalStore](https://ngrx.io/guide/signals/signal-store). SignalStore has some concepts such as only creating computed signal fields, restricting of selectors within selectors, and proxy logic to recursively create "deep" signals for object fields. In my opinion some of these are complex implementations and were the main reasons for creating this library. Of course, I am sure there are reasons for all of those implementations within ngrx's SignalStore, but for my needs a simpler and more flexible approach seemed warranted.

---

## Table of Contents

<!-- -  [Live Demo](https://ngx-highlight.netlify.app/) | [Stackblitz](https://stackblitz.com/edit/ngx-highlightjs) -->

-  [Installation](#installation)
-  [Basic Concepts](#basics)
-  [Usage](#usage)
   -  [Counter Example](#counter)
   -  [Async Example](#async)
   -  [Nested Stores Example](#nested)
   -  [Signal Based](#signal-based)
-  [Issues](#issues)

<a name="installation"/>

## Installation

Install with **NPM**

```bash
npm i ngxss
```

<a name="basics"/>

## Basic Concepts

The basic idea behind ngx-simple-state is to provide a set of helper function and types for declaring state, state mutations, and derived state easily. There are 4 main concepts within this library to note. At first glance you may already see some similarities to patterns like redux and libraries like ngrx but lets dive deeper into each of these.

1. **Root State**: The root state is the root level fields of your state. Each root level field will be converted into a writable signal that you can update and retrieve as you wish.
2. **Selectors**: Selectors are derived state from the given root state fields. There are often times when you are storing some value in state, but want to do some computations on that value before say displaying it in the UI. Selectors are great for this as you can consume all the root state fields within the store AND all the other selectors within the store as well. Each selectors is converted into a computed (readonly) signal.
3. **Actions**: Actions are callable functions that can have some effect on how the state changes. An action, when called, has access to what the state currently is, as well as the capability to change said state in some callback function. Each action can have a payload defined and if it does it is a required input when calling the action. Each action also has an internal subject added to the function object in case more complex rxjs operations need to be triggered off an action call. Actions built inside the `store(...)` helper function also have access to dependency injection if you provide an `injector` in config object. Or you can use the `store.injectable(...)` if you prefer not to define the injector explicitly. For readonly stores, (`store.readonly(...)`, `store.injectable.readonly(...)`, or `store.readonly.injectable(...)`), the root state is converted to a readonly signal, however actions have writable signals of the root state. Essentially readonly stores only allow mutations through action callbacks.
4. **Nested State**: State objects can be nested within other state objects. In some instances a generic store, such as for handling the loading state of an asynchronous data fetch, would be nice to have defined once and then nested into other more specific store objects.

<a name="usage"/>

## Usage

<a name="counter"/>

### Counter example

Lets start with a simple counter example. The first step is to define the stores type...

```typescript
export type CounterStoreType = Store<{
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

This example defines one root level field as well as some Action and Selector fields which we will explore further later. Notice the `Store` generic type. This is a helper type that you wrap the inner state fields with to ensure each action and selector knows what fields they have access to on the passed in state object.

Once your type is defined you can create the input for your counter store using said type.

```typescript
export const counterStoreInput: CounterStoreType = {
   count: 0,

   /**
    * Actions should be defined with the createAction method.
    * This method puts a special token on the function objects which is used
    * when building the store to automatically impose the inner state objects when calling
    * the Actions. Actions also provide a subject of the given Action which you can retrieve
    * by using the `subject` field on the action object. This is useful when you want to use rxjs or
    * dependency injection to trigger other events from a interaction.
    */
   setCount: createAction((state, count) => state.count.set(count)),
   increment: createAction((state) => state.count.update((c) => c + 1)),
   decrement: createAction((state) => state.count.update((c) => c - 1)),
   reset: createAction((state) => state.setCount(0)),

   /**
    * Selectors should be defined with the createSelector method.
    * This method again puts a special token on the function objects which is used
    * when building the store to force the selectors to be readonly computed signals
    * instead of writable ones.
    */
   lessThan5: createSelector((state) => state.count() < 5),
   lessThan10: createSelector((state) => state.count() < 10),
   between5and10: createSelector(
      (state) => !state.lessThan5() && state.lessThan10()
   ),
};
```

Finally we can use this input with the `store` method.

```typescript
export const CounterStore = store(counterStateInput);
```

Note if injection context is important for the particular state you are working with, you can pass an injector to the `store` method:

```typescript
export const CounterStore = store(counterStateInput, {
   injector: inject(Injector),
});
```

Or you can even use the `store.injectable` method, which returns an injectable class which you can do normal dependency injection with, as well as define where its provided:

```typescript
export const CounterStore = store.injectable(counterStateInput, {
   providedIn: 'root',
});
```

You may also want to limit the direct mutability of the root state fields and only allow mutations through actions. You can do this by using the `store.readonly` method:

```typescript
export const CounterStore = store.readonly(counterStateInput);
```

In the above `CounterStore.count.set(1)` is not valid, but `state.count.set(1)` within an action callback is. You can also combine readonly stores with injectable like `store.readonly.injectable` or `store.injectable.readonly` if you wish.

Looking back at the `store.injectable` `CounterStore`, we can inject the store into a component like this:

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
      this.store.setCount.subject.pipe(takeUntilDestroyed()).subscribe((t) => {
         console.log('setCount called');
      });
   }
}
```

Notice how the template uses the stores `view` signal. This is a computed signal with all the values of the writable signals and computed selector signals created from the passed in input object. Of course you can also utilize the individual signals as well (for example `store.count()` or `store.lessThan10()`), but the `view` is a nice way to get all the state values out at once.

Also notice how actions are callable functions as well. These actions can have optional parameters which will be sent to the callback function defined in the input object. Actions also have a subject that is nexted with the parameters sent to the action when it is called, which can be pulled out using the `subject` field. In the above example you could see how both the `reset` and `setCount` action will trigger the subscription done in this constructor since actions can call other actions within a store.

<a name="async"/>

### Async example

Of course a simple counter isn't always the best representation of real world use cases. Lets explore an example that deals with asynchronous interactions and dependency injection.

Lets first define some helper types we will use later:

```typescript
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
```

Then we can define a store type:

```typescript
export type AsyncStoreType = Store<{
   // Root State
   entityName: string | null;
   entityId: number | null;
   callState: CallState;

   // Actions
   loadEntity: Action<{ id: number }>;
   loadEntitySuccess: Action<{ entityName: string; entityId: number }>;
   loadEntityFailure: Action<{ error: Error }>;

   // Selectors
   loading: Selector<boolean>;
   error: Selector<Error | null>;
}>;
```

Here you can see we have some basic information about some entity and whether the request for that entity is loading, loaded, or errored (based on the `CallState`).

You also see some actions for triggering a loadEntity and whether the response from that request was a failure with an error, or a success with some name and id.

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

I can then define the input and pass it to the `store.injectable` method.

```typescript
export const AsyncLoadStore = store.injectable<AsyncStoreType>(
   {
      // Root State
      callState: LoadingState.Init,
      entityName: null,
      entityId: null,

      /**
       * Actions
       * Notice how you can utilize dependency injection in the state action callback
       * function. If you are using the inject keyword, you need to use the store.injectable
       * and provide it in whatever component you are using the store in OR provide an injector
       * to the normal `store` method.
       */
      loadEntity: createAction(async (state, props) => {
         const apiService = inject(AsyncLoadApiService);

         state.callState.set(LoadingState.Loading);
         try {
            const response = await apiService.getEntity(props.id);
            return state.loadEntitySuccess(response);
         } catch (error: any) {
            return state.loadEntityFailure({ error });
         }
      }),
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

Notice how `patch` is used in the `loadEntitySuccess` and `loadEntityFailure` actions. Patch will essentially set the provided keys to the provided values on the root level writable signals. Of course you can only patch root level state fields, i.e. patching selectors or actions is not allowed. This is useful for when you want to change multiple fields in the store at the same time without having to call the set method on each signal manually.

Then utilizing this state you can see how async requests can be handled and mapped into new state mutations in a very straight forward and declarative manner:

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
   readonly store = inject(AsyncLoadState);

   constructor() {
      this.store.loadEntity.subject.pipe(takeUntilDestroyed()).subscribe(({ id }) => {
         console.log(`Loading Entity ${id}`);
      });
      this.store.loadEntitySuccess.subject.pipe(takeUntilDestroyed()).subscribe(
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
}
```

<a name="nested"/>

### Nested Stores Example

Having the ability to nest state objects is also possible with ngx-simple-state. This can be useful in a case where we want to reduce code duplication. For example, we may have multiple different slices of state for different entities in our application that we want to track the `CallState` of asynchronous interactions for. Redefining all of the callstate related selectors, root fields, and actions could be cumbersome so nesting stores is a great opportunity to reduce code duplication.

For this we need to create some store inputs. Lets start with the CallStateStore input:

```typescript
export type CallStateStoreType = Store<{
   callState: CallState;

   setLoaded: Action;
   setLoading: Action;
   setError: Action<{ error: Error }>;

   loading: Selector<boolean>;
   error: Selector<Error | null>;
}>;

export const callStateStoreInput: CallStateStoreType = {
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

Next we make the `UserStoreType`:

```typescript
export type UserStoreType = Store<{
   // State slices
   callStateStore: CallStateStoreType;

   // Root State
   userName: string | null;
   userId: number | null;

   // Actions
   loadEntity: Action<{ userId: number }>;
   loadEntitySuccess: Action<{ userName: string; userId: number }>;
   loadEntityFailure: Action<{ error: Error }>;
}>;
```

Notice how we utilize the `CallStateStoreType` type when defining the UserStoreType. This helper type allows the `store` and `store.injectable` to properly parse the inner state signals when patching, viewing, etc...

Then similarly we can create another store type:

```typescript
export type TeamStoreType = Store<{
   // State slices
   callStateStore: CallStateStoreType;

   // Root State
   teamName: string | null;
   teamId: number | null;

   // Actions
   loadEntity: Action<{ teamId: number }>;
   loadEntitySuccess: Action<{ teamName: string; teamId: number }>;
   loadEntityFailure: Action<{ error: Error }>;
}>;
```

Building the actual stores then looks like this:

```typescript
export const UserStore = store.injectable<UserStoreType>(
   {
      // State slices
      callStateStore: store(callStateStateInput),

      // Root State
      userName: null,
      userId: null,

      // Actions
      loadEntity: createAction(async (state, props) => {
         state.callStateStore.setLoading();
         // ... get users
      }),
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

```typescript
export const TeamStore = store.injectable<TeamStoreType>(
   {
      // State slices
      callStateStore: store(callStateStateInput),

      // Root State
      userName: null,
      userId: null,

      // Actions
      loadEntity: createAction(async (state, props) => {
         state.callStateStore.setLoading();
         // ... get teams
      }),
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

Similar to selectors and actions, we utilize the `store` helper function which takes in the `callStateStoreInput`. With this state slice injected into our `UserStore` and `TeamStore` we can now use the root fields, selectors, and actions from the CallStateStore directly. As you can see in the `loadEntity` action where we `state.callStateStore.setLoading();`. The view, and patch methods are also available on the `callStateStore` field within our `UserStore` and `TeamStore`, and patching/viewing on the two top level stores will recursively call the `callStateStore` patch and view methods when necessary.

We could take this a step further and generalize the entity loading functionality as well :

```typescript
export type EntityStoreType = Store<{
   // State slices
   callStateStore: CallStateStoreType;

   // Root State
   entityName: string | null;
   entityId: number | null;

   // Actions
   loadEntity: Action<{ entityId: number }>;
   loadEntitySuccess: Action<{ entityName: string; entityId: number }>;
   loadEntityFailure: Action<{ error: Error }>;
}>;
export const EntityStoreInput: EntityStoreType = {
   // State slices
   callStateStore: store(callStateStateInput),

   // Root State
   entityName: null,
   entityId: null,

   // Actions
   loadEntity: createAction(async (state, props) => {
      state.callStateStore.setLoading();
   }),
   loadEntitySuccess: createAction((state, props) => {
      state.patch({
         ...props,
         callStateStore: { callState: LoadingState.Loaded },
      });
   }),
   loadEntityFailure: createAction((state, { error }) => {
      state.callStateStore.setError({ error });
   }),
};
```

```typescript
export const TeamStore = store.injectable<TeamStoreType>(
   {
      // State slices
      entityStore: store({
         ...EntityStoreInput,
         loadEntity: createAction(async (state, props) => {
            const teamApiService = inject(TeamApiService);
            state.callStateStore.setLoading();
            // ... await teamApiService.get(props)
         }),
      }),
   },
   {
      providedIn: 'root',
   }
);
export const UserStore = store.injectable<UserStoreType>(
   {
      // State slices
      entityStore: store({
         ...EntityStoreInput,
         loadEntity: createAction(async (state, props) => {
            const userApiService = inject(UserApiService);
            state.callStateStore.setLoading();
            // ... await userApiService.get(props)
         }),
      }),
   },
   {
      providedIn: 'root',
   }
);
```

```typescript
export class SomeComponent {
   constructor() {
      inject(UserStore).entityStore.loadEntity({ entityId: 1 });
      inject(TeamStore).entityStore.loadEntity({ entityId: 10 });
   }
}
```

<a name="signal-based"/>

### Signal Based

All of these examples show the flexibility ngx-simple-state provides. The best thing about this library is it is signal based. Look back at our counter example:

```typescript
export type CounterStoreType = Store<{
   count: number;

   setCount: Action<number>;
   increment: Action;
   decrement: Action;
   reset: Action;

   lessThan5: Selector<boolean>;
   lessThan10: Selector<boolean>;
   between5and10: Selector<boolean>;
}>;
export const counterStoreInput: CounterStoreType = {
   count: 0,

   setCount: createAction((state, count) => state.count.set(count)),
   increment: createAction((state) => state.count.update((c) => c + 1)),
   decrement: createAction((state) => state.count.update((c) => c - 1)),
   reset: createAction((state) => state.setCount(0)),

   lessThan5: createSelector((state) => state.count() < 5),
   lessThan10: createSelector((state) => state.count() < 10),
   between5and10: createSelector(
      (state) => !state.lessThan5() && state.lessThan10()
   ),
};
export const CounterStore = store(counterStoreInput);
```

Utilizing this inside a component gives us far more flexibility using the signal primitives angular provides. For example, lets say you want a computed property on the component level and not defined in the (in this case global) store. You can simply use the signals from the injected store then explicitly define computed fields on the component:

```typescript
@Component({...})
export class CounterExampleComponent {
   // * Do not need to inject stores create with `store` method
   readonly store = CounterStore;

   // Component level selector
   lessThan1000 = computed(() => this.store.count() < 1000);
}
```

You can even utilize the `effect` primitive to trigger some component level changes when certain state changes happen:

```typescript
@Component({...})
export class CounterExampleComponent {
   readonly state = CounterState;

   $stateChange = effect(() => {
      const view = this.state.view();
      this.initialize();
   });

   $lessThan10Change = effect(() => {
      if (this.state.lessThan10()) {
         this.showLessThan10Toast()
      }
   });

   private initialize(): void {
      // initialize component based on state from store
   }

   private showLessThan10Toast(): void {
      // if count state was greater than or equal to 10 and then went under 10, show some warning toast message
   }
}
```

You can even have component level stores if you prefer:

```typescript
@Component({...})
export class CounterExampleComponent {
   readonly localState = store<CounterStoreType>({
      count: 0,
      setCount: createAction((state, count) => state.count.set(count)),
      increment: createAction((state) => state.count.update((c) => c + 1)),
      decrement: createAction((state) => state.count.update((c) => c - 1)),
      reset: createAction((state) => state.setCount(0)),
      lessThan5: createSelector((state) => state.count() < 5),
      lessThan10: createSelector((state) => state.count() < 10),
      between5and10: createSelector(
         (state) => !state.lessThan5() && state.lessThan10()
      ),
   });
}
```

There are probably more interesting strategies you can employ with these implementations so feel free to try it out and let others know what you come up with!

<a name="issues"/>

## Issues

If you identify any errors in the library, or have an idea for an improvement, please open
an [issue](https://github.com/Devin-Harris/ngx-simple-state/issues).
