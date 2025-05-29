import { BottomSheet } from '@alfalab/core-components/bottom-sheet';
import { ButtonMobile } from '@alfalab/core-components/button/mobile';
import { Checkbox } from '@alfalab/core-components/checkbox';
import { Collapse } from '@alfalab/core-components/collapse';
import { Gap } from '@alfalab/core-components/gap';
import { Input } from '@alfalab/core-components/input';
import { List } from '@alfalab/core-components/list';
import { PureCell } from '@alfalab/core-components/pure-cell';
import { Steps } from '@alfalab/core-components/steps';
import { Tag } from '@alfalab/core-components/tag';
import { Typography } from '@alfalab/core-components/typography';
import { CheckmarkMIcon } from '@alfalab/icons-glyph/CheckmarkMIcon';
import { ChevronDownMIcon } from '@alfalab/icons-glyph/ChevronDownMIcon';
import { ChevronUpMIcon } from '@alfalab/icons-glyph/ChevronUpMIcon';
import { OutsideMIcon } from '@alfalab/icons-glyph/OutsideMIcon';
import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import hb from './assets/hb.png';
import img1 from './assets/img1.png';
import img2 from './assets/img2.png';
import img3 from './assets/img3.png';
import img4 from './assets/img4.png';
import pds from './assets/pds.png';
import pers from './assets/pers.png';
import piec from './assets/piec.png';
import rubd from './assets/rubd.png';
import wes from './assets/wes.png';
import { LS, LSKeys } from './ls';
import { appSt } from './style.css';
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

