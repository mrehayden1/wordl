import { button, div } from '@cycle/dom';
import xs, { Stream } from 'xstream';

import * as C from 'Component';

import * as styles from './Keyboard.css';

export type Letter = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j'
  | 'k' | 'l' | 'm' | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v'
  | 'w' | 'x' | 'y' | 'z';
export type Key = Letter | 'Enter' | 'Backspace';

interface Sinks extends C.Sinks {
  input$: Stream<Key>;
};

type Sources = C.Sources;

const Keyboard = (sources: Sources): Sinks => {

  const { DOM } = sources;

  const keyPress$: Stream<KeyboardEvent> = DOM
    .select('document')
    .events('keyup');

  const buttonClick$: Stream<MouseEvent> = DOM
    .select('button')
    .events('click');

  const keyboardInput$: Stream<Key> = keyPress$
    .filter((e) => (
      'qwertyuiopasdfghjklzxcvbnm'.split('').indexOf(e.key) >= 0
        || e.key === 'Backspace'
        || e.key === 'Enter'
    ))
    .map((e) => e.key as Key);

  const buttonInput$: Stream<Key> = buttonClick$
    .map((e) => (e.target as HTMLElement).dataset.key as Key);

  return {
    DOM: xs
      .of(
        div(`.${styles.keyboard}`, [
          div(`.${styles.keyboardRow}`, (
            'qwertyuiop'
              .split('')
              .map(c => (
                button(`.${styles.button}`, {
                  dataset: {
                    key: c
                  },
                  props: {
                    type: 'button'
                  }
                }, c)
              ))
          )),
          div(`.${styles.keyboardRow}`, (
            'asdfghjkl'
              .split('')
              .map(c => (
                button(`.${styles.button}`, {
                  dataset: {
                    key: c
                  },
                  props: {
                    type: 'button'
                  }
                }, c)
              ))
          )),
          div(`.${styles.keyboardRow}`, [
            button(`.${styles.button}`, {
              dataset: {
                key: 'Enter'
              }
            }, 'Enter'),
            'zxcvbnm'
              .split('')
              .map(c => (
                button(`.${styles.button}`, {
                  dataset: {
                    key: c
                  },
                  props: {
                    type: 'button'
                  }
                }, c)
              )),
            button(`.${styles.button}`, {
              dataset: {
                key: 'Backspace'
              }
            }, '⌫')
          ].flat())
        ])
      ),
    input$: xs.merge(keyboardInput$, buttonInput$)
  };

};

export default Keyboard;
