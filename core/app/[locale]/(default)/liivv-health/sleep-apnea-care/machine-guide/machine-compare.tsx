'use client';

/*
 * =============================================================================
 * THE MACHINE GUIDE'S CHART — TWO PLAIN TABLES
 * =============================================================================
 * The comparison the owner asked for in ruling N2 (machine-guide.md B.2):
 * table A, type, prescriber and Health Canada (licence and recall); table B,
 * the makers' own facts. Real <table>s with column and row headers, never
 * collapsed on a desktop; on a phone each table scrolls sideways inside its
 * own labelled region, and the page itself never does. They print as plain
 * tables, with the footnote under them.
 *
 * Every filled cell carries its own sources; a maker's own words or
 * specification also says "Maker" beside them, and is never a clinical
 * claim. A licence number or a recall number links its own Health Canada
 * page. An empty recall cell says "None found (a search, not proof)"; an
 * empty maker cell says "Not stated by the maker". Model names and the makers'
 * words are data, never translated: on /fr they are marked as English.
 *
 * Static: nothing entered, stored or worked out; no score, rank or pick; no
 * product, price, cart, buy link, retailer, pressure or setting. Liivv sells
 * no machine (ruling N1); the page says so above the chart.
 * =============================================================================
 */

import { useLocale, useMessages } from 'next-intl';
import type { ReactNode } from 'react';

import { SourceChip } from '../../_microsite/_components/source-chip';
import { OutboundLabel } from '../../_microsite/chapters/figure-parts';
import { useSiteSources } from '../../_microsite/site-context';
import { lookUpSources } from '../../_microsite/sources';

import type { GuideCell, GuideRowA, GuideRowB } from './machine-guide-data';

type Columns = Record<string, string>;

/* A cell's words, with each named licence or recall number linking its own page. */
function CellText({ cell }: { cell: GuideCell }) {
  const map = useSiteSources();
  const locale = useLocale();
  const parts: ReactNode[] = [];
  let rest = cell.text;

  (cell.links ?? []).forEach((link) => {
    const at = rest.indexOf(link.text);
    const source = map?.[link.source];

    /* No link while the register holds it (`linkHeld`): the words stay as they are. */
    if (at < 0 || !source?.href) return;

    parts.push(rest.slice(0, at));
    parts.push(
      <a
        href={source.href}
        hrefLang={source.hrefLang === locale ? undefined : source.hrefLang}
        key={`${link.source}-${link.text}`}
        rel="noopener noreferrer"
        target="_blank"
      >
        <OutboundLabel hrefLang={source.hrefLang} label={link.text} />
      </a>,
    );
    rest = rest.slice(at + link.text.length);
  });
  parts.push(rest);

  return <span lang={locale === 'en' ? undefined : 'en'}>{parts}</span>;
}

/*
 * One cell: the words, "Maker" where they are the maker's own, and the cell's
 * sources. `heading` is its column's name, which a phone shows above the
 * words when each machine is drawn as a card (./sa-machine-guide.css).
 */
function Cell({
  cell,
  empty,
  makerLabel,
  label,
  heading,
}: {
  cell: GuideCell | null;
  empty: string;
  makerLabel: string;
  label: string;
  heading: string;
}) {
  const map = useSiteSources();

  if (!cell) {
    return (
      <td className="sa-guide-empty" data-label={heading}>
        {empty}
      </td>
    );
  }

  return (
    <td data-label={heading}>
      <CellText cell={cell} />
      {cell.maker ? <span className="sa-guide-maker">{makerLabel}</span> : null}
      {map ? (
        <SourceChip
          className="sa-guide-src"
          label={label}
          sources={lookUpSources(map, cell.sources)}
        />
      ) : null}
    </td>
  );
}

