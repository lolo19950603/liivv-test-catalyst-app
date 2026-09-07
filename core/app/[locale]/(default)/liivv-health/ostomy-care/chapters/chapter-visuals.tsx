import type { ReactNode } from 'react';

import type { VisualId } from './lessons-meta';

const INK = '#312f2f';
const SAGE = '#8ea58d';
const SAGE_DEEP = '#5f735f';
const BLUSH = '#f3c7be';
const SAND = '#d7cfc7';
const TAUPE = '#a89c94';
const CREAM = '#f5f2ed';
const PAPER = '#fffdf9';

function Frame({
  id,
  title,
  children,
  viewBox = '0 0 720 300',
}: {
  id: string;
  title: string;
  children: ReactNode;
  viewBox?: string;
}) {
  const titleId = `${id}-title`;

  return (
    <figure className="oc-ch-visual">
      <svg aria-labelledby={titleId} role="img" viewBox={viewBox}>
        <title id={titleId}>{title}</title>
        <rect fill={CREAM} height={300} rx={18} width={720} />
        {children}
      </svg>
    </figure>
  );
}

function Label({ x, y, children }: { x: number; y: number; children: string }) {
  return (
    <text fill={INK} fontFamily="Georgia, serif" fontSize={13} textAnchor="middle" x={x} y={y}>
      {children}
    </text>
  );
}

function Caption({ x, y, children }: { x: number; y: number; children: string }) {
  return (
    <text
      fill={SAGE_DEEP}
      fontFamily="system-ui, sans-serif"
      fontSize={11}
      textAnchor="middle"
      x={x}
      y={y}
    >
      {children}
    </text>
  );
}

function Abdomen({ cx, cy, markY = 18 }: { cx: number; cy: number; markY?: number }) {
  return (
    <g>
      <ellipse cx={cx} cy={cy} fill={BLUSH} opacity={0.55} rx={44} ry={56} />
      <ellipse cx={cx} cy={cy} fill="none" rx={44} ry={56} stroke={INK} strokeOpacity={0.18} />
      <circle cx={cx} cy={cy + markY} fill={SAGE_DEEP} r={9} />
      <circle cx={cx} cy={cy + markY} fill={PAPER} r={4} />
    </g>
  );
}

function SitingVisual() {
  return (
    <Frame
      id="vis-siting"
      title="Stoma siting: the spot is marked while you sit, stand, and bend, clear of your waistband."
    >
      <Caption x={360} y={36}>
        Ask for this before surgery — marked while you are awake
      </Caption>
      {['Sit', 'Stand', 'Bend'].map((pose, i) => {
        const x = 130 + i * 200;

        return (
          <g key={pose}>
            <circle cx={x} cy={88} fill={SAND} r={18} />
            <rect fill={SAGE} height={70} opacity={0.85} rx={18} width={46} x={x - 23} y={104} />
            <line
              stroke={INK}
              strokeDasharray="4 4"
              strokeOpacity={0.4}
              x1={x - 50}
              x2={x + 50}
              y1={148}
              y2={148}
            />
            <circle cx={x + 8} cy={142} fill={SAGE_DEEP} r={7} />
            <Label x={x} y={210}>
              {pose}
            </Label>
            <Caption x={x} y={228}>
              {i === 2 ? 'Clear of waistband' : 'Check the fold'}
            </Caption>
          </g>
        );
      })}
      <Caption x={360} y={272}>
        The surgeon makes the final call — marking first still helps the seal later
      </Caption>
    </Frame>
  );
}

function ChangeRoutineVisual() {
  const steps = ['Gather', 'Remove', 'Clean & dry', 'Measure', 'Hold to seal'];

  return (
    <Frame
      id="vis-change"
      title="A pouch change in five stills: gather, remove gently, clean and dry, measure, hold to seal."
    >
      {steps.map((step, i) => {
        const x = 78 + i * 132;

        return (
          <g key={step}>
            <circle
              cx={x}
              cy={118}
              fill={i === 4 ? SAGE : PAPER}
              r={36}
              stroke={SAGE_DEEP}
              strokeWidth={2}
            />
            <text
              fill={i === 4 ? PAPER : SAGE_DEEP}
              fontFamily="Georgia, serif"
              fontSize={20}
              textAnchor="middle"
              x={x}
              y={126}
            >
              {String(i + 1)}
            </text>
            <Label x={x} y={182}>
              {step}
            </Label>
          </g>
        );
      })}
      <Caption x={360} y={230}>
        Never rip the barrier off — wet a cloth if it needs help letting go
      </Caption>
      <Caption x={360} y={252}>
        Body heat sets the seal. Hold it there for a minute.
      </Caption>
    </Frame>
  );
}

