import { div } from '@cycle/dom';
import xs, { Stream } from 'xstream';
import delay from 'xstream/extra/delay';
import dropRepeats from 'xstream/extra/dropRepeats';
import flattenSequentially from 'xstream/extra/flattenSequentially';
import sampleCombine from 'xstream/extra/sampleCombine';

import { Sources, Sinks } from 'Component';
import * as styles from 'App.css';
import Grid, { Guesses } from 'App/Grid';
import Keyboard, { Key, Letter } from 'App/Keyboard';

import allWords from './words.json';

const MESSAGE_DURATION = 2000;
const WORD = 'robot';

const App = (sources: Sources): Sinks => {

  const keyboardSinks = Keyboard(sources);

  const guesses$: Stream<Guesses> = keyboardSinks
    .input$
    .fold(({ current, past }: Guesses, key: Key) => {
      if (key === 'Backspace') {
        return {
          current: current.slice(0, current.length - 1),
          past
        };
      } else if (
        key === 'Enter' && current.length === 5
          && allWords.includes(current.join(''))
      ) {
        return {
          current: [],
          past: past.concat([ current ])
        };
      } else if (key === 'Enter') {
        return {
          current,
          past
        };
      } else {
        return {
          current: current.length === 5
            ? current
            : current.concat([ key ]),
          past
        };
      }
    }, { current: [], past: [] } as Guesses);

  const message$: Stream<String | null> = keyboardSinks
    .input$
    .filter((key) => key === 'Enter')
    .compose(sampleCombine(guesses$))
    .map(([ , { current } ]) => {
      if (current.length === 0) {
        return xs.of(null);
      } else if (current.length === 5) {
        return !allWords.includes(current.join('')) ? (
          xs.of(null)
            .compose(delay(MESSAGE_DURATION))
            .startWith('Word not in list.')
        ) : (
          xs.of(null)
        );
      } else {
        return xs.of(null)
          .compose(delay(MESSAGE_DURATION))
          .startWith('Your guess is too short.');
      }
    })
    .compose(flattenSequentially)
    .startWith(null);

  const word$ = xs
    .of(WORD.split('') as Letter[]);

  const gridSinks = Grid({ ...sources, guesses$, word$ });

  return {
    DOM: xs
      .combine(
        gridSinks.DOM,
        keyboardSinks.DOM,
        message$.debug()
      )
      .map(([ gridDOM, keyboardDOM, message ]) => (
        div(`.${styles.game}`, [
          gridDOM,
          keyboardDOM,
          message && (
            div(`.${styles.messageWrapper}`, [
              div(`.${styles.message}`, message)
            ])
          )
        ])
      ))
  };
};

export default App;
