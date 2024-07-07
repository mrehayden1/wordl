import { MainDOMSource, VNode } from '@cycle/dom';
import { ResponseCollection, StorageRequest } from '@cycle/storage';

import { Stream } from 'xstream';

export interface Sources {
  DOM: MainDOMSource;
  storage: ResponseCollection;
};

export interface Sinks {
  DOM: Stream<VNode>;
  storage: Stream<StorageRequest>;
};

export type Component = (sources: Sources) => Sinks;