const checks = [
  'Застрахованы на сумму до 2,8 млн ₽ в Агентстве по страхованию вкладов',
  'Полностью наследуются на этапе накопления или выплат (кроме назначения пожизненной выплаты)',
  'Не делятся при разводе, на них не может быть наложено взыскание и арест',
  'Негосударственный пенсионный фонд (НПФ) гарантирует безубыточность вложений на горизонте каждых пяти лет',
];

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
    window.gtag('event', '5274_confirm_var1');
    setLoading(true);

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
    window.gtag('event', '5274_calc_var1');
    setOpenBs(true);
  };

  const closeCalc = () => {
    setOpenBs(false);
    sendDataToGACalc({
      calc: `${calcData.incomeValue},${calcData.firstDeposit},${calcData.monthlyDeposit},${calcData.taxInvest ? 'T' : 'F'}`,
    });
  };

  return (
    <>
      <div className={appSt.container}>
        <div className={appSt.imgBox}>
          <Typography.TitleResponsive style={{ maxWidth: '311px' }} tag="h1" view="medium" font="system" weight="bold">
            Создайте начальный капитал для детей
          </Typography.TitleResponsive>
          <Typography.Text style={{ maxWidth: '311px' }}>Программа долгосрочных сбережений</Typography.Text>
          <img src={hb} alt="hb" width="100%" height={114} className={appSt.img} />

          <div className={appSt.imgSubBox}>
            <Typography.Text>
              Более 1 млн семей
              <br />
              за 2024 оформили ПДС
            </Typography.Text>
          </div>
        </div>

        <div>
          <Typography.TitleResponsive tag="h2" view="small" font="system" weight="medium" style={{ marginBottom: '.5rem' }}>
            Описание программы:
          </Typography.TitleResponsive>
          <Typography.Text view="primary-medium">
            Программа долгосрочных сбережений (ПДС) – это удобный способ накопить средства для будущего ваших детей.
          </Typography.Text>
        </div>

        <Typography.TitleResponsive style={{ marginTop: '1rem' }} tag="h2" view="small" font="system" weight="medium">
          Копите на любые цели
        </Typography.TitleResponsive>

        <PureCell className={appSt.blueBox}>
          <PureCell.Content>
            <PureCell.Main>
              <Typography.Text view="primary-small" tag="p" weight="bold" defaultMargins={false}>
                Высшее образование
              </Typography.Text>
              <Typography.Text view="component-secondary" color="secondary">
                Позаботьтесь о платном обучении ребенка в ВУЗе
              </Typography.Text>
            </PureCell.Main>
          </PureCell.Content>
          <PureCell.Graphics verticalAlign="center">
            <img src={img1} width={115} height={72} alt="img1" className={appSt.blueBoxImg} />
          </PureCell.Graphics>
        </PureCell>

        <PureCell className={appSt.blueBox}>
          <PureCell.Content>
            <PureCell.Main>
              <Typography.Text view="primary-small" tag="p" weight="bold" defaultMargins={false}>
                Стартовый капитал
              </Typography.Text>
              <Typography.Text view="component-secondary" color="secondary">
                Ваши инвестиции — основа бизнеса ребенка завтра
              </Typography.Text>
            </PureCell.Main>
          </PureCell.Content>
          <PureCell.Graphics verticalAlign="center">
            <img src={img2} width={115} height={72} alt="img2" className={appSt.blueBoxImg} />
          </PureCell.Graphics>
        </PureCell>

        <PureCell className={appSt.blueBox}>
          <PureCell.Content>
            <PureCell.Main>
              <Typography.Text view="primary-small" tag="p" weight="bold" defaultMargins={false}>
                Своя квартира
              </Typography.Text>
              <Typography.Text view="component-secondary" color="secondary">
                Помогите сформировать первоначальный взнос
              </Typography.Text>
            </PureCell.Main>
          </PureCell.Content>
          <PureCell.Graphics verticalAlign="center">
            <img src={img3} width={115} height={72} alt="img3" className={appSt.blueBoxImg} />
          </PureCell.Graphics>
        </PureCell>

        <PureCell className={appSt.blueBox}>
          <PureCell.Content>
            <PureCell.Main>
              <Typography.Text view="primary-small" tag="p" weight="bold" defaultMargins={false}>
                Свадьба
              </Typography.Text>
              <Typography.Text view="component-secondary" color="secondary">
                Организайте ребенку достойный праздник
              </Typography.Text>
            </PureCell.Main>
          </PureCell.Content>
          <PureCell.Graphics verticalAlign="center">
            <img src={img4} width={115} height={72} alt="img4" className={appSt.blueBoxImg} />
          </PureCell.Graphics>
        </PureCell>

        <Typography.TitleResponsive style={{ marginTop: '1rem' }} tag="h2" view="small" font="system" weight="medium">
          Плюсы программы:
        </Typography.TitleResponsive>

        <PureCell>
          <PureCell.Graphics verticalAlign="center">
            <img src={rubd} width={48} height={48} alt="rubd" />
          </PureCell.Graphics>
          <PureCell.Content>
            <PureCell.Main>
              <Typography.Text view="primary-medium" tag="p" defaultMargins={false}>
                До 360 000 ₽
              </Typography.Text>
              <Typography.Text view="primary-small" color="secondary">
                Добавит государство — как на счёт взрослого, так и ребёнка
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
                До 1 320 000 ₽
              </Typography.Text>
              <Typography.Text view="primary-small" color="secondary">
                Счёт на ребёнка даёт право на увеличенный налоговый вычет
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
                21,56% годовых
              </Typography.Text>
              <Typography.Text view="primary-small" color="secondary">
                Инвестиционный доход за 2024 год
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
                Деньги под защитой
              </Typography.Text>
              <Typography.Text view="primary-small" color="secondary">
                Застрахованы на сумму до 2,8 млн ₽
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
              Накопите на семейных счетах к 2040 году при ежемесячном пополнении в 2000 ₽
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
              Государство добавляет до 36 000 ₽ в год на взрослый и детский счета и возвращает повышенный налоговый вычет
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
                window.gtag('event', '5274_income_var1');
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

        <PureCell className={appSt.blueBox}>
          <PureCell.Content>
            <PureCell.Main>
              <Typography.Text
                view="primary-small"
                weight="bold"
                tag="p"
                defaultMargins={false}
                style={{ marginBottom: '0.25rem' }}
              >
                Альфа-Вклад с ПДС
              </Typography.Text>
              <Typography.Text view="secondary-large">
                Получите повышенную ставку по вкладу с программой долгосрочных сбережений
              </Typography.Text>
            </PureCell.Main>
          </PureCell.Content>
          <PureCell.Graphics verticalAlign="center">
            <img src={pds} width={90} height={74} alt="pds" />
          </PureCell.Graphics>
        </PureCell>

        <div style={{ marginTop: '1rem' }}>
          <Typography.TitleResponsive tag="h3" view="small" font="system" weight="medium" style={{ marginBottom: '.5rem' }}>
            Деньги под защитой
          </Typography.TitleResponsive>
          {checks.map((check, index) => (
            <PureCell key={index} verticalPadding="compact">
              <PureCell.Graphics verticalAlign="center">
                <CheckmarkMIcon color="#0D9336" />
              </PureCell.Graphics>
              <PureCell.Content>
                <PureCell.Main>
                  <Typography.Text view="primary-medium">{check}</Typography.Text>
                </PureCell.Main>
              </PureCell.Content>
            </PureCell>
          ))}
        </div>

        <div style={{ marginTop: '1rem' }}>
          <Typography.TitleResponsive tag="h3" view="small" font="system" weight="medium" style={{ marginBottom: '1rem' }}>
            Какие бывают выплаты
          </Typography.TitleResponsive>

          <div className={appSt.blueBox2}>
            <Typography.TitleResponsive tag="h4" view="xsmall" font="system" weight="semibold">
              Единовременно
            </Typography.TitleResponsive>
            <List tag="ol" colorMarker="accent">
              <List.Item>
                <Typography.Text view="primary-small">Через 15 лет после того, как вступили в программу</Typography.Text>
              </List.Item>
              <List.Item>
                <Typography.Text view="primary-small">
                  При достижении 55 лет у женщин и 60 лет у мужчин, если с начала участия прошло менее 15 лет, а выплата —
                  менее 10% прожиточного минимума
                </Typography.Text>
              </List.Item>
            </List>
          </div>

          <Gap size={16} />

          <div className={appSt.blueBox2}>
            <Typography.TitleResponsive tag="h4" view="xsmall" font="system" weight="semibold">
              Регулярно
            </Typography.TitleResponsive>
            <Typography.Text view="primary-small">
              Все накопления делят на ежемесячные выплаты, период вы выбираете сами — от 5 лет:
            </Typography.Text>
            <Typography.Text view="primary-small">
              <b>Срочные.</b> Доступны через 15 лет после вступления в программу долгосрочных сбережений
            </Typography.Text>
            <Typography.Text view="primary-small">
              <b>Дополнительные выплаты на пенсии.</b> Доступны после 55 лет у женщин и 60 — у мужчин
            </Typography.Text>
          </div>
          <Gap size={16} />

          <div className={appSt.blueBox2}>
            <Typography.TitleResponsive tag="h4" view="xsmall" font="system" weight="semibold">
              Досрочно
            </Typography.TitleResponsive>
            <Typography.Text view="primary-small">
              Такая выплата доступна в случае потери кормильца или если необходимо оплатить{' '}
              <span
                style={{ textDecoration: 'underline' }}
                onClick={() => window.location.replace('http://publication.pravo.gov.ru/document/0001202312010067')}
              >
                дорогостоящее лечение
              </span>
            </Typography.Text>
          </div>
        </div>

        <Typography.TitleResponsive tag="h3" view="small" font="system" weight="medium" style={{ marginTop: '1rem' }}>
          Частые вопросы
        </Typography.TitleResponsive>
        <div style={{ marginTop: '1rem' }}>
          <div
            onClick={() => {
              window.gtag('event', '5274_FAQ1_var1');
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
              window.gtag('event', '5274_FAQ2_var1');
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
              window.gtag('event', '5274_FAQ3_var1');

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
              window.gtag('event', '5274_FAQ4_var1');

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
            window.gtag('event', '5274_moreinfo_var1');
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
