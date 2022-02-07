import { div } from '@cycle/dom';
import { differenceInDays } from 'date-fns';
import xs, { Stream } from 'xstream';
import delay from 'xstream/extra/delay';
import dropRepeats from 'xstream/extra/dropRepeats';
import flattenSequentially from 'xstream/extra/flattenSequentially';
import sampleCombine from 'xstream/extra/sampleCombine';

import { Sources, Sinks } from 'Component';
import * as styles from 'App.css';
import Grid, { Grade } from 'App/Grid';
import Keyboard, { Letter } from 'App/Keyboard';

import DAILY_WORDS from './daily-words.json';
import DICTIONARY from './dictionary.json';

const MESSAGE_DURATION = 2250;
const START_DATE = new Date(2022, 1, 7);

function gradeGuessLetter(
  word: Letter[],
  guess: Letter[],
  already: Array<[ Letter, Grade ]>,
  letter: Letter,
  index: number
): Grade {
  if (letter === word[index]) {
    return 'right';
  } else {
    return (
      word
        .filter((wl, j) => wl === letter && guess[j] !== wl)
        .length > (
          already
            .filter(([ al, g ], j) => al === letter && g === 'almost')
            .length
        )
    ) ? (
      'almost'
    ) : (
      'wrong'
    );
  }
}

function winMessage(guesses: number) {
  switch (guesses) {
    case 1:
      return 'Perfect!';
    case 2:
      return 'Fantastic!';
    case 3:
      return 'Superb!';
    case 4:
      return 'Excellent!';
    case 5:
      return 'Great!';
    case 6:
      return 'Phew!';
    default:
      return Error('Undefined win message.');
  }
}

const App = (sources: Sources): Sinks => {

  const backspace$: Stream<{}> = xs.create();
  const enter$: Stream<{}> = xs.create();
  const letter$: Stream<Letter> = xs.create();

  const word$: Stream<Letter[]> = xs
    .of(
      DAILY_WORDS[differenceInDays(new Date(), START_DATE)]
        .split('') as Letter[]
    );

  const currentGuess$: Stream<Letter[]> = xs
    .merge(
      backspace$.mapTo('Backspace'),
      enter$.mapTo('Enter'),
      letter$
    )
    .fold((guess: Letter[], k: Letter | 'Backspace' | 'Enter') => {
      if (k === 'Backspace') {
        return guess.slice(0, guess.length - 1);
      } else if (k === 'Enter') {
        if (guess.length === 5 && DICTIONARY.includes(guess.join(''))) {
          return [];
        } else {
          return guess;
        }
      } else if (guess.length < 5) {
        return guess.concat([ k ]);
      } else {
        return guess;
      }
    }, []);

  const pastGuesses$: Stream<Array<Array<[ Letter, Grade ]>>> = enter$
    .compose(
      sampleCombine(
        word$,
        currentGuess$.compose(delay(1))
      )
    )
    .fold((past, [ , word, guess ]) => {
      if (guess.length === 5 && DICTIONARY.includes(guess.join(''))) {
        return past
          .concat([
            guess
              .reduce((acc, l, i) => (
                acc
                .concat([[
                  l,
                  gradeGuessLetter(word, guess, acc, l, i)
                ]])
              ), [])
          ]);
      } else {
        return past;
      }
    }, []);

  const message$: Stream<String | null> = enter$
    .compose(sampleCombine(word$, currentGuess$.compose(delay(1)), pastGuesses$))
    .map(([ , word, guess, past ]) => {
      if (past.length === 6) {
        const wordSentenceCase = word[0].toUpperCase()
          + word.slice(1).join('');
        return xs.of(null)
          .compose(delay(MESSAGE_DURATION))
          .startWith(`Bad luck! The answer was "${wordSentenceCase}".`);
      } else if (guess.length === 5 && !DICTIONARY.includes(guess.join(''))) {
        return xs.of(null)
          .compose(delay(MESSAGE_DURATION))
          .startWith('Word not in list.');
      } else if (guess.length === 5 && guess.join('') === word.join('')) {
        return xs.of(null)
          .compose(delay(MESSAGE_DURATION))
          .startWith(winMessage(past.length));
      } else if (guess.length === 5) {
        return xs.of(null);
      } else {
        return xs.of(null)
          .compose(delay(MESSAGE_DURATION))
          .startWith('Your guess is too short.');
      }
    })
    .compose(flattenSequentially)
    .startWith(null);

  const gridSinks = Grid({ ...sources, currentGuess$, pastGuesses$, word$ });

  const keyboardSinks = Keyboard({
    pastGuesses$,
    ...sources
  });

  backspace$.imitate(keyboardSinks.backspace$);
  enter$.imitate(keyboardSinks.enter$);
  letter$.imitate(keyboardSinks.letter$);

  return {
    DOM: xs
      .combine(
        gridSinks.DOM,
        keyboardSinks.DOM,
        message$
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
