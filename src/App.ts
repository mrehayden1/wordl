import { div, header, main } from '@cycle/dom';
import { differenceInDays } from 'date-fns';
import xs, { Stream } from 'xstream';
import delay from 'xstream/extra/delay';
import dropRepeats from 'xstream/extra/dropRepeats';
import flattenSequentially from 'xstream/extra/flattenSequentially';
import sampleCombine from 'xstream/extra/sampleCombine';

import { Sources, Sinks } from 'Component';
import * as styles from 'App.css';
import Grid, { Grade, gradeGuessLetter } from 'App/Grid';
import Keyboard, { Letter } from 'App/Keyboard';

import DAILY_WORDS from './daily-words.json';
import DICTIONARY from './dictionary.json';

const MESSAGE_DURATION = 2250;
const START_DATE = new Date(2023, 7, 1);

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

  const dailyWord$: Stream<Letter[]> = xs
    .of(
      DAILY_WORDS[differenceInDays(new Date(), START_DATE)]
        .split('') as Letter[]
    );

  const submitProxy$: Stream<Letter[]> = xs.create();

  const won$: Stream<boolean> = submitProxy$
    .compose(sampleCombine(dailyWord$))
    .map(([ guess, dailyWord ]) => (
      guess.join('') === dailyWord.join('')
    ))
    .startWith(false);

  const keyboardInput$: Stream< Letter | 'Backspace' | 'Enter'> = xs
    .merge(
      backspace$.mapTo('Backspace'as 'Backspace'),
      enter$.mapTo('Enter' as 'Enter'),
      letter$
    );

  const currentInput$: Stream<Letter[]> = keyboardInput$
    .compose(sampleCombine(won$))
    .fold((input: Letter[], [ k, won ]) => {
      if (won) {
        return [];
      } else if (k === 'Backspace') {
        return input.slice(0, input.length - 1);
      } else if (k === 'Enter') {
        if (input.length === 5 && DICTIONARY.includes(input.join(''))) {
          return [];
        } else {
          return input;
        }
      } else if (input.length < 5) {
        return input.concat([ k ]);
      } else {
        return input;
      }
    }, []);

  const submit$: Stream<Letter[]> = enter$
    // Introduce a delay to the input so we get the last input before its
    // cleared by an Enter input.
    .compose(sampleCombine(currentInput$.compose(delay(1)), won$))
    .filter(([ , , won ]) => !won)
    .map(([ enter, input ]) => input);

  submitProxy$.imitate(submit$);

  const validGuesses$: Stream<Array<Letter[]>> = submit$
    .compose(sampleCombine(dailyWord$))
    .fold((past, [ guess, dailyWord ]) => (
      guess.length === 5 && DICTIONARY.includes(guess.join('')) ?
        past.concat([guess]) : past
    ), []);

  const message$: Stream<String | null> = submit$
    .compose(sampleCombine(dailyWord$, validGuesses$))
    .map(([ guess, dailyWord, past ]) => {
      if (guess.length === 5 && !DICTIONARY.includes(guess.join(''))) {
        return xs.of(null)
          .compose(delay(MESSAGE_DURATION))
          .startWith('Word not in list.');
      } else if (guess.length === 5 && guess.join('') === dailyWord.join('')) {
        return xs.of(null)
          .compose(delay(MESSAGE_DURATION))
          .startWith(winMessage(past.length));
      } else if (past.length === 6) {
        const dailyWordSentenceCase = dailyWord[0].toUpperCase()
          + dailyWord.slice(1).join('');
        return xs.of(null)
          .compose(delay(MESSAGE_DURATION))
          .startWith(`Bad luck! The answer was "${dailyWordSentenceCase}".`);
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

  const gradedGuesses$: Stream<Array<Array<[ Letter, Grade ]>>> =
    validGuesses$
      .compose(sampleCombine(dailyWord$))
      .map(([ guesses, dailyWord ]) => (
        guesses
          .map((guess) => (
            guess
              .reduce((acc, l, i) => (
                acc
                  .concat([[
                    l,
                    gradeGuessLetter(dailyWord, guess, acc, l, i)
                  ]])
              ), [])
          ))
      ))
      .startWith([]);

  const gridSinks = Grid({
    ...sources,
    currentInput$,
    pastGuesses$: gradedGuesses$,
    dailyWord$
  });

  const keyboardSinks = Keyboard({
    pastGuesses$: gradedGuesses$,
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
          header([
            'Wordl'
          ]),
          main([
            gridDOM,
            keyboardDOM
          ]),
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