function StomaTypesVisual() {
  const types = [
    { name: 'Colostomy', note: 'Colon · usually thicker output', x: 130 },
    { name: 'Ileostomy', note: 'Small bowel · looser, more fluid', x: 360 },
    { name: 'Urostomy', note: 'Urine · fluid matters all day', x: 590 },
  ];

  return (
    <Frame
      id="vis-stoma-types"
      title="Three common stomas: colostomy, ileostomy, and urostomy, each with different output."
    >
      {types.map((type) => (
        <g key={type.name}>
          <Abdomen cx={type.x} cy={130} />
          <Label x={type.x} y={214}>
            {type.name}
          </Label>
          <Caption x={type.x} y={234}>
            {type.note}
          </Caption>
        </g>
      ))}
      <Caption x={360} y={272}>
        Other setups exist — they are in the detail below, not a test you have to pass
      </Caption>
    </Frame>
  );
}

function GlossaryVisual() {
  const cards = [
    { t: 'Barrier', s: 'The part that sticks' },
    { t: 'Pouch', s: 'Where output lands' },
    { t: 'Output', s: 'What comes out' },
    { t: 'NSWOC', s: 'The specialist nurse' },
  ];

  return (
    <Frame id="vis-glossary" title="Words you will hear: barrier, pouch, output, and NSWOC.">
      {cards.map((card, i) => {
        const x = 40 + (i % 4) * 170;
        const y = 58;

        return (
          <g key={card.t}>
            <rect fill={PAPER} height={160} rx={16} stroke={SAND} width={150} x={x} y={y} />
            <rect fill={SAGE} height={8} rx={4} width={40} x={x + 16} y={y + 20} />
            <text fill={INK} fontFamily="Georgia, serif" fontSize={18} x={x + 16} y={y + 64}>
              {card.t}
            </text>
            <text
              fill={SAGE_DEEP}
              fontFamily="system-ui, sans-serif"
              fontSize={12}
              x={x + 16}
              y={y + 92}
            >
              {card.s}
            </text>
          </g>
        );
      })}
    </Frame>
  );
}

function PouchingSystemVisual() {
  return (
    <Frame
      id="vis-system"
      title="A pouching system is a skin barrier plus a pouch. One-piece joins them; two-piece clicks apart."
    >
      <Label x={190} y={48}>
        One-piece
      </Label>
      <rect fill={SAGE} height={18} rx={6} width={120} x={130} y={78} />
      <path
        d="M160 96 v90 a40 36 0 0 0 80 0 v-90"
        fill={PAPER}
        stroke={SAGE_DEEP}
        strokeWidth={2}
      />
      <Caption x={190} y={230}>
        Barrier and pouch joined
      </Caption>
      <Caption x={190} y={248}>
        Lowest profile, simplest change
      </Caption>

      <line stroke={SAND} x1={360} x2={360} y1={50} y2={250} />

      <Label x={530} y={48}>
        Two-piece
      </Label>
      <rect fill={SAGE} height={18} rx={6} width={120} x={470} y={72} />
      <circle cx={530} cy={108} fill="none" r={22} stroke={SAGE_DEEP} strokeWidth={3} />
      <path
        d="M500 128 v70 a30 28 0 0 0 60 0 v-70"
        fill={PAPER}
        stroke={SAGE_DEEP}
        strokeWidth={2}
      />
      <Caption x={530} y={230}>
        Barrier stays; pouch clicks off
      </Caption>
      <Caption x={530} y={248}>
        Handy if you empty often
      </Caption>
    </Frame>
  );
}

