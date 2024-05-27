import { names } from './names';

export interface State {
   currentUserName: string;
}

export const initialValue: State = {
   currentUserName: names[0],
};
