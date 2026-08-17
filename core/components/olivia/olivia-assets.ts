import oliviaIdle from '~/components/account-dashboard/olivia-mascot.png';
import oliviaBlink from '~/components/account-dashboard/olivia-mascot-blink.png';
import oliviaHi from '~/components/account-dashboard/olivia-mascot-hi.png';
import oliviaWave from '~/components/account-dashboard/olivia-mascot-wave.png';

export type OliviaPose = 'idle' | 'blink' | 'wave' | 'hi';

export const OLIVIA_POSES: Array<{ id: OliviaPose; src: typeof oliviaIdle }> = [
  { id: 'idle', src: oliviaIdle },
  { id: 'blink', src: oliviaBlink },
  { id: 'wave', src: oliviaWave },
  { id: 'hi', src: oliviaHi },
];