function MeasuringVisual() {
  const opts = [
    { label: 'Too large', note: 'Skin meets output', gap: 16, ok: false },
    { label: 'Just right', note: 'Close to the edge', gap: 4, ok: true },
    { label: 'Too small', note: 'Can rub the stoma', gap: -6, ok: false },
  ];

  return (
    <Frame
      id="vis-measure"
      title="Cut the barrier opening close to the stoma edge — too large exposes skin, too small can injure."
    >
      {opts.map((opt, i) => {
        const x = 130 + i * 200;

        return (
          <g key={opt.label}>
            <circle cx={x} cy={128} fill={opt.ok ? SAGE : SAND} opacity={0.35} r={52} />
            <circle
              cx={x}
              cy={128}
              fill="none"
              r={36 + opt.gap}
              stroke={opt.ok ? SAGE_DEEP : INK}
              strokeWidth={3}
            />
            <circle cx={x} cy={128} fill={SAGE_DEEP} r={16} />
            <Label x={x} y={208}>
              {opt.label}
            </Label>
            <Caption x={x} y={228}>
              {opt.note}
            </Caption>
          </g>
        );
      })}
    </Frame>
  );
}

function ConvexityVisual() {
  return (
    <Frame
      id="vis-convex"
      title="A flat barrier suits most stomas that protrude. Convexity curves toward the skin and needs an assessment first."
    >
      <Label x={200} y={52}>
        Flat
      </Label>
      <path d="M120 150 h160" fill="none" stroke={SAGE_DEEP} strokeWidth={6} />
      <circle cx={200} cy={128} fill={SAGE_DEEP} r={14} />
      <Caption x={200} y={196}>
        Stoma sits up on even skin
      </Caption>
      <Caption x={200} y={216}>
        Most people start here
      </Caption>

      <Label x={520} y={52}>
        Convex
      </Label>
      <path d="M440 128 q80 56 160 0" fill="none" stroke={BLUSH} strokeWidth={6} />
      <circle cx={520} cy={150} fill={SAGE_DEEP} r={14} />
      <Caption x={520} y={196}>
        Curves toward the abdomen
      </Caption>
      <Caption x={520} y={216}>
        Ask before you switch
      </Caption>
    </Frame>
  );
}

function AccessoriesVisual() {
  const jobs = [
    { t: 'Ring', s: 'Fills a small dip' },
    { t: 'Paste', s: 'Fills a crease' },
    { t: 'Powder', s: 'Weepy skin only' },
    { t: 'Remover', s: 'Kinder peel' },
  ];

  return (
    <Frame
      id="vis-acc"
      title="Accessories have jobs: rings seal, paste fills, powder is for weepy skin, remover eases peel."
    >
      {jobs.map((job, i) => {
        const x = 90 + i * 160;

        return (
          <g key={job.t}>
            <circle cx={x} cy={120} fill={PAPER} r={42} stroke={SAGE} strokeWidth={3} />
            <Label x={x} y={126}>
              {job.t}
            </Label>
            <Caption x={x} y={188}>
              {job.s}
            </Caption>
          </g>
        );
      })}
      <Caption x={360} y={240}>
        None of these rescue a barrier that is the wrong size or shape
      </Caption>
    </Frame>
  );
}

function NotRightVisual() {
  const signs = ['A new leak', 'Skin not healing', 'Output jumps', 'A new bulge'];

  return (
    <Frame
      id="vis-not-right"
      title="When something is not right: leaks, skin that will not heal, a jump in output, or a new bulge — call your NSWOC."
    >
      {signs.map((sign, i) => {
        const x = 90 + (i % 4) * 175;
        const y = 90;

        return (
          <g key={sign}>
            <rect
              fill={PAPER}
              height={88}
              rx={14}
              stroke={BLUSH}
              strokeWidth={2}
              width={150}
              x={x}
              y={y}
            />
            <text
              fill={INK}
              fontFamily="Georgia, serif"
              fontSize={15}
              textAnchor="middle"
              x={x + 75}
              y={y + 50}
            >
              {sign}
            </text>
          </g>
        );
      })}
      <Caption x={360} y={230}>
        These are a conversation, not a shopping list and not a game
      </Caption>
    </Frame>
  );
}

