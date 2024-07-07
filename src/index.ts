import { makeDOMDriver } from '@cycle/dom';
import * as h from '@cycle/dom';
import run from '@cycle/run';
import storage from '@cycle/storage';
import { Stream } from 'xstream';

import App from 'App';

const drivers = {
  DOM: makeDOMDriver('#app'),
  storage: storage
};

run(App, drivers);
