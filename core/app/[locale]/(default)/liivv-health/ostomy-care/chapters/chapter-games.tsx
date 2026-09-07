'use client';

import { useTranslations } from 'next-intl';
import { type ReactNode, useMemo, useState } from 'react';

import { Image } from '~/components/image';

import oliviaOstomy from '~/components/onboarding/olivia-variants/ostomy.png';

import type { GameId } from './lessons-meta';

type Bucket = string;

interface SortItem {
  id: string;
  bucket: Bucket;
}

function OliviaHost({
  title,
  prompt,
  practice,
}: {
  title: string;
  prompt: string;
  practice: string;
}) {
  return (
    <header className="oc-ch-game-host">
      <Image alt="" className="oc-ch-game-olivia" height={64} src={oliviaOstomy} width={64} />
      <div>
        <p className="oc-ch-game-kicker">{title}</p>
        <h4 className="oc-ch-game-prompt">{prompt}</h4>
        <p className="oc-ch-game-practice">{practice}</p>
      </div>
    </header>
  );
}

function GameChrome({
  title,
  prompt,
  children,
  done,
  onReset,
}: {
  title: string;
  prompt: string;
  children: ReactNode;
  done: boolean;
  onReset: () => void;
}) {
  const t = useTranslations('OstomyCare.ui.chapter.learn');
  const [skipped, setSkipped] = useState(false);

  if (skipped) {
    return (
      <aside className="oc-ch-game is-skipped">
        <p>{t('skipped')}</p>
        <button className="oc-ch-game-textbtn" onClick={() => setSkipped(false)} type="button">
          {t('playAnyway')}
        </button>
      </aside>
    );
  }

  return (
    <aside className="oc-ch-game">
      <OliviaHost practice={t('practice')} prompt={prompt} title={title} />
      {children}
      <div className="oc-ch-game-foot">
        {done ? (
          <>
            <p className="oc-ch-game-done">{t('done')}</p>
            <button className="oc-ch-game-textbtn" onClick={onReset} type="button">
              {t('playAgain')}
            </button>
          </>
        ) : (
          <button className="oc-ch-game-textbtn" onClick={() => setSkipped(true)} type="button">
            {t('skip')}
          </button>
        )}
      </div>
    </aside>
  );
}

function SortGame({
  title,
  prompt,
  buckets,
  items,
  labels,
}: {
  title: string;
  prompt: string;
  buckets: Array<{ id: Bucket; label: string }>;
  items: SortItem[];
  labels: Record<string, string>;
}) {
  const t = useTranslations('OstomyCare.ui.chapter.learn');
  const [placed, setPlaced] = useState<Record<string, Bucket>>({});
  const [active, setActive] = useState<string | null>(null);
  const [wrong, setWrong] = useState<string | null>(null);

  const remaining = items.filter((item) => !placed[item.id]);
  const done = remaining.length === 0;

  function assign(itemId: string, bucket: Bucket) {
    const item = items.find((entry) => entry.id === itemId);

    if (!item) return;

    if (item.bucket !== bucket) {
      setWrong(itemId);
      return;
    }

    setWrong(null);
    setPlaced((prev) => ({ ...prev, [itemId]: bucket }));
    setActive(null);
  }

  return (
    <GameChrome
      done={done}
      onReset={() => {
        setPlaced({});
        setActive(null);
        setWrong(null);
      }}
      prompt={prompt}
      title={title}
    >
      <div className="oc-ch-game-pool">
        {remaining.map((item) => (
          <button
            aria-pressed={active === item.id}
            className={`oc-ch-game-chip${active === item.id ? 'is-active' : ''}${wrong === item.id ? 'is-wrong' : ''}`}
            key={item.id}
            onClick={() => {
              setWrong(null);
              setActive(item.id === active ? null : item.id);
            }}
            type="button"
          >
            {labels[item.id]}
          </button>
        ))}
      </div>
      {wrong ? <p className="oc-ch-game-hint">{t('almost')}</p> : null}
      <div className="oc-ch-game-buckets">
        {buckets.map((bucket) => (
          <div className="oc-ch-game-bucket" key={bucket.id}>
            <p>{bucket.label}</p>
            <ul>
              {items
                .filter((item) => placed[item.id] === bucket.id)
                .map((item) => (
                  <li key={item.id}>{labels[item.id]}</li>
                ))}
            </ul>
            <button
              className="oc-ch-game-drop"
              disabled={!active}
              onClick={() => active && assign(active, bucket.id)}
              type="button"
            >
              {active ? t('putHere') : t('pickOneFirst')}
            </button>
          </div>
        ))}
      </div>
    </GameChrome>
  );
}

