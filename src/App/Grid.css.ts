import { globalStyle, keyframes, style } from '@vanilla-extract/css';

import { almost, right, wrong } from 'global.css';

export const flip = keyframes({
  '0%': { transform: 'scaleX(1)' },
  '50%': { transform: 'scaleX(0)' },
  '100%': { transform: 'scaleX(1)' }
});

export const grid = style({
  marginBottom: '20px'
});

export const guess = style({
  display: 'grid',
  gridGap: '10px',
  gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
  marginBottom: '8px',
  width: '100%'
});

export const box = style({
  alignItems: 'center',
  border: '2px solid #ddd',
  borderRadius: '2px',
  display: 'flex',
  height: '70px',
  fontSize: '24px',
  fontWeight: '600',
  justifyContent: 'center',
  textTransform: 'uppercase',
  textShadow: '0 0 2px rgba(0, 0, 0, 0.25)',
  width: '100%'
});

export const animate = style({
  animationDuration: '1s',
  animationTimingFunction: 'linear',
  animationName: flip
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
