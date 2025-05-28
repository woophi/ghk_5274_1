import { BottomSheet } from '@alfalab/core-components/bottom-sheet';
import { ButtonMobile } from '@alfalab/core-components/button/mobile';
import { Checkbox } from '@alfalab/core-components/checkbox';
import { Collapse } from '@alfalab/core-components/collapse';
import { Gap } from '@alfalab/core-components/gap';
import { Input } from '@alfalab/core-components/input';
import { PureCell } from '@alfalab/core-components/pure-cell';
import { Steps } from '@alfalab/core-components/steps';
import { Tag } from '@alfalab/core-components/tag';
import { Typography } from '@alfalab/core-components/typography';
import { ChevronDownMIcon } from '@alfalab/icons-glyph/ChevronDownMIcon';
import { ChevronUpMIcon } from '@alfalab/icons-glyph/ChevronUpMIcon';
import { OutsideMIcon } from '@alfalab/icons-glyph/OutsideMIcon';
import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import hb from './assets/hb.png';
import pers from './assets/pers.png';
import piec from './assets/piec.png';
import rubd from './assets/rubd.png';
import wes from './assets/wes.png';
import { LS, LSKeys } from './ls';
import { appSt } from './style.css';
import { ThxLayout } from './thx/ThxLayout';
import { sendDataToGACalc } from './utils/events';
import { round } from './utils/round';

const chipsIncome = [
  {
    title: 'До 80 000 ₽',
    value: 80_000,
  },
  {
    title: '80 001 ₽ – 150 000 ₽',
    value: 150_000,
  },
  {
    title: '150 001 ₽ и более',
    value: 150_001,
  },
];

const min = 2000;
const max = 3_000_000;

const MAX_GOV_SUPPORT = 360000;
const TAX = 0.13;
const INVEST_DURATION = 15;
const INTEREST_RATE = 0.07;

function calculateSumContributions(monthlyPayment: number, additionalContribution: number): number {
  return round(additionalContribution + monthlyPayment * 11 + monthlyPayment * 12 * (INVEST_DURATION - 1), 2);
}
function calculateStateSupport(monthlyPayment: number, subsidyRate: number): number {
  const support = monthlyPayment * subsidyRate * 10 * 12;
  return round(Math.min(support, MAX_GOV_SUPPORT), 2);
}
function calculateInvestmentIncome(
  firstDeposit: number,
  monthlyPayment: number,
  subsidyRate: number,
  interestRate: number,
): number {
  const annualPayment = monthlyPayment * 12;
  const adjustedPayment = Math.min(firstDeposit, monthlyPayment * subsidyRate * 12);
  return round(
    ((annualPayment + adjustedPayment + firstDeposit) * (Math.pow(1 + interestRate, INVEST_DURATION) - 1)) /
      (interestRate * 2),
    2,
  );
}
function calculateTaxRefund(sumContributions: number, taxRate: number): number {
  return round(sumContributions * taxRate, 2);
}

