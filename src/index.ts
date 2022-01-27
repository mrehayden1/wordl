import { MainDOMSource, VNode, makeDOMDriver } from '@cycle/dom';
import * as h from '@cycle/dom';
import run from '@cycle/run';

import xs, { Stream } from 'xstream';

const drivers = {
  DOM: makeDOMDriver('#app')
};

interface Sources {
  DOM: MainDOMSource;
}

interface Sinks {
  DOM: Stream<VNode>;
}

function App(sources: Sources): Sinks {
  return {
    DOM: xs.of(h.div('Hello World'))
  };
}

run(App, drivers);
