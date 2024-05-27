import { Subject } from 'rxjs';

export type Action = CreateAction<any> | CreateActionNoProps;

export function props<T>() {
   return Object.create(null) as T;
}
export type CreateActionNoProps = {
   type: string;
   subject: Subject<{ type: string }>;
   (): { type: string };
};
export type CreateAction<S> = {
   type: string;
   subject: Subject<{ type: string; payload: S }>;
   (props: S): { type: string; payload: S };
};
export function createAction<S>(type: string): CreateActionNoProps;
export function createAction<S>(type: string, props: S): CreateAction<S>;
export function createAction<S>(
   type: string,
   props?: S
): CreateAction<S> | CreateActionNoProps {
   if (props) {
      const subject = new Subject<{ type: string; payload: S }>();
      const call = function (payload: S) {
         const obj = {
            payload,
            type,
         };
         subject.next(obj);
         return obj;
      };
      call.type = type;
      call.subject = subject;
      return call;
   } else {
      const subject = new Subject<{ type: string }>();
      const call = function () {
         const obj = {
            type,
         };
         subject.next(obj);
         return obj;
      };
      call.type = type;
      call.subject = subject;
      return call as unknown as CreateActionNoProps;
   }
}