export const App = () => {
  const [loading, setLoading] = useState(false);
  const [collapsedItems, setCollapsedItem] = useState<string[]>([]);
  const [calcData, setCalcData] = useState<{
    incomeValue: number;
    firstDeposit: number;
    monthlyDeposit: number;
    taxInvest: boolean;
  }>({
    firstDeposit: 72_000,
    incomeValue: 80_000,
    monthlyDeposit: 2_000,
    taxInvest: false,
  });
  const [openBs, setOpenBs] = useState(false);

  const subsidyRate = calcData.incomeValue === 80_000 ? 1 : calcData.incomeValue === 150_000 ? 0.5 : 0.25;
  const deposit15years = calculateSumContributions(calcData.monthlyDeposit, calcData.firstDeposit);
  const taxRefund = calculateTaxRefund(deposit15years, TAX);
  const govCharity = calculateStateSupport(calcData.monthlyDeposit, subsidyRate);
  const investmentsIncome = calculateInvestmentIncome(
    calcData.firstDeposit,
    calcData.monthlyDeposit,
    subsidyRate,
    INTEREST_RATE,
  );
  const total = investmentsIncome + govCharity + (calcData.taxInvest ? taxRefund : 0) + deposit15years;

  useEffect(() => {
    if (!LS.getItem(LSKeys.UserId, null)) {
      LS.setItem(LSKeys.UserId, Date.now());
    }
  }, []);

  const submit = () => {
    window.gtag('event', '4581_confirm_var1');
    setLoading(true);

    LS.setItem(LSKeys.ShowThx, true);
    setLoading(false);
    window.location.replace(
      'alfabank://multistep-route?fromModule=FORM&stepNumber=0&alias=invest-long-term-savings-open-alias&prefilledDataID=1001&version=2',
    );
  };

  const handleBlurInputCalc1 = () => {
    const value = Number(calcData.firstDeposit);

    if (value < min) {
      setCalcData({ ...calcData, firstDeposit: min });
      return;
    }
  };

  const handleBlurInputCalc2 = () => {
    const value = Number(calcData.monthlyDeposit);

    if (value < min) {
      setCalcData({ ...calcData, monthlyDeposit: min });
      return;
    }
    if (value > max) {
      setCalcData({ ...calcData, monthlyDeposit: max });
      return;
    }
  };

  const openCalc = () => {
    window.gtag('event', '4581_calc_var1');
    setOpenBs(true);
  };

  const closeCalc = () => {
    setOpenBs(false);
    sendDataToGACalc({
      calc: `${calcData.incomeValue},${calcData.firstDeposit},${calcData.monthlyDeposit},${calcData.taxInvest ? 'T' : 'F'}`,
    });
  };

  if (LS.getItem(LSKeys.ShowThx, false)) {
    return <ThxLayout />;
  }

  return (
    <>
      <div className={appSt.container}>
        <img src={hb} alt="hb" width="100%" height={226} className={appSt.img} />
        <Typography.TitleResponsive tag="h1" view="large" font="system" weight="semibold">
          Программа долгосрочных сбережений
        </Typography.TitleResponsive>
        <Typography.Text>
          Откладывайте с выгодой: получите процент на вклад, поддержку от государства и налоговый вычет
        </Typography.Text>

        <PureCell>
          <PureCell.Graphics verticalAlign="center">
            <img src={rubd} width={48} height={48} alt="rubd" />
          </PureCell.Graphics>
          <PureCell.Content>
            <PureCell.Main>
              <Typography.Text view="primary-medium" tag="p" defaultMargins={false}>
                Доходность
              </Typography.Text>
              <Typography.Text view="primary-small" color="secondary">
                21,56% годовых
              </Typography.Text>
            </PureCell.Main>
          </PureCell.Content>
        </PureCell>

        <PureCell>
          <PureCell.Graphics verticalAlign="center">
            <img src={pers} width={48} height={48} alt="rubd" />
          </PureCell.Graphics>
          <PureCell.Content>
            <PureCell.Main>
              <Typography.Text view="primary-medium" tag="p" defaultMargins={false}>
                Софинансирование
              </Typography.Text>
              <Typography.Text view="primary-small" color="secondary">
                до 36 000 ₽ в год
              </Typography.Text>
            </PureCell.Main>
          </PureCell.Content>
        </PureCell>

        <PureCell>
          <PureCell.Graphics verticalAlign="center">
            <img src={piec} width={48} height={48} alt="rubd" />
          </PureCell.Graphics>
          <PureCell.Content>
            <PureCell.Main>
              <Typography.Text view="primary-medium" tag="p" defaultMargins={false}>
                Налоговый вычет
              </Typography.Text>
              <Typography.Text view="primary-small" color="secondary">
                от 13% до 22% от суммы взносов, до 88 000 ₽ в год
              </Typography.Text>
            </PureCell.Main>
          </PureCell.Content>
        </PureCell>
        <PureCell>
          <PureCell.Graphics verticalAlign="center">
            <img src={wes} width={48} height={48} alt="rubd" />
          </PureCell.Graphics>
          <PureCell.Content>
            <PureCell.Main>
              <Typography.Text view="primary-medium" tag="p" defaultMargins={false}>
                Накопления под защитой
              </Typography.Text>
              <Typography.Text view="primary-small" color="secondary">
                На сумму до 2 800 000 ₽
              </Typography.Text>
            </PureCell.Main>
          </PureCell.Content>
        </PureCell>

        <div className={appSt.box}>
          <div>
            <Typography.TitleResponsive tag="h2" view="medium" font="system" weight="medium">
              {total ? total.toLocaleString('ru') : 'X'} ₽
            </Typography.TitleResponsive>
            <Typography.Text view="primary-small" color="secondary">
              Накопите к 2040 году при ежемесячном пополнении в 2000 ₽
            </Typography.Text>
          </div>

          <ButtonMobile
            onClick={openCalc}
            style={{ borderRadius: '8px' }}
            disabled={loading}
            block
            view="secondary"
            shape="rectangular"
          >
            Посчитать
          </ButtonMobile>
        </div>

        <Typography.TitleResponsive tag="h3" view="small" font="system" weight="medium">
          Как работает программа
        </Typography.TitleResponsive>

        <Steps isVerticalAlign interactive={false} className={appSt.stepStyle}>
          <span>
            <Typography.Text tag="p" defaultMargins={false} view="primary-medium">
              Вносите от 2000 ₽ год
            </Typography.Text>
            <Typography.Text view="primary-small" color="secondary">
              Для удобства можно подключить автоплатёж
            </Typography.Text>
          </span>
          <span>
            <Typography.Text tag="p" defaultMargins={false} view="primary-medium">
              Государство добавляет до 36 000 ₽ в год и возвращает налоговый вычет до 88 000 ₽
            </Typography.Text>
            <Typography.Text view="primary-small" color="secondary">
              Гос.поддержку можно получать до 10 лет, а налоговый вычет — минимум 15 лет
            </Typography.Text>
          </span>
          <span>
            <Typography.Text tag="p" defaultMargins={false} view="primary-medium">
              Фонд инвестирует деньги и начисляет доход ежегодно
            </Typography.Text>
            <Typography.Text
              view="primary-small"
              color="secondary"
              onClick={() => {
                window.location.replace('alfabank://longread?endpoint=v1/adviser/longreads/46688');
              }}
              style={{
                color: '#2A77EF',
                cursor: 'pointer',
              }}
            >
              Посмотреть доходы за 2024 год
            </Typography.Text>
          </span>
        </Steps>

        <Typography.TitleResponsive tag="h3" view="small" font="system" weight="medium">
          Частые вопросы
        </Typography.TitleResponsive>
        <div style={{ marginTop: '1rem' }}>
          <div
            onClick={() => {
              window.gtag('event', '4581_FAQ1_var1');
              setCollapsedItem(items => (items.includes('1') ? items.filter(item => item !== '1') : [...items, '1']));
            }}
            className={appSt.row}
          >
            <Typography.Text view="primary-medium" weight="medium">
              Какую сумму нужно внести при оформлении договора?
            </Typography.Text>
            {collapsedItems.includes('1') ? <ChevronUpMIcon color="#898991" /> : <ChevronDownMIcon color="#898991" />}
          </div>
          <Collapse expanded={collapsedItems.includes('1')}>
            <Typography.Text view="primary-medium">Первый и последующие взносы — от 2 000 ₽.</Typography.Text>
          </Collapse>
        </div>
        <div style={{ marginTop: '1rem' }}>
          <div
            onClick={() => {
              window.gtag('event', '4581_FAQ2_var1');
              setCollapsedItem(items => (items.includes('2') ? items.filter(item => item !== '2') : [...items, '2']));
            }}
            className={appSt.row}
          >
            <Typography.Text view="primary-medium" weight="medium">
              Как получить до 360 000 ₽ от государства?
            </Typography.Text>
            {collapsedItems.includes('2') ? <ChevronUpMIcon color="#898991" /> : <ChevronDownMIcon color="#898991" />}
          </div>
          <Collapse expanded={collapsedItems.includes('2')}>
            <Typography.Text view="primary-medium">
              Господдержка предоставляется в течение 10 лет после внесения первого взноса, если сумма взносов за год не
              меньше 2 000 ₽. Сумма господдержки зависит от размера ваших взносов и ежемесячного дохода, но не превышает 36
              000 ₽ в год.
            </Typography.Text>
          </Collapse>
        </div>
        <div style={{ marginTop: '1rem' }}>
          <div
            onClick={() => {
              window.gtag('event', '4581_FAQ3_var1');

              setCollapsedItem(items => (items.includes('3') ? items.filter(item => item !== '3') : [...items, '3']));
            }}
            className={appSt.row}
          >
            <Typography.Text view="primary-medium" weight="medium">
              Когда выплачиваются накопления?
            </Typography.Text>
            {collapsedItems.includes('3') ? <ChevronUpMIcon color="#898991" /> : <ChevronDownMIcon color="#898991" />}
          </div>
          <Collapse expanded={collapsedItems.includes('3')}>
            <Typography.Text view="primary-medium">
              Через 15 лет или по достижении возраста 55 лет для женщин и 60 лет для мужчин.
            </Typography.Text>
          </Collapse>
        </div>
        <div style={{ marginTop: '1rem' }}>
          <div
            onClick={() => {
              window.gtag('event', '4581_FAQ4_var1');

              setCollapsedItem(items => (items.includes('4') ? items.filter(item => item !== '4') : [...items, '4']));
            }}
            className={appSt.row}
          >
            <Typography.Text view="primary-medium" weight="medium">
              Смогу забрать деньги раньше?
            </Typography.Text>
            {collapsedItems.includes('4') ? <ChevronUpMIcon color="#898991" /> : <ChevronDownMIcon color="#898991" />}
          </div>
          <Collapse expanded={collapsedItems.includes('4')}>
            <Typography.Text view="primary-medium">
              Да, но при получении выкупной суммы в первые несколько лет действия договора сумма выплачивается не в полном
              объёме — действует понижающий коэффициент.
            </Typography.Text>
          </Collapse>
        </div>

        <div
          onClick={() => {
            window.gtag('event', '4581_moreinfo_var1');
            window.location.replace('https://alfa-npf.ru/');
          }}
          className={appSt.row}
          style={{ marginTop: '1rem' }}
        >
          <Typography.Text view="primary-medium">Подробные условия</Typography.Text>

          <OutsideMIcon color="#898991" />
        </div>
      </div>
      <Gap size={96} />

      <div className={appSt.bottomBtn}>
        <ButtonMobile loading={loading} block view="primary" onClick={submit}>
          К оформлению
        </ButtonMobile>
      </div>

      <BottomSheet
        title={
          <Typography.Title tag="h2" view="small" font="system" weight="semibold">
            Калькулятор накоплений
          </Typography.Title>
        }
        open={openBs}
        onClose={closeCalc}
        titleAlign="left"
        stickyHeader
        hasCloser
        contentClassName={appSt.btmContent}
        actionButton={
          <ButtonMobile block view="primary" onClick={closeCalc}>
            Понятно
          </ButtonMobile>
        }
      >
        <div className={appSt.container}>
          <div>
            <Typography.Text view="primary-small" color="secondary" tag="p" defaultMargins={false}>
              Ежемесячный доход
            </Typography.Text>

            <Swiper spaceBetween={12} slidesPerView="auto" style={{ marginTop: '12px' }}>
              {chipsIncome.map(chip => (
                <SwiperSlide key={chip.value} className={appSt.swSlide}>
                  <Tag
                    view="filled"
                    size="xxs"
                    shape="rectangular"
                    checked={calcData.incomeValue === chip.value}
                    onClick={() => setCalcData({ ...calcData, incomeValue: chip.value })}
                  >
                    {chip.title}
                  </Tag>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          <Input
            hint="От 2 000 ₽"
            type="number"
            label="Первоначальный взнос"
            labelView="outer"
            block
            placeholder="72 000 ₽"
            value={calcData.firstDeposit.toString()}
            onChange={e => setCalcData({ ...calcData, firstDeposit: Number(e.target.value) })}
            onBlur={handleBlurInputCalc1}
            pattern="[0-9]*"
          />
          <Input
            type="number"
            label="Ежемесячное пополнение"
            labelView="outer"
            block
            placeholder="6000 ₽"
            value={calcData.monthlyDeposit.toString()}
            onChange={e => setCalcData({ ...calcData, monthlyDeposit: Number(e.target.value) })}
            onBlur={handleBlurInputCalc2}
            pattern="[0-9]*"
          />

          <Checkbox
            block={true}
            size={24}
            label="Инвестировать налоговый вычет в программу"
            checked={calcData.taxInvest}
            onChange={() => setCalcData({ ...calcData, taxInvest: !calcData.taxInvest })}
          />

          <div className={appSt.box}>
            <div style={{ marginBottom: '15px' }}>
              <Typography.TitleResponsive tag="h3" view="medium" font="system" weight="semibold">
                {total.toLocaleString('ru')} ₽
              </Typography.TitleResponsive>

              <Typography.Text view="primary-small" color="secondary">
                Накопите к 2040 году
              </Typography.Text>
            </div>

            <div className={appSt.btmRowCalc}>
              <Typography.Text view="secondary-large" color="secondary">
                Доход от инвестиций
              </Typography.Text>
              <Typography.Text view="primary-small">{investmentsIncome.toLocaleString('ru')} ₽</Typography.Text>
            </div>
            <div className={appSt.btmRowCalc}>
              <Typography.Text view="secondary-large" color="secondary">
                Государство добавит
              </Typography.Text>
              <Typography.Text view="primary-small">{govCharity.toLocaleString('ru')} ₽</Typography.Text>
            </div>
            {calcData.taxInvest && (
              <div className={appSt.btmRowCalc}>
                <Typography.Text view="secondary-large" color="secondary">
                  Налоговые вычеты добавят
                </Typography.Text>
                <Typography.Text view="primary-small">{taxRefund.toLocaleString('ru')} ₽</Typography.Text>
              </div>
            )}
            <div className={appSt.btmRowCalc}>
              <Typography.Text view="secondary-large" color="secondary">
                Взносы за 15 лет
              </Typography.Text>
              <Typography.Text view="primary-small">{deposit15years.toLocaleString('ru')} ₽</Typography.Text>
            </div>
          </div>
        </div>
      </BottomSheet>
    </>
  );
};
