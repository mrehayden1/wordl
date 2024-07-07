import { VNode, div } from '@cycle/dom';
import xs, { Stream } from 'xstream';
import delay from 'xstream/extra/delay';

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

type FlipState = 'no' | 'yes' | 'half'

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
  dailyWord: Letter[],
  currentInput: Letter[],
  pastGuesses: Array<Array<[ Letter, Grade ]>>,
  flipping: FlipState[]
): VNode[] {

  return [1,2,3,4,5,6].map((j) => (
    div(`.${styles.guess}`, [1,2,3,4,5].map((i) => (
      div(`.${styles.box}`, {
        class: {
          [styles.animate]: flipping[i - 1] !== 'no'
            && j === pastGuesses.length,
          [styles.boxAlmost]: (flipping[i - 1] === 'half'
            && j === pastGuesses.length || j < pastGuesses.length)
            && pastGuesses[j - 1][i - 1][1] === 'almost',
          [styles.boxRight]: (flipping[i - 1] === 'half'
            && j === pastGuesses.length || j < pastGuesses.length)
            && pastGuesses[j - 1][i - 1][1] === 'right',
          [styles.boxWrong]: (flipping[i - 1] === 'half'
            && j === pastGuesses.length || j < pastGuesses.length)
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

const Grid = (sources: Sources): Sinks => {
  const flipping$: Stream<FlipState[]> = sources
    .pastGuesses$
    .filter((g) => g.length > 0)
    .map(() => (
      xs
        .combine
        .apply(null,
          [1,2,3,4,5].map((i) => (
            xs.merge(
              xs.of('half').compose(delay((i - 1) * 500 + 500)),
              xs.of('yes').compose(delay((i - 1) * 500))
            )
            .startWith('no')
          ))
        ) as Stream<FlipState[]>
    ))
    .flatten()
    .startWith(['no', 'no', 'no', 'no', 'no']);

  return {
    DOM: xs
      .combine(
        sources.dailyWord$,
        sources.currentInput$,
        sources.pastGuesses$,
        flipping$
      )
      .map(([ dailyWord, currentInput, guesses, isFlipped ]) => (
        div(`.${styles.grid}`, (
          renderGrid(dailyWord, currentInput, guesses, isFlipped)
        ))
      ))
  };
};

export default Grid;