function QuizGame({
  title,
  prompt,
  rounds,
  roundText,
  optionText,
}: {
  title: string;
  prompt: string;
  rounds: Array<{ id: string; options: Array<{ id: string; correct?: boolean }> }>;
  roundText: Record<string, string>;
  optionText: Record<string, string>;
}) {
  const t = useTranslations('OstomyCare.ui.chapter.learn');
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const round = rounds[index];
  const done = index >= rounds.length;

  if (!round && !done) return null;

  const correct = round?.options.find((option) => option.correct)?.id;
  const gotIt = picked !== null && picked === correct;

  return (
    <GameChrome
      done={done}
      onReset={() => {
        setIndex(0);
        setPicked(null);
      }}
      prompt={prompt}
      title={title}
    >
      {done || !round ? null : (
        <>
          <p className="oc-ch-game-round">
            {roundText[round.id]}
            <span>
              {index + 1}/{rounds.length}
            </span>
          </p>
          <div className="oc-ch-game-options">
            {round.options.map((option) => {
              let state = '';

              if (picked !== null && option.id === correct) {
                state = ' is-right';
              } else if (picked === option.id) {
                state = ' is-wrong';
              }

              return (
                <button
                  className={`oc-ch-game-option${state}`}
                  disabled={picked !== null}
                  key={option.id}
                  onClick={() => setPicked(option.id)}
                  type="button"
                >
                  {optionText[option.id]}
                </button>
              );
            })}
          </div>
          {picked && !gotIt ? <p className="oc-ch-game-hint">{t('almost')}</p> : null}
          {gotIt ? (
            <button
              className="oc-ch-game-next"
              onClick={() => {
                setPicked(null);
                setIndex((prev) => prev + 1);
              }}
              type="button"
            >
              {index + 1 === rounds.length ? t('finish') : t('nextRound')}
            </button>
          ) : null}
        </>
      )}
    </GameChrome>
  );
}

function MemoryGame({
  title,
  prompt,
  pairs,
}: {
  title: string;
  prompt: string;
  pairs: Array<{ id: string; a: string; b: string }>;
}) {
  const t = useTranslations('OstomyCare.ui.chapter.learn');
  const tiles = useMemo(() => {
    const list = pairs.flatMap((pair) => [
      { key: `${pair.id}-a`, pair: pair.id, text: pair.a },
      { key: `${pair.id}-b`, pair: pair.id, text: pair.b },
    ]);
    const order = [3, 0, 5, 2, 7, 1, 6, 4];

    return order.map((slot) => list[slot]).filter((tile) => tile !== undefined);
  }, [pairs]);
  const [open, setOpen] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [wrong, setWrong] = useState(false);
  const done = matched.length === pairs.length;

  function flip(key: string) {
    if (matched.some((id) => key.startsWith(id)) || open.includes(key) || open.length === 2) return;

    const next = [...open, key];
    setOpen(next);
    setWrong(false);

    if (next.length < 2) return;

    const [first, second] = next;
    const left = tiles.find((tile) => tile.key === first);
    const right = tiles.find((tile) => tile.key === second);

    if (left && right && left.pair === right.pair) {
      setMatched((prev) => [...prev, left.pair]);
      setOpen([]);
      return;
    }

    setWrong(true);
    setTimeout(() => setOpen([]), 700);
  }

  return (
    <GameChrome
      done={done}
      onReset={() => {
        setOpen([]);
        setMatched([]);
        setWrong(false);
      }}
      prompt={prompt}
      title={title}
    >
      <div className="oc-ch-game-memory">
        {tiles.map((tile) => {
          const isMatched = matched.includes(tile.pair);
          const isOpen = isMatched || open.includes(tile.key);

          return (
            <button
              className={`oc-ch-game-card${isOpen ? 'is-open' : ''}${isMatched ? 'is-matched' : ''}`}
              key={tile.key}
              onClick={() => flip(tile.key)}
              type="button"
            >
              {isOpen ? tile.text : '?'}
            </button>
          );
        })}
      </div>
      {wrong ? <p className="oc-ch-game-hint">{t('almost')}</p> : null}
    </GameChrome>
  );
}

