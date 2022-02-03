import { style } from '@vanilla-extract/css';

import { almost, right, wrong } from 'global.css';

export const keyboard = style({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column'
});

export const keyboardRow = style({
  marginBottom: '5px'
});

export const button = style({
  backgroundColor: '#ddd',
  border: 'none',
  borderRadius: '3px',
  color: '#000',
  cursor: 'pointer',
  fontWeight: '600',
  height: '36px',
  marginRight: '5px',
  minWidth: '30px',
  padding: '10px',
  textAlign: 'center',
  textTransform: 'uppercase',
  selectors: {
    '&:hover:not(:active)': {
      boxShadow: '0 0 3px rgba(0, 0, 0, 0.4)'
    }
  }
});

export const buttonWrong = style({
  backgroundColor: wrong,
  color: '#fff'
});

export const buttonRight = style({
  backgroundColor: right,
  color: '#fff'
});

export const buttonAlmost = style({
  backgroundColor: almost,
  color: '#fff'
});