function BodyLifeVisual() {
  const tiles = ['Clothes', 'Workdays', 'Swim', 'Rest'];

  return (
    <Frame
      id="vis-body"
      title="Living in your body: clothes, workdays, swimming, and rest all have a quiet routine."
    >
      {tiles.map((tile, i) => {
        const x = 70 + i * 160;

        return (
          <g key={tile}>
            <rect fill={SAGE} height={110} opacity={0.25} rx={16} width={130} x={x} y={80} />
            <Label x={x + 65} y={144}>
              {tile}
            </Label>
          </g>
        );
      })}
      <Caption x={360} y={230}>
        Your pace is the right pace
      </Caption>
    </Frame>
  );
}

function PeerVisual() {
  return (
    <Frame
      id="vis-peer"
      title="Peer support is its own kind of care — someone who has a stoma, not a clinical substitute."
    >
      <circle cx={260} cy={140} fill={BLUSH} r={48} />
      <circle cx={460} cy={140} fill={SAGE} r={48} />
      <circle cx={360} cy={150} fill={PAPER} r={28} stroke={SAGE_DEEP} strokeWidth={3} />
      <Caption x={360} y={230}>
        A visitor is lived experience. An NSWOC is clinical care. Most people want both.
      </Caption>
    </Frame>
  );
}

function DigestionVisual() {
  return (
    <Frame
      id="vis-digest"
      title="An ileostomy is not a colostomy higher up — the missing colon is why fluid and salt matter more."
    >
      <path
        d="M80 160 h120 q20 -80 80 -80 q40 0 50 70"
        fill="none"
        stroke={SAGE_DEEP}
        strokeWidth={10}
        strokeLinecap="round"
      />
      <path
        d="M330 150 q40 80 100 40 q60 -30 80 20"
        fill="none"
        stroke={SAND}
        strokeWidth={14}
        strokeLinecap="round"
      />
      <circle cx={200} cy={90} fill={SAGE} r={10} />
      <Label x={200} y={54}>
        Small bowel
      </Label>
      <Label x={500} y={54}>
        Colon
      </Label>
      <Caption x={200} y={230}>
        Still absorbs nutrition
      </Caption>
      <Caption x={500} y={230}>
        Reclaims water and salt
      </Caption>
      <Caption x={360} y={268}>
        Ileostomy bypasses most of that reclaiming — that is the difference
      </Caption>
    </Frame>
  );
}

function EverydayEffectsVisual() {
  const tiles = ['Gas settles', 'Filters wet out', 'Pills can pass', 'Salt + fluid'];

  return (
    <Frame
      id="vis-effects"
      title="Everyday effects: gas often settles, filters wear out, some pills can pass through, and salt plus fluid matter."
    >
      {tiles.map((tile, i) => {
        const x = 50 + i * 170;

        return (
          <g key={tile}>
            <rect fill={PAPER} height={120} rx={16} stroke={SAND} width={150} x={x} y={70} />
            <text
              fill={INK}
              fontFamily="Georgia, serif"
              fontSize={15}
              textAnchor="middle"
              x={x + 75}
              y={140}
            >
              {tile}
            </text>
          </g>
        );
      })}
    </Frame>
  );
}

function TravelCanadaVisual() {
  return (
    <Frame
      id="vis-travel"
      title="Flying with supplies: enough in your carry-on for the whole journey, backup in the hold, never only in the hold."
    >
      <rect fill={SAGE} height={90} rx={12} width={70} x={150} y={90} />
      <rect fill={SAGE_DEEP} height={28} width={70} x={150} y={90} />
      <Label x={185} y={210}>
        Carry-on
      </Label>
      <Caption x={185} y={228}>
        The set you cannot lose
      </Caption>
      <rect fill={SAND} height={70} rx={8} width={110} x={430} y={110} />
      <rect fill={TAUPE} height={18} width={40} x={465} y={96} />
      <Label x={485} y={210}>
        Checked bag
      </Label>
      <Caption x={485} y={228}>
        Backup only — never the only set
      </Caption>
    </Frame>
  );
}

function PracticalCanadaVisual() {
  return (
    <Frame
      id="vis-practical"
      title="Coverage follows the province you live in, and vendor rules change at the border."
    >
      <rect fill={PAPER} height={160} rx={16} stroke={SAND} width={280} x={80} y={60} />
      <Label x={220} y={140}>
        Your province
      </Label>
      <Caption x={220} y={164}>
        Sets what you are entitled to
      </Caption>
      <rect fill={PAPER} height={160} rx={16} stroke={SAND} width={280} x={360} y={60} />
      <Label x={500} y={140}>
        The vendor rules
      </Label>
      <Caption x={500} y={164}>
        Where you are allowed to buy
      </Caption>
    </Frame>
  );
}

