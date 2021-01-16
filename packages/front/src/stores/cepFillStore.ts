import { observable } from 'mobx';
import { IObservableValue } from 'mobx/dist/internal';

export type ICepFillStore = IObservableValue<'idle' | 'loading' | 'error'>;

export default observable.box<'idle' | 'loading' | 'error'>('idle');
