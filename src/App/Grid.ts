import { VNode, div } from '@cycle/dom';
import xs, { Stream } from 'xstream';

import * as C from 'Component';

import * as styles from './Grid.css';
import { Letter } from './Keyboard';

export type Guesses = {
  current: Letter[];
  past: Array<Letter[]>;
};

interface Sources extends C.Sources {
  guesses$: Stream<Guesses>;
  word$: Stream<Letter[]>;
};

type Sinks = C.Sinks;

type Grade = 'right' | 'wrong' | 'almost';

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

function renderGrid({ current, past }: Guesses, word: Letter[]): VNode[] {

  const grades: Array<Array<[ Letter, Grade ]>> = past
    .map((guess) => (
      guess
        .reduce((acc, l, i) => (
          acc
            .concat([[
              l,
              gradeGuessLetter(word, guess, acc, l, i)
            ]])
        ), [])
    ));

  return [1,2,3,4,5,6].map((j) => (
    div(`.${styles.guess}`, [1,2,3,4,5].map((i) => (
      div(`.${styles.box}`, {
        class: {
          [styles.boxAlmost]: j <= grades.length
            && grades[j - 1][i - 1][1] === 'almost',
          [styles.boxRight]: j <= grades.length
            && grades[j - 1][i - 1][1] === 'right',
          [styles.boxWrong]: j <= grades.length
            && grades[j - 1][i - 1][1] === 'wrong'
        }
      }, (
        j <= past.length ? (
          past[j - 1][i - 1]
        ) : (
          j === past.length + 1 ? (
            current[i - 1]
          ) : ''
        )
      ))
    )))
  ));

}

const Grid = (sources: Sources): Sinks => ({
  DOM: xs
    .combine(
      sources.guesses$,
      sources.word$
    )
    .map(([ guesses, word ]) => (
      div(`.${styles.grid}`, (
        renderGrid(guesses, word)
      ))
    ))
});

export default Grid;
