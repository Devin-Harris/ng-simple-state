# NgxSimpleState

Simple state management for angular.

The goal of NgxSimpleState is to provide a clean, signal based approach to handling state in angular applications. Many libraries such as ngrx, ngxs, and others require extensive boilerplate and knowledge of patterns such as redux. Libraries like these can provide consistency and more flexibility for large scale applications, but in some opinions could be cumbersome. NgxSimpleState attempts to provide a simple, declarative approach to defining how your state looks and can change, while also building on top of the new signal and computed primitives provided in recent angular versions.

This library also took some inspiration from ngrx [SignalStore](https://ngrx.io/guide/signals/signal-store). SignalStore has some concepts such as only creating computed signal fields, restricting of selectors within selectors, and proxy logic to recursively create signals for object fields. In my opinion some of these are strange implementations and were the main reasons for creating this library. Of course, I am sure there are reasons for all of those implementations within ngrx's SignalStore, but for my needs a simpler and more flexible approach seemed warranted.

See full documentation on [github repository](https://github.com/Devin-Harris/ngx-simple-state)
