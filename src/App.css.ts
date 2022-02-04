import { globalStyle, keyframes, style } from '@vanilla-extract/css';

globalStyle('html, body, #app', {
  color: '#333',
  fontFamily: 'sans-serif',
  height: '100%',
  margin: 0,
  width: '100%'
});

globalStyle('#app', {
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'center',
  minWidth: '360px'
});

export const game = style({
  display: 'flex',
  flexDirection: 'column'
});

export const messageWrapper = style({
  alignItems: 'center',
  display: 'flex',
  height: '100%',
  justifyContent: 'center',
  left: 0,
  pointerEvents: 'none',
  position: 'fixed',
  top: 0,
  width: '100%'
});

const fade = keyframes({
  '0%': { opacity: 1 },
  '100%': { opacity: 0 }
});

export const message = style({
  animation: `${fade} .25s linear 2s`,
  background: 'rgba(0, 0, 0, 0.7)',
  borderRadius: '4px',
  color: 'white',
  padding: '7px 10px'
});
