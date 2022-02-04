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

const MESSAGE_DURATION = 2250;
const WORD = 'robot';

function winMessage(guesses: number) {
  switch (guesses) {
    case 1:
      return 'Incredible!';
    case 2:
      return 'Amazing!';
    case 3:
      return 'Great!';
    case 4:
      return 'Good!';
    case 5:
      return 'Got it!';
    case 6:
      return 'Phew!';
    default:
      return Error('Unpossible.');
  }
}

const App = (sources: Sources): Sinks => {

  const keyboardSinks = Keyboard(sources);

  const word$ = xs
    .of(WORD.split('') as Letter[]);

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
    .map(([ , { current, past } ]) => {
      if (current.length === 0) {
        return xs.of(null);
      } else if (current.length === 5 && !allWords.includes(current.join(''))) {
        return (
          xs.of(null)
            .compose(delay(MESSAGE_DURATION))
            .startWith('Word not in list.')
        );
      } else if (current.length === 5 && current.join('') === WORD) {
        return (
          xs.of(null)
            .compose(delay(MESSAGE_DURATION))
            .startWith(winMessage(past.length))
        );
      } else if (current.length === 5) {
        return xs.of(null);
      } else {
        return xs.of(null)
          .compose(delay(MESSAGE_DURATION))
          .startWith('Your guess is too short.');
      }
    })
    .compose(flattenSequentially)
    .startWith(null);

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