/* A table in its own scroll region, so a phone scrolls the table, never the page. */
function TableRegion({
  heading,
  id,
  children,
}: {
  heading: string;
  id: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={`${id}-heading`} className="sa-guide-table-section">
      <h3 id={`${id}-heading`}>{heading}</h3>
      <div
        aria-labelledby={`${id}-heading`}
        className="sa-guide-scroll"
        role="region"
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a scrolling region must take keyboard focus to scroll (WCAG 2.1.1)
        tabIndex={0}
      >
        {children}
      </div>
    </section>
  );
}

function ModelHead({ model, aside }: { model: string; aside: string | null | undefined }) {
  const locale = useLocale();

  return (
    <th lang={locale === 'en' ? undefined : 'en'} scope="row">
      {aside ? `${model} (${aside})` : model}
    </th>
  );
}

const A_COLUMNS = ['type', 'prescriber', 'licence', 'recall'] as const;
const B_COLUMNS = ['humidifier', 'tube', 'travel', 'size', 'noise', 'data', 'masks'] as const;

function TableA({
  rows,
  makerLabel,
  notStated,
}: {
  rows: readonly GuideRowA[];
  makerLabel: string;
  notStated: string;
}) {
  const words = useMessages().SleepApneaCare.machineGuide.chart.a;
  const columns: Columns = words.columns;

  return (
    <TableRegion heading={words.heading} id="sa-guide-a">
      <table className="sa-guide-table">
        <thead>
          <tr>
            <th scope="col">{columns.model}</th>
            {A_COLUMNS.map((column) => (
              <th key={column} scope="col">
                {columns[column]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <ModelHead aside={row.maker ?? row.identifier} model={row.model} />
              {A_COLUMNS.map((column) => (
                <Cell
                  cell={row[column]}
                  empty={column === 'recall' ? words.noRecall : notStated}
                  heading={columns[column] ?? column}
                  key={column}
                  label={`${row.model} — ${columns[column] ?? column}`}
                  makerLabel={makerLabel}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </TableRegion>
  );
}

function TableB({
  rows,
  makerLabel,
  notStated,
}: {
  rows: readonly GuideRowB[];
  makerLabel: string;
  notStated: string;
}) {
  const words = useMessages().SleepApneaCare.machineGuide.chart.b;
  const columns: Columns = words.columns;

  return (
    <TableRegion heading={words.heading} id="sa-guide-b">
      <table className="sa-guide-table">
        <thead>
          <tr>
            <th scope="col">{columns.model}</th>
            {B_COLUMNS.map((column) => (
              <th key={column} scope="col">
                {columns[column]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <ModelHead aside={null} model={row.model} />
              {B_COLUMNS.map((column) => (
                <Cell
                  cell={row[column]}
                  empty={notStated}
                  heading={columns[column] ?? column}
                  key={column}
                  label={`${row.model} — ${columns[column] ?? column}`}
                  makerLabel={makerLabel}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </TableRegion>
  );
}

export function MachineCompare({
  rowsA,
  rowsB,
  chartSources,
  adpNoteSources,
}: {
  rowsA: readonly GuideRowA[];
  rowsB: readonly GuideRowB[];
  /* The footnote's chips: licences (MDALL and what its status means) and the recall search. */
  chartSources: readonly string[];
  /* The ADP note's chip, under table A. */
  adpNoteSources: readonly string[];
}) {
  const map = useSiteSources();
  const chart = useMessages().SleepApneaCare.machineGuide.chart;

  return (
    <div className="sa-guide-chart">
      <TableA makerLabel={chart.makerLabel} notStated={chart.b.notStated} rows={rowsA} />
      <p className="oc-fig-detail sa-guide-note">{chart.a.adpNote}</p>
      {map ? (
        <SourceChip
          className="sa-guide-src"
          label={chart.a.adpNote}
          sources={lookUpSources(map, adpNoteSources)}
        />
      ) : null}
      <TableB makerLabel={chart.makerLabel} notStated={chart.b.notStated} rows={rowsB} />
      <p className="sa-guide-footnote">{chart.footnote}</p>
      {map ? (
        <SourceChip
          className="sa-guide-src"
          label={chart.label}
          sources={lookUpSources(map, chartSources)}
        />
      ) : null}
    </div>
  );
}
