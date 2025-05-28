import { globalStyle, style } from '@vanilla-extract/css';

const bottomBtn = style({
  position: 'fixed',
  zIndex: 2,
  width: '100%',
  padding: '12px',
  bottom: 0,
});

const container = style({
  display: 'flex',
  padding: '1rem',
  flexDirection: 'column',
  gap: '1rem',
  width: '100%',
});

const box = style({
  display: 'flex',
  padding: '20px 16px',
  flexDirection: 'column',
  gap: '12px',
  borderRadius: '1rem',
  backgroundColor: '#F2F3F5',
  margin: '1rem 0',
});

const row = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

const img = style({ margin: '0 auto', maxWidth: '343px', objectFit: 'contain' });

export const stepStyle = style({});

globalStyle(`${stepStyle} > div > div > div:first-child`, {
  backgroundColor: 'var(--color-light-neutral-translucent-1300)',
  color: 'var(--color-light-text-primary-inverted)',
});

export const btmContent = style({
  padding: 0,
});
const swSlide = style({
  width: 'min-content',
});

const btmRowCalc = style({
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  justifyContent: 'space-between',
});
export const appSt = {
  bottomBtn,
  container,
  box,
  row,
  img,
  stepStyle,
  btmContent,
  swSlide,
  btmRowCalc,
};