function MoneyVisual() {
  const models = ['Flat grant', 'Cost-share', 'Supplies issued', 'If you qualify'];

  return (
    <Frame
      id="vis-money"
      title="Four ways provinces pay: a flat grant, a cost-share, supplies issued, or only if you qualify."
    >
      {models.map((model, i) => {
        const x = 50 + i * 165;

        return (
          <g key={model}>
            <circle cx={x + 60} cy={120} fill={i % 2 ? SAGE : BLUSH} opacity={0.55} r={40} />
            <text
              fill={INK}
              fontFamily="Georgia, serif"
              fontSize={13}
              textAnchor="middle"
              x={x + 60}
              y={210}
            >
              {model}
            </text>
          </g>
        );
      })}
    </Frame>
  );
}

function CommunityVisual() {
  return (
    <Frame
      id="vis-community"
      title="Community is already out there: chapters, visitor programs, and free manufacturer support."
    >
      <circle cx={240} cy={140} fill={SAGE} opacity={0.5} r={70} />
      <circle cx={360} cy={140} fill={BLUSH} opacity={0.55} r={70} />
      <circle cx={480} cy={140} fill={SAND} r={70} />
      <Label x={360} y={146}>
        You are not the only one
      </Label>
    </Frame>
  );
}

function GrowingUpVisual() {
  return (
    <Frame
      id="vis-grow"
      title="A child’s stoma is not a smaller adult one — they grow, they re-measure, and fluid reserve is small."
    >
      <circle cx={280} cy={130} fill={BLUSH} r={36} />
      <rect fill={SAGE} height={70} opacity={0.7} rx={16} width={40} x={260} y={160} />
      <circle cx={440} cy={110} fill={SAND} r={50} />
      <rect fill={SAGE_DEEP} height={90} opacity={0.5} rx={20} width={56} x={412} y={150} />
      <Caption x={360} y={268}>
        Pediatric products, a school plan, and the hospital team — not adult advice scaled down
      </Caption>
    </Frame>
  );
}

function BodiesChangeVisual() {
  return (
    <Frame
      id="vis-bodies"
      title="Bodies that change: pregnancy, later life, and more than one condition at once all change fit."
    >
      <path d="M160 200 q100 -140 200 0" fill={BLUSH} opacity={0.5} />
      <path d="M360 200 q100 -80 200 0" fill={SAGE} opacity={0.4} />
      <Caption x={360} y={240}>
        Re-measure when the abdomen changes shape. That is expected, not a failure.
      </Caption>
    </Frame>
  );
}

function PeopleAroundVisual() {
  return (
    <Frame
      id="vis-people"
      title="The people around it: ask what help is wanted before offering hands-on care."
    >
      <circle cx={300} cy={130} fill={SAGE} r={44} />
      <circle cx={420} cy={150} fill={BLUSH} r={36} />
      <Caption x={360} y={230}>
        Company and logistics are help. Hands-on care is a separate, taught job.
      </Caption>
    </Frame>
  );
}

const VISUALS: Record<VisualId, () => ReactNode> = {
  siting: SitingVisual,
  changeRoutine: ChangeRoutineVisual,
  stomaTypes: StomaTypesVisual,
  glossary: GlossaryVisual,
  pouchingSystem: PouchingSystemVisual,
  measuring: MeasuringVisual,
  convexity: ConvexityVisual,
  accessories: AccessoriesVisual,
  notRight: NotRightVisual,
  bodyLife: BodyLifeVisual,
  peer: PeerVisual,
  digestion: DigestionVisual,
  everydayEffects: EverydayEffectsVisual,
  travelCanada: TravelCanadaVisual,
  practicalCanada: PracticalCanadaVisual,
  money: MoneyVisual,
  community: CommunityVisual,
  growingUp: GrowingUpVisual,
  bodiesChange: BodiesChangeVisual,
  peopleAround: PeopleAroundVisual,
};

export function ChapterVisual({ id }: { id: VisualId }) {
  const Visual = VISUALS[id];

  return <Visual />;
}
