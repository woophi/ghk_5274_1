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

const imgBox = style({
  background: 'linear-gradient(178.81deg, #D1DBFE 55.16%, #AFB3F0 98.98%)',
  paddingTop: '24px',
  borderRadius: '24px',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  alignItems: 'center',
  textAlign: 'center',
  position: 'relative',
  marginBottom: '76px',
});
const imgSubBox = style({
  backgroundColor: '#F4F5F6',
  padding: '33px 1rem 8px',
  borderBottomLeftRadius: '24px',
  borderBottomRightRadius: '24px',
  display: 'flex',
  alignItems: 'center',
  textAlign: 'center',
  justifyContent: 'center',
  position: 'absolute',
  width: '100%',
  bottom: '-60px',
  left: 0,
  zIndex: -1,
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

const img = style({ marginTop: 'auto', maxWidth: '212px', objectFit: 'contain' });

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

const blueBox = style({
  backgroundColor: '#E9F3FF',
  padding: '1rem',
  borderRadius: '12px',
});
const blueBoxImg = style({
  objectFit: 'contain',
  marginRight: '-1rem',
  marginBottom: '-1rem',
});

const blueBox2 = style({
  backgroundColor: '#E4F0FF',
  padding: '20px 1rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  borderRadius: '24px',
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
  imgBox,
  imgSubBox,
  blueBox,
  blueBoxImg,
  blueBox2,
};
