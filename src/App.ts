import { div, header, main } from '@cycle/dom';
import { differenceInDays } from 'date-fns';
import xs, { Stream } from 'xstream';
import delay from 'xstream/extra/delay';
import dropRepeats from 'xstream/extra/dropRepeats';
import flattenConcurrently from 'xstream/extra/flattenConcurrently';
import sampleCombine from 'xstream/extra/sampleCombine';

import { Sources, Sinks } from 'Component';
import * as styles from 'App.css';
import Grid, { Grade, gradeGuessLetter } from 'App/Grid';
import Keyboard, { Letter } from 'App/Keyboard';

import DAILY_WORDS from '../data/daily-words.json';
import DICTIONARY from '../data/dictionary.json';

const MESSAGE_DURATION = 2250;
// The date the wordlist starts repeating from
const INIT_DATE = new Date(2023, 7, 1);
const DATE = new Date();
const DATE_STAMP = DATE.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  });

function winMessage(guesses: number): string {
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
      throw Error('Undefined win message.');
  }
}

const App = (sources: Sources): Sinks => {

  const backspace$: Stream<{}> = xs.create();
  const enter$: Stream<{}> = xs.create();
  const letter$: Stream<Letter> = xs.create();

  const dailyWord$: Stream<Letter[]> = xs
    .of(
      DAILY_WORDS[differenceInDays(DATE, INIT_DATE) % DAILY_WORDS.length]
        .split('') as Letter[]
    );

  // Store the guesses in local storage
  // Read the initial value from storage
  const validGuesses$: Stream<Array<Letter[]>> = sources
    .storage
    .local
    .getItem(DATE_STAMP)
    .map((v) => v ? JSON.parse(v as string) : [] as Array<Letter[]>);

  const roundOver$: Stream<boolean> = xs
    .combine(
      validGuesses$,
      dailyWord$
    )
    .map(([ guesses, dailyWord ]) => (
      guesses.length === 6 || (
        guesses.length > 0
          && guesses[guesses.length - 1].join('') === dailyWord.join('')
      )
    ))
    .startWith(false);

  const keyboardInput$: Stream< Letter | 'Backspace' | 'Enter'> = xs
    .merge(
      backspace$.mapTo('Backspace'as 'Backspace'),
      enter$.mapTo('Enter' as 'Enter'),
      letter$
    );

  const currentInput$: Stream<Letter[]> = keyboardInput$
    .compose(sampleCombine(
      roundOver$,
      validGuesses$
        .map((guesses) => (
          guesses.length > 0 ? (
            xs.merge(
              xs.of(true),
              xs.of(false).compose(delay(3000))
            )
          ) : xs.of(false)
        ))
        .flatten()
    ))
    .filter(([ , over, animating ]) => !over && !animating)
    .fold((input: Letter[], [ k, ]) => {
      if (k === 'Backspace') {
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
    .compose(
      sampleCombine(
        currentInput$.compose(delay(1)),
        roundOver$
      )
    )
    .filter(([ , , won ]) => !won)
    .map(([ enter, input ]) => input);

  // Write guesses to storage and read them back out again to react to changes
  const storage$ = validGuesses$
    .map((guesses) => (
      submit$
        .filter((guess) => (
          guess.length === 5 && DICTIONARY.includes(guess.join(''))
        ))
        .fold((past, guess) => (
          past.concat([guess])
        ), guesses)
        .drop(1)
        .map((v) => ({
          // Just want a human readable datestamp, doesn't need to be locale specific
          key: DATE_STAMP,
          value: JSON.stringify(v)
        }))
    ))
    .flatten();

  const messages$: Stream<Array<[ string, number ]>> = submit$
    .compose(sampleCombine(dailyWord$, validGuesses$))
    .map(([ guess, dailyWord, past ]): Stream<[ string, number ]> => {
      const messageId = Date.now();

      if (guess.length < 5) {
        return xs.of([ '', messageId ] as [ string, number ])
          .compose(delay(MESSAGE_DURATION))
          .startWith([ 'Your guess is too short.', messageId ]);
      } else if (!DICTIONARY.includes(guess.join(''))) {
        return xs.of([ '', messageId ] as [ string, number ])
          .compose(delay(MESSAGE_DURATION))
          .startWith([ 'Word not in list.', messageId ]);
      } else if (guess.join('') === dailyWord.join('')) {
        return xs.of([ '', messageId ] as [ string, number ])
          .compose(delay(MESSAGE_DURATION))
          .startWith([ winMessage(past.length + 1), messageId ]);
      } else if (past.length + 1 === 6) {
        const dailyWordSentenceCase = dailyWord[0].toUpperCase()
          + dailyWord.slice(1).join('');

        return xs.of([ '', messageId ] as [ string, number ])
          .compose(delay(MESSAGE_DURATION))
          .startWith([
            `Bad luck! The answer was "${dailyWordSentenceCase}".`,
            messageId
          ]);
      } else {
        return xs.never();
      }
    })
    .compose(flattenConcurrently)
    .fold((messages, [ message, id ]) => {
      if (message === '') {
        return messages
          .filter(([ , i ]) => {
            return i !== id;
          });
      } else {
        return messages
          .concat([[ message, id ]]);
      }
    }, []);

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
        messages$
      )
      .map(([ gridDOM, keyboardDOM, messages ]) => (
        div(`.${styles.game}`, [
          header([
            'Wordle'
          ]),
          main([
            gridDOM,
            keyboardDOM
          ]),
          div(`.${styles.messageWrapper}`, (
            messages.map(([ message, id ]) => (
              div(`.${styles.message}`, {
                key: id
              }, [
                message
              ])
            ))
          ))
        ])
      )),
    storage: storage$
  };
};

export default App;
