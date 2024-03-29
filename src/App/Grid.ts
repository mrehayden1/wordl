import { VNode, div } from '@cycle/dom';
import xs, { Stream } from 'xstream';

import * as C from 'Component';

import * as styles from './Grid.css';
import { Letter } from './Keyboard';

interface Sources extends C.Sources {
  currentInput$: Stream<Letter[]>;
  pastGuesses$: Stream<Array<Array<[ Letter, Grade ]>>>;
  dailyWord$: Stream<Letter[]>;
};

type Sinks = C.Sinks;

export type Grade = 'right' | 'wrong' | 'almost';

export function gradeGuessLetter(
  dailyWord: Letter[],
  guess: Letter[],
  past: Array<[ Letter, Grade ]>,
  letter: Letter,
  index: number
): Grade {
  if (letter === dailyWord[index]) {
    return 'right';
  } else {
    return (
      dailyWord
        .filter((wl, j) => wl === letter && guess[j] !== wl)
        .length > (
          past
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

export function max(g: Grade, h: Grade): Grade {
  const enums = {
    'wrong': 0,
    'almost': 1,
    'right': 2
  };
  return enums[h] >= enums[g] ? h : g;
}

function renderGrid(
  currentInput: Letter[],
  pastGuesses: Array<Array<[ Letter, Grade ]>>,
  dailyWord: Letter[]
): VNode[] {

  return [1,2,3,4,5,6].map((j) => (
    div(`.${styles.guess}`, [1,2,3,4,5].map((i) => (
      div(`.${styles.box}`, {
        class: {
          [styles.boxAlmost]: j <= pastGuesses.length
            && pastGuesses[j - 1][i - 1][1] === 'almost',
          [styles.boxRight]: j <= pastGuesses.length
            && pastGuesses[j - 1][i - 1][1] === 'right',
          [styles.boxWrong]: j <= pastGuesses.length
            && pastGuesses[j - 1][i - 1][1] === 'wrong'
        }
      }, (
        j <= pastGuesses.length ? (
          pastGuesses[j - 1][i - 1][0]
        ) : (
          j === pastGuesses.length + 1 ? (
            currentInput[i - 1]
          ) : ''
        )
      ))
    )))
  ));

}

const Grid = (sources: Sources): Sinks => ({
  DOM: xs
    .combine(
      sources.currentInput$,
      sources.pastGuesses$,
      sources.dailyWord$
    )
    .map(([ currentInput, guesses, dailyWord ]) => (
      div(`.${styles.grid}`, (
        renderGrid(currentInput, guesses, dailyWord)
      ))
    ))
});

export default Grid;
