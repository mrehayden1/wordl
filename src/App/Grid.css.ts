import { globalStyle, style } from '@vanilla-extract/css';

import { almost, right, wrong } from 'global.css';

export const grid = style({
  marginBottom: '20px'
});

export const guess = style({
  display: 'grid',
  gridGap: '10px',
  gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
  marginBottom: '10px',
  width: '100%'
});

export const box = style({
  alignItems: 'center',
  border: '1px solid #ddd',
  display: 'flex',
  height: '70px',
  fontSize: '24px',
  fontWeight: '600',
  justifyContent: 'center',
  textTransform: 'uppercase',
  width: '100%'
});

export const boxRight = style({
  backgroundColor: right,
  borderColor: right,
  color: '#fff'
});

export const boxWrong = style({
  backgroundColor: wrong,
  borderColor: wrong,
  color: '#fff'
});

export const boxAlmost = style({
  backgroundColor: almost,
  borderColor: almost,
  color: '#fff'
});
