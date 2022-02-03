import { MainDOMSource, VNode } from '@cycle/dom';

import { Stream } from 'xstream';

export interface Sources {
  DOM: MainDOMSource;
};

export interface Sinks {
  DOM: Stream<VNode>;
};

export type Component = (sources: Sources) => Sinks;
