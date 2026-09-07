/*
 * Lesson guides — which teaching picture and which game sit on each
 * category-group. Group keys stay the navigation; this file only says
 * how that group is taught. Urgent / convexity / crisis groups omit games
 * on purpose.
 */

export type VisualId =
  | 'siting'
  | 'changeRoutine'
  | 'stomaTypes'
  | 'glossary'
  | 'pouchingSystem'
  | 'measuring'
  | 'convexity'
  | 'accessories'
  | 'notRight'
  | 'bodyLife'
  | 'peer'
  | 'digestion'
  | 'everydayEffects'
  | 'travelCanada'
  | 'practicalCanada'
  | 'money'
  | 'community'
  | 'growingUp'
  | 'bodiesChange'
  | 'peopleAround';

export type GameId =
  | 'beforeAfter'
  | 'goBag'
  | 'whichStoma'
  | 'wordMatch'
  | 'buildSystem'
  | 'measureFit'
  | 'accessoryJobs'
  | 'carryOnOrHold'
  | 'whyStoppedSticking'
  | 'whoDoIAsk';

export interface LessonGuide {
  visual: VisualId;
  games?: GameId[];
}

/** chapter slug → group key → how to teach it */
export const LESSON_GUIDES: Record<string, Record<string, LessonGuide>> = {
  'new-to-the-journey': {
    beforeSurgery: { visual: 'siting', games: ['beforeAfter'] },
    afterSurgery: { visual: 'changeRoutine', games: ['goBag'] },
  },
  'get-to-know-your-stoma': {
    stomaTypes: { visual: 'stomaTypes', games: ['whichStoma'] },
    theWords: { visual: 'glossary', games: ['wordMatch'] },
    pouchingSystem: { visual: 'pouchingSystem', games: ['buildSystem'] },
    skinFit: { visual: 'measuring', games: ['measureFit'] },
    convexity: { visual: 'convexity' },
    accessories: { visual: 'accessories', games: ['accessoryJobs'] },
    whenSomethingIsNotRight: { visual: 'notRight' },
    bodyAndLife: { visual: 'bodyLife' },
  },
  'everyday-liivving': {
    startHere: { visual: 'peer' },
    eatingAgain: { visual: 'digestion' },
    everydayEffects: { visual: 'everydayEffects', games: ['whoDoIAsk'] },
    gettingAroundCanada: {
      visual: 'travelCanada',
      games: ['carryOnOrHold', 'whyStoppedSticking'],
    },
    practicalCanada: { visual: 'practicalCanada' },
    money: { visual: 'money' },
    community: { visual: 'community' },
  },
  'this-might-be-you': {
    growingUp: { visual: 'growingUp' },
    bodiesThatChange: { visual: 'bodiesChange' },
    thePeopleAroundIt: { visual: 'peopleAround' },
  },
};
