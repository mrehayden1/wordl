import { button, div } from '@cycle/dom';
import xs, { Stream } from 'xstream';

import * as C from 'Component';
import { Grade, max } from 'App/Grid';

import * as styles from './Keyboard.css';

export type Letter = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j'
  | 'k' | 'l' | 'm' | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v'
  | 'w' | 'x' | 'y' | 'z';

const LETTERS: Letter[] = [ 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
  'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y',
  'z' ];

const FIRST_ROW: Letter[] = ['q','w','e','r','t','y','u','i','o','p'];
const SECOND_ROW: Letter[] = ['a','s','d','f','g','h','j','k','l'];
const THIRD_ROW: Letter[] = ['z','x','c','v','b','n','m'];

interface Sinks extends C.Sinks {
  backspace$: Stream<{}>;
  enter$: Stream<{}>;
  letter$: Stream<Letter>;
};

interface Sources extends C.Sources {
  pastGuesses$: Stream<Array<Array<[ Letter, Grade ]>>>;
};

function renderLetter(c: Letter, grade: Grade | null) {
  return (
    button(`.${styles.button}`, {
      class: {
        [styles.buttonAlmost]: grade === 'almost',
        [styles.buttonRight]: grade === 'right',
        [styles.buttonWrong]: grade === 'wrong'
      },
      dataset: {
        key: c
      },
      props: {
        type: 'button'
      }
    }, c)
  );
}

const Keyboard = (sources: Sources): Sinks => {

  const { DOM, pastGuesses$ } = sources;

  const keyPress$: Stream<KeyboardEvent> = DOM
    .select('document')
    .events('keyup');

  const buttonClick$: Stream<MouseEvent> = DOM
    .select('button')
    .events('click');

  const input$: Stream<String> = xs
    .merge(
      keyPress$.map((e) => e.key),
      buttonClick$.map((e) => (e.target as HTMLElement).dataset.key)
    );

  const backspace$ = input$
    .filter((key) => key === 'Backspace')
    .mapTo({});

  const enter$ = input$
    .filter((key) => key === 'Enter')
    .mapTo({});

  const letter$ = input$
    .filter((key) => (
      (LETTERS as String[]).includes(key)
    ))
    .map((k) => k as Letter);

  return {
    DOM: pastGuesses$
      .map((pastGuesses) => {
        const colours: Map<Letter, Grade> = pastGuesses
          .flat()
          .reduce((map, [ l, g ]) => (
            map.set(l, max(g, map.get(l) ?? 'wrong'))
          ), new Map());

        return (
          div(`.${styles.keyboard}`, [
            div(`.${styles.keyboardRow}`, (
              FIRST_ROW
                .map(c => renderLetter(c, colours.get(c)))
            )),
            div(`.${styles.keyboardRow}`, (
              SECOND_ROW
                .map(c => renderLetter(c, colours.get(c)))
            )),
            div(`.${styles.keyboardRow}`, [
              button(`.${styles.button}`, {
                dataset: {
                  key: 'Enter'
                }
              }, 'Enter'),
              THIRD_ROW
                .map(c => renderLetter(c, colours.get(c))),
              button(`.${styles.button}`, {
                dataset: {
                  key: 'Backspace'
                }
              }, '⌫')
            ].flat())
          ])
        );
      }),
    backspace$,
    enter$,
    letter$
  };

};

export default Keyboard;
