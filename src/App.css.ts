import { globalStyle, keyframes, style } from '@vanilla-extract/css';

import { width } from './global.css';

globalStyle('*', {
  boxSizing: 'border-box'
});

globalStyle('html, body, #app', {
  color: '#333',
  fontFamily: 'sans-serif',
  height: '100%',
  margin: 0,
  width: '100%'
});

globalStyle('#app', {
  alignItems: 'center',
  justifyContent: 'center',
});

globalStyle('header', {
  alignItems: 'center',
  border: '0 solid #ddd',
  borderBottomWidth: '2px',
  display: 'flex',
  fontSize: '20px',
  fontWeight: '600',
  height: '50px',
  justifyContent: 'center',
  width: '100%'
});

globalStyle('main', {
  display: 'flex',
  flexDirection: 'column',
  height: 'calc(100% - 45px)',
  justifyContent: 'center',
  margin: '0 auto',
  overflow: 'hidden',
  width
});

export const game = style({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  width: '100%'
});

export const messageWrapper = style({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
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