function PackGame({
  title,
  prompt,
  bagLabel,
  needed,
  extras,
  labels,
  oops,
}: {
  title: string;
  prompt: string;
  bagLabel: string;
  needed: string[];
  extras: string[];
  labels: Record<string, string>;
  oops: Record<string, string>;
}) {
  const t = useTranslations('OstomyCare.ui.chapter.learn');
  const [inBag, setInBag] = useState<string[]>([]);
  const [mistake, setMistake] = useState<string | null>(null);
  const done = needed.every((id) => inBag.includes(id)) && inBag.every((id) => needed.includes(id));

  function toggle(id: string) {
    if (needed.includes(id)) {
      setMistake(null);
      setInBag((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
      return;
    }

    setMistake(id);
  }

  return (
    <GameChrome
      done={done}
      onReset={() => {
        setInBag([]);
        setMistake(null);
      }}
      prompt={prompt}
      title={title}
    >
      <div className="oc-ch-game-pack">
        <div className="oc-ch-game-shelf">
          {[...needed, ...extras].map((id) => (
            <button
              aria-pressed={inBag.includes(id)}
              className={`oc-ch-game-chip${inBag.includes(id) ? 'is-active' : ''}${mistake === id ? 'is-wrong' : ''}`}
              key={id}
              onClick={() => toggle(id)}
              type="button"
            >
              {labels[id]}
            </button>
          ))}
        </div>
        <div className="oc-ch-game-bag">
          <p>{bagLabel}</p>
          <ul>
            {inBag.map((id) => (
              <li key={id}>{labels[id]}</li>
            ))}
          </ul>
        </div>
      </div>
      {mistake ? <p className="oc-ch-game-hint">{oops[mistake]}</p> : null}
      {inBag.length > 0 && !done ? <p className="oc-ch-game-hint">{t('keepGoing')}</p> : null}
    </GameChrome>
  );
}

function BeforeAfterGame() {
  const g = useTranslations('OstomyCare.ui.chapter.games.beforeAfter');

  return (
    <SortGame
      buckets={[
        { id: 'before', label: g('before') },
        { id: 'after', label: g('after') },
      ]}
      items={[
        { id: 'siting', bucket: 'before' },
        { id: 'questions', bucket: 'before' },
        { id: 'pack', bucket: 'before' },
        { id: 'fatigue', bucket: 'after' },
        { id: 'measure', bucket: 'after' },
        { id: 'gobag', bucket: 'after' },
      ]}
      labels={{
        siting: g('items.siting'),
        questions: g('items.questions'),
        pack: g('items.pack'),
        fatigue: g('items.fatigue'),
        measure: g('items.measure'),
        gobag: g('items.gobag'),
      }}
      prompt={g('prompt')}
      title={g('title')}
    />
  );
}

function GoBagGame() {
  const g = useTranslations('OstomyCare.ui.chapter.games.goBag');

  return (
    <PackGame
      bagLabel={g('bag')}
      extras={['dryer', 'lotion']}
      labels={{
        barrier: g('items.barrier'),
        pouch: g('items.pouch'),
        wipes: g('items.wipes'),
        disposal: g('items.disposal'),
        underwear: g('items.underwear'),
        dryer: g('items.dryer'),
        lotion: g('items.lotion'),
      }}
      needed={['barrier', 'pouch', 'wipes', 'disposal', 'underwear']}
      oops={{
        dryer: g('oops.dryer'),
        lotion: g('oops.lotion'),
      }}
      prompt={g('prompt')}
      title={g('title')}
    />
  );
}

function WhichStomaGame() {
  const g = useTranslations('OstomyCare.ui.chapter.games.whichStoma');

  return (
    <QuizGame
      optionText={{
        colostomy: g('options.colostomy'),
        ileostomy: g('options.ileostomy'),
        urostomy: g('options.urostomy'),
      }}
      prompt={g('prompt')}
      roundText={{
        thicker: g('rounds.thicker'),
        fluid: g('rounds.fluid'),
        urine: g('rounds.urine'),
      }}
      rounds={[
        {
          id: 'thicker',
          options: [{ id: 'colostomy', correct: true }, { id: 'ileostomy' }, { id: 'urostomy' }],
        },
        {
          id: 'fluid',
          options: [{ id: 'colostomy' }, { id: 'ileostomy', correct: true }, { id: 'urostomy' }],
        },
        {
          id: 'urine',
          options: [{ id: 'colostomy' }, { id: 'ileostomy' }, { id: 'urostomy', correct: true }],
        },
      ]}
      title={g('title')}
    />
  );
}

function WordMatchGame() {
  const g = useTranslations('OstomyCare.ui.chapter.games.wordMatch');

  return (
    <MemoryGame
      pairs={[
        { id: 'barrier', a: g('barrierA'), b: g('barrierB') },
        { id: 'pouch', a: g('pouchA'), b: g('pouchB') },
        { id: 'output', a: g('outputA'), b: g('outputB') },
        { id: 'nswoc', a: g('nswocA'), b: g('nswocB') },
      ]}
      prompt={g('prompt')}
      title={g('title')}
    />
  );
}

function BuildSystemGame() {
  const g = useTranslations('OstomyCare.ui.chapter.games.buildSystem');

  return (
    <QuizGame
      optionText={{
        barrier: g('options.barrier'),
        pouch: g('options.pouch'),
        filter: g('options.filter'),
        stays: g('options.stays'),
        bothGo: g('options.bothGo'),
        pouchStays: g('options.pouchStays'),
        joined: g('options.joined'),
        clicks: g('options.clicks'),
        noBarrier: g('options.noBarrier'),
      }}
      prompt={g('prompt')}
      roundText={{
        skin: g('rounds.skin'),
        lands: g('rounds.lands'),
        twoPiece: g('rounds.twoPiece'),
        onePiece: g('rounds.onePiece'),
      }}
      rounds={[
        {
          id: 'skin',
          options: [{ id: 'barrier', correct: true }, { id: 'pouch' }, { id: 'filter' }],
        },
        {
          id: 'lands',
          options: [{ id: 'barrier' }, { id: 'pouch', correct: true }, { id: 'filter' }],
        },
        {
          id: 'twoPiece',
          options: [{ id: 'stays', correct: true }, { id: 'bothGo' }, { id: 'pouchStays' }],
        },
        {
          id: 'onePiece',
          options: [{ id: 'joined', correct: true }, { id: 'clicks' }, { id: 'noBarrier' }],
        },
      ]}
      title={g('title')}
    />
  );
}

function MeasureFitGame() {
  const g = useTranslations('OstomyCare.ui.chapter.games.measureFit');

  return (
    <QuizGame
      optionText={{
        large: g('options.large'),
        close: g('options.close'),
        small: g('options.small'),
        once: g('options.once'),
        months: g('options.months'),
        never: g('options.never'),
      }}
      prompt={g('prompt')}
      roundText={{
        protect: g('rounds.protect'),
        when: g('rounds.when'),
      }}
      rounds={[
        {
          id: 'protect',
          options: [{ id: 'large' }, { id: 'close', correct: true }, { id: 'small' }],
        },
        {
          id: 'when',
          options: [{ id: 'once' }, { id: 'months', correct: true }, { id: 'never' }],
        },
      ]}
      title={g('title')}
    />
  );
}

function AccessoryJobsGame() {
  const g = useTranslations('OstomyCare.ui.chapter.games.accessoryJobs');

  return (
    <QuizGame
      optionText={{
        ring: g('options.ring'),
        powder: g('options.powder'),
        dryer: g('options.dryer'),
        lotion: g('options.lotion'),
        paste: g('options.paste'),
        remover: g('options.remover'),
      }}
      prompt={g('prompt')}
      roundText={{
        dip: g('rounds.dip'),
        weepy: g('rounds.weepy'),
        peel: g('rounds.peel'),
      }}
      rounds={[
        {
          id: 'dip',
          options: [{ id: 'ring', correct: true }, { id: 'powder' }, { id: 'dryer' }],
        },
        {
          id: 'weepy',
          options: [{ id: 'ring' }, { id: 'powder', correct: true }, { id: 'lotion' }],
        },
        {
          id: 'peel',
          options: [{ id: 'paste' }, { id: 'remover', correct: true }, { id: 'powder' }],
        },
      ]}
      title={g('title')}
    />
  );
}

function CarryOnGame() {
  const g = useTranslations('OstomyCare.ui.chapter.games.carryOnOrHold');

  return (
    <SortGame
      buckets={[
        { id: 'carry', label: g('carry') },
        { id: 'hold', label: g('hold') },
      ]}
      items={[
        { id: 'daysupply', bucket: 'carry' },
        { id: 'certificate', bucket: 'carry' },
        { id: 'precut', bucket: 'carry' },
        { id: 'backup', bucket: 'hold' },
        { id: 'fullpaste', bucket: 'hold' },
      ]}
      labels={{
        daysupply: g('items.daysupply'),
        certificate: g('items.certificate'),
        precut: g('items.precut'),
        backup: g('items.backup'),
        fullpaste: g('items.fullpaste'),
      }}
      prompt={g('prompt')}
      title={g('title')}
    />
  );
}

function WhyStickingGame() {
  const g = useTranslations('OstomyCare.ui.chapter.games.whyStoppedSticking');

  return (
    <QuizGame
      optionText={{
        skinfail: g('options.skinfail'),
        coldcar: g('options.coldcar'),
        wrongbrand: g('options.wrongbrand'),
      }}
      prompt={g('prompt')}
      roundText={{
        winter: g('rounds.winter'),
      }}
      rounds={[
        {
          id: 'winter',
          options: [{ id: 'skinfail' }, { id: 'coldcar', correct: true }, { id: 'wrongbrand' }],
        },
      ]}
      title={g('title')}
    />
  );
}

function WhoDoIAskGame() {
  const g = useTranslations('OstomyCare.ui.chapter.games.whoDoIAsk');

  return (
    <QuizGame
      optionText={{
        nswoc: g('options.nswoc'),
        pharmacist: g('options.pharmacist'),
        peer: g('options.peer'),
        dietitian: g('options.dietitian'),
      }}
      prompt={g('prompt')}
      roundText={{
        leaks: g('rounds.leaks'),
        wipe: g('rounds.wipe'),
        foods: g('rounds.foods'),
        talk: g('rounds.talk'),
      }}
      rounds={[
        {
          id: 'leaks',
          options: [{ id: 'nswoc', correct: true }, { id: 'pharmacist' }, { id: 'peer' }],
        },
        {
          id: 'wipe',
          options: [{ id: 'nswoc' }, { id: 'pharmacist', correct: true }, { id: 'dietitian' }],
        },
        {
          id: 'foods',
          options: [{ id: 'peer' }, { id: 'dietitian', correct: true }, { id: 'pharmacist' }],
        },
        {
          id: 'talk',
          options: [{ id: 'peer', correct: true }, { id: 'pharmacist' }, { id: 'dietitian' }],
        },
      ]}
      title={g('title')}
    />
  );
}

const GAMES: Record<GameId, () => ReactNode> = {
  beforeAfter: BeforeAfterGame,
  goBag: GoBagGame,
  whichStoma: WhichStomaGame,
  wordMatch: WordMatchGame,
  buildSystem: BuildSystemGame,
  measureFit: MeasureFitGame,
  accessoryJobs: AccessoryJobsGame,
  carryOnOrHold: CarryOnGame,
  whyStoppedSticking: WhyStickingGame,
  whoDoIAsk: WhoDoIAskGame,
};

export function ChapterGame({ id }: { id: GameId }) {
  const Game = GAMES[id];

  return <Game />;
}
