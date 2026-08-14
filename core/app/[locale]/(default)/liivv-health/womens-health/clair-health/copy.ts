/**
 * Canadian-facing Clair copy.
 * Aligned to Clair-Canada-Claims-Audit.md (Aug 2026).
 * French is a working draft for Charter parity; regulatory FR still needs
 * a qualified Quebec reviewer before publication.
 */

export type ClairStage = {
  title: string;
  body: string;
  image: string;
  corner: 'tl' | 'tr' | 'bl' | 'br';
};

export type ClairFaq = { q: string; a: string };

export type ClairCopy = {
  meta: { title: string; description: string };
  back: string;
  hero: {
    aria: string;
    alt: string;
    h1: string;
    keywords: string;
    lead: string;
    cta: string;
    secondary: string;
  };
  notice: string;
  offer: {
    pill: string;
    h2: string;
    body: string;
    cta: string;
    note: string;
    items: ReadonlyArray<{ strong: string; label: string }>;
  };
  pressLabel: string;
  stages: {
    pill: string;
    h2: string;
    body: string;
    cards: readonly ClairStage[];
  };
  estimates: string;
  reproductive: string;
  story: {
    pill: string;
    h2: string;
    p1: string;
    p2: string;
    cta: string;
    alt: string;
  };
  position: {
    pill: string;
    h2: string;
    body: string;
    items: ReadonlyArray<{ title: string; body: string }>;
  };
  privacy: {
    pill: string;
    h2: string;
    p1: string;
    p2: string;
  };
  team: {
    pill: string;
    h2: string;
    body: string;
    names: readonly string[];
  };
  faq: {
    pill: string;
    h2: string;
    body: string;
    items: readonly ClairFaq[];
  };
  closing: {
    kicker: string;
    h2: string;
    accent: string;
    body: string;
    cta: string;
    secondary: string;
    tertiary: string;
  };
  legal: string;
};

const SITE = '/archive/womens-health/clair-site';

const TEAM_NAMES = [
  'Apple',
  'Whoop',
  'Eight Sleep',
  'Hinge',
  'Meta',
  'Princeton',
  'Mercedes-Benz',
  'FASTR',
  'Daydream',
] as const;

const EN: ClairCopy = {
  meta: {
    title: 'Clair | Cycle insights wearable | Liivv',
    description:
      'Clair is a hormone-aware wellness tracker, worn like jewellery. Pre-order through Liivv. Expected to ship November 2026. Sold in Canada as a general wellness product — not licensed by Health Canada as a medical device.',
  },
  back: "← Women's Health",
  hero: {
    aria: 'Introducing Clair',
    alt: 'Clair wellness wearable, worn like jewellery',
    h1: 'Introducing Clair',
    keywords: 'Worn like jewellery. Cycle insights. Everyday signals.',
    lead: 'A hormone-aware wellness tracker, built around female physiology — available through Liivv.',
    cta: 'Pre-order Clair',
    secondary: 'See how it fits',
  },
  notice:
    'Sold in Canada as a general wellness product. Not licensed by Health Canada as a medical device.',
  offer: {
    pill: 'Available through Liivv',
    h2: 'Pre-order Clair',
    body: 'Wear Clair like jewellery. It estimates how your body’s daily signals shift across your cycle. Expected to ship November 2026.',
    cta: 'Reserve my Clair',
    note: 'Expected to ship November–December 2026. We’ll confirm dates as they firm up.',
    items: [
      { strong: 'Pre-order', label: 'through Liivv' },
      { strong: 'Nov 2026', label: 'expected ship' },
      { strong: 'No labs', label: 'worn like jewellery' },
    ],
  },
  pressLabel: 'As covered in',
  stages: {
    pill: 'Everyday rhythm',
    h2: 'Built around the shape of your month',
    body: 'Notice how energy, sleep and daily signals shift across your cycle — and as you get older.',
    cards: [
      {
        title: 'Training & Recovery',
        body: 'Align training, recovery and daily movement with the shape of your cycle.',
        image: `${SITE}/training.webp`,
        corner: 'tl',
      },
      {
        title: 'Energy & Sleep',
        body: 'Notice how your energy and sleep shift across your cycle.',
        image: `${SITE}/people.webp`,
        corner: 'tr',
      },
      {
        title: 'Cycle patterns',
        body: 'See how your body’s daily signals change from week to week.',
        image: `${SITE}/product.webp`,
        corner: 'bl',
      },
      {
        title: 'Changes over time',
        body: 'See how your body’s daily signals shift as you get older.',
        image: `${SITE}/peri.webp`,
        corner: 'br',
      },
    ],
  },
  estimates: 'Estimates only. Not a hormone test and not a medical assessment.',
  reproductive:
    'Clair is not a contraceptive and must not be used to prevent pregnancy. It is not intended to identify a fertile window, to confirm ovulation, or to support conception planning. Speak with a health professional about contraception or fertility.',
  story: {
    pill: 'How Clair works',
    h2: 'Your body’s signals, worn like jewellery',
    p1: 'Clair reads everyday physiological signals — including skin temperature, heart rate and heart rate variability — and estimates how those patterns compare with your own typical range.',
    p2: 'Sleep, recovery and activity come along for the ride. One wearable instead of a calendar app and a fitness tracker.',
    cta: 'Pre-order Clair',
    alt: 'Clair worn like jewellery',
  },
  position: {
    pill: 'Sold as wellness',
    h2: 'What Clair is — and is not',
    body: 'The product, and the way it is described, have to match. Here is the Canadian position, in plain language.',
    items: [
      {
        title: 'A general wellness product',
        body: 'Clair is sold in Canada as a general wellness product. It is not licensed by Health Canada as a medical device and has not been evaluated by Health Canada for safety or effectiveness.',
      },
      {
        title: 'Estimates, not measurements',
        body: 'Clair does not measure hormone levels. It estimates patterns from physiological signals such as skin temperature, heart rate and heart rate variability.',
      },
      {
        title: 'Not for medical decisions',
        body: 'Clair does not diagnose, treat, cure, prevent or monitor any disease, disorder or condition. It is not a substitute for advice from a physician, pharmacist, nurse practitioner or other qualified health professional.',
      },
    ],
  },
  privacy: {
    pill: 'Your data',
    h2: 'Your most personal signals can stay with you',
    p1: 'Cycle-related data is among the most sensitive information a wearable can hold. Clair is built so those signals can live on your device first.',
    p2: 'If you ever choose cloud backup, that choice is yours — asked clearly, not buried. We will also say plainly that lost access cannot be recovered.',
  },
  team: {
    pill: 'The team',
    h2: 'People behind Clair',
    body: 'Members of the Clair team have previously worked at:',
    names: TEAM_NAMES,
  },
  faq: {
    pill: 'FAQ',
    h2: 'Frequently asked questions',
    body: 'What Clair is, how it estimates patterns, shipping, and ordering through Liivv.',
    items: [
      {
        q: 'What is Clair?',
        a: 'Clair is a hormone-aware wellness tracker, worn like jewellery. It estimates how your body’s daily signals shift across your cycle. Pre-order through Liivv. Expected to ship November 2026.',
      },
      {
        q: 'How does Clair work without a blood draw?',
        a: 'Hormones influence everyday signals your body already produces. Clair reads physiological signals such as skin temperature, heart rate and heart rate variability, then estimates how those patterns compare with your own typical range. It does not measure hormone levels and it is not a hormone test.',
      },
      {
        q: 'Is Clair a medical device?',
        a: 'Clair is sold in Canada as a general wellness product. It is not licensed by Health Canada as a medical device and has not been evaluated by Health Canada for safety or effectiveness. Clair does not diagnose, treat, cure, prevent or monitor any disease, disorder or condition.',
      },
      {
        q: 'Can I use Clair to prevent pregnancy or plan conception?',
        a: 'No. Clair is not a contraceptive and must not be used to prevent pregnancy. It is not intended to identify a fertile window, to confirm ovulation, or to support conception planning. Speak with a health professional about contraception or fertility.',
      },
      {
        q: 'How is my data handled?',
        a: 'Clair is designed so cycle-related data can live on your device first. If you choose optional cloud backup, you will be asked clearly at that moment — including that lost access cannot be recovered.',
      },
      {
        q: 'When does Clair ship?',
        a: 'Clair is expected to ship around November 2026. Pre-order through Liivv and we will keep you posted as dates firm up.',
      },
      {
        q: 'Who is Liivv?',
        a: 'Liivv is the Canadian home where you pre-order Clair. Liivv also offers women’s wellness, sleep support and skin care — with discreet delivery.',
      },
      {
        q: 'How private is my order?',
        a: 'Everything arrives in plain, discreet packaging, and your conversations with our team stay between you and us.',
      },
    ],
  },
  closing: {
    kicker: 'Through Liivv',
    h2: 'Reserve your Clair',
    accent: 'Cycle insights — on your wrist.',
    body: 'A hormone-aware wellness tracker, built around female physiology. Pre-order through Liivv. Expected to ship November 2026.',
    cta: 'Reserve my Clair',
    secondary: 'See how it fits',
    tertiary: "Women's Health",
  },
  legal:
    'Clair is sold in Canada as a general wellness product. It is not licensed by Health Canada as a medical device and has not been evaluated by Health Canada for safety or effectiveness. Clair does not diagnose, treat, cure, prevent or monitor any disease, disorder or condition. Clair does not measure hormone levels; it estimates patterns from physiological signals such as skin temperature, heart rate and heart rate variability. Clair is not a substitute for advice from a physician, pharmacist, nurse practitioner or other qualified health professional. Always consult a health professional with any question about your health.',
};

const FR: ClairCopy = {
  meta: {
    title: 'Clair | Bracelet de tendances du cycle | Liivv',
    description:
      'Clair est un bracelet de bien-être sensible aux hormones, à porter comme un bijou. Précommandez-le chez Liivv. Expédition prévue en novembre 2026. Vendu au Canada à titre de produit de bien-être général — non homologué par Santé Canada comme instrument médical.',
  },
  back: '← Santé des femmes',
  hero: {
    aria: 'Présentation de Clair',
    alt: 'Bracelet de bien-être Clair, porté comme un bijou',
    h1: 'Présentation de Clair',
    keywords: 'Porté comme un bijou. Tendances du cycle. Signaux du quotidien.',
    lead: 'Un bracelet de bien-être sensible aux hormones, conçu autour de la physiologie féminine — offert chez Liivv.',
    cta: 'Précommander Clair',
    secondary: 'Voir comment ça s’intègre',
  },
  notice:
    'Vendu au Canada à titre de produit de bien-être général. Non homologué par Santé Canada comme instrument médical.',
  offer: {
    pill: 'Offert chez Liivv',
    h2: 'Précommander Clair',
    body: 'Portez Clair comme un bijou. Il estime comment les signaux quotidiens de votre corps évoluent au fil de votre cycle. Expédition prévue en novembre 2026.',
    cta: 'Réserver mon Clair',
    note: 'Expédition prévue en novembre–décembre 2026. Nous confirmerons les dates à mesure qu’elles se précisent.',
    items: [
      { strong: 'Précommande', label: 'chez Liivv' },
      { strong: 'Nov 2026', label: 'expédition prévue' },
      { strong: 'Sans labo', label: 'porté comme un bijou' },
    ],
  },
  pressLabel: 'Mentionné dans',
  stages: {
    pill: 'Rythme du quotidien',
    h2: 'Conçu autour de la forme de votre mois',
    body: 'Observez comment l’énergie, le sommeil et les signaux du quotidien évoluent au fil de votre cycle — et avec le temps.',
    cards: [
      {
        title: 'Entraînement et récupération',
        body: 'Alignez l’entraînement, la récupération et le mouvement quotidien avec la forme de votre cycle.',
        image: `${SITE}/training.webp`,
        corner: 'tl',
      },
      {
        title: 'Énergie et sommeil',
        body: 'Observez comment votre énergie et votre sommeil évoluent au fil de votre cycle.',
        image: `${SITE}/people.webp`,
        corner: 'tr',
      },
      {
        title: 'Tendances du cycle',
        body: 'Voyez comment les signaux quotidiens de votre corps changent d’une semaine à l’autre.',
        image: `${SITE}/product.webp`,
        corner: 'bl',
      },
      {
        title: 'Changements dans le temps',
        body: 'Voyez comment les signaux quotidiens de votre corps évoluent à mesure que vous avancez en âge.',
        image: `${SITE}/peri.webp`,
        corner: 'br',
      },
    ],
  },
  estimates: 'Estimations seulement. Ne constitue ni un test hormonal ni une évaluation médicale.',
  reproductive:
    'Clair n’est pas un moyen de contraception et ne doit pas être utilisé pour prévenir une grossesse. Il n’est pas conçu pour déterminer une période de fertilité, confirmer l’ovulation ni soutenir la planification d’une grossesse. Consultez un professionnel de la santé au sujet de la contraception ou de la fertilité.',
  story: {
    pill: 'Comment Clair fonctionne',
    h2: 'Les signaux de votre corps, portés comme un bijou',
    p1: 'Clair lit des signaux physiologiques du quotidien — notamment la température cutanée, la fréquence cardiaque et la variabilité de la fréquence cardiaque — et estime comment ces tendances se comparent à votre plage habituelle.',
    p2: 'Le sommeil, la récupération et l’activité font partie du tableau. Un seul bracelet, plutôt qu’une appli calendrier et un traqueur d’activité.',
    cta: 'Précommander Clair',
    alt: 'Clair porté comme un bijou',
  },
  position: {
    pill: 'Produit de bien-être',
    h2: 'Ce qu’est Clair — et ce qu’il n’est pas',
    body: 'Le produit et la façon de le décrire doivent correspondre. Voici la position canadienne, en langage simple.',
    items: [
      {
        title: 'Un produit de bien-être général',
        body: 'Clair est vendu au Canada à titre de produit de bien-être général. Il n’est pas homologué par Santé Canada comme instrument médical et n’a pas été évalué par Santé Canada quant à son innocuité ou à son efficacité.',
      },
      {
        title: 'Des estimations, pas des mesures',
        body: 'Clair ne mesure pas les taux d’hormones. Il estime des tendances à partir de signaux physiologiques tels que la température cutanée, la fréquence cardiaque et la variabilité de la fréquence cardiaque.',
      },
      {
        title: 'Pas pour les décisions médicales',
        body: 'Clair ne sert pas à diagnostiquer, traiter, guérir, prévenir ni surveiller une maladie, un trouble ou un état de santé. Il ne remplace pas l’avis d’un médecin, d’un pharmacien, d’une infirmière praticienne ou d’un autre professionnel de la santé qualifié.',
      },
    ],
  },
  privacy: {
    pill: 'Vos données',
    h2: 'Vos signaux les plus personnels peuvent rester chez vous',
    p1: 'Les données liées au cycle sont parmi les plus sensibles qu’un bracelet puisse contenir. Clair est conçu pour que ces signaux puissent d’abord vivre sur votre appareil.',
    p2: 'Si vous choisissez un jour une sauvegarde infonuagique, ce choix vous appartient — demandé clairement, sans être enfoui. Nous dirons aussi clairement que l’accès perdu ne peut pas être récupéré.',
  },
  team: {
    pill: 'L’équipe',
    h2: 'Les personnes derrière Clair',
    body: 'Des membres de l’équipe Clair ont déjà travaillé chez :',
    names: TEAM_NAMES,
  },
  faq: {
    pill: 'FAQ',
    h2: 'Questions fréquentes',
    body: 'Ce qu’est Clair, comment il estime des tendances, l’expédition et la commande chez Liivv.',
    items: [
      {
        q: 'Qu’est-ce que Clair?',
        a: 'Clair est un bracelet de bien-être sensible aux hormones, à porter comme un bijou. Il estime comment les signaux quotidiens de votre corps évoluent au fil de votre cycle. Précommandez-le chez Liivv. Expédition prévue en novembre 2026.',
      },
      {
        q: 'Comment Clair fonctionne-t-il sans prise de sang?',
        a: 'Les hormones influencent des signaux quotidiens que votre corps produit déjà. Clair lit des signaux physiologiques tels que la température cutanée, la fréquence cardiaque et la variabilité de la fréquence cardiaque, puis estime comment ces tendances se comparent à votre plage habituelle. Il ne mesure pas les taux d’hormones et ne constitue pas un test hormonal.',
      },
      {
        q: 'Clair est-il un instrument médical?',
        a: 'Clair est vendu au Canada à titre de produit de bien-être général. Il n’est pas homologué par Santé Canada comme instrument médical et n’a pas été évalué par Santé Canada quant à son innocuité ou à son efficacité. Clair ne sert pas à diagnostiquer, traiter, guérir, prévenir ni surveiller une maladie, un trouble ou un état de santé.',
      },
      {
        q: 'Puis-je utiliser Clair pour prévenir une grossesse ou planifier une conception?',
        a: 'Non. Clair n’est pas un moyen de contraception et ne doit pas être utilisé pour prévenir une grossesse. Il n’est pas conçu pour déterminer une période de fertilité, confirmer l’ovulation ni soutenir la planification d’une grossesse. Consultez un professionnel de la santé au sujet de la contraception ou de la fertilité.',
      },
      {
        q: 'Comment mes données sont-elles traitées?',
        a: 'Clair est conçu pour que les données liées au cycle puissent d’abord vivre sur votre appareil. Si vous choisissez une sauvegarde infonuagique facultative, on vous le demandera clairement à ce moment — y compris que l’accès perdu ne peut pas être récupéré.',
      },
      {
        q: 'Quand Clair sera-t-il expédié?',
        a: 'Clair devrait être expédié vers novembre 2026. Précommandez-le chez Liivv et nous vous tiendrons au courant à mesure que les dates se précisent.',
      },
      {
        q: 'Qui est Liivv?',
        a: 'Liivv est la maison canadienne où vous précommandez Clair. Liivv offre aussi le bien-être des femmes, le soutien au sommeil et les soins de la peau — avec une livraison discrète.',
      },
      {
        q: 'Dans quelle mesure ma commande est-elle privée?',
        a: 'Tout arrive dans un emballage simple et discret, et vos conversations avec notre équipe restent entre vous et nous.',
      },
    ],
  },
  closing: {
    kicker: 'Chez Liivv',
    h2: 'Réservez votre Clair',
    accent: 'Les tendances du cycle — au poignet.',
    body: 'Un bracelet de bien-être sensible aux hormones, conçu autour de la physiologie féminine. Précommandez-le chez Liivv. Expédition prévue en novembre 2026.',
    cta: 'Réserver mon Clair',
    secondary: 'Voir comment ça s’intègre',
    tertiary: 'Santé des femmes',
  },
  legal:
    'Clair est vendu au Canada à titre de produit de bien-être général. Il n’est pas homologué par Santé Canada comme instrument médical et n’a pas été évalué par Santé Canada quant à son innocuité ou à son efficacité. Clair ne sert pas à diagnostiquer, traiter, guérir, prévenir ni surveiller une maladie, un trouble ou un état de santé. Clair ne mesure pas les taux d’hormones; il estime des tendances à partir de signaux physiologiques tels que la température cutanée, la fréquence cardiaque et la variabilité de la fréquence cardiaque. Clair ne remplace pas l’avis d’un médecin, d’un pharmacien, d’une infirmière praticienne ou d’un autre professionnel de la santé qualifié. Consultez toujours un professionnel de la santé pour toute question concernant votre santé.',
};

export function isFrenchLocale(locale: string) {
  return locale.toLowerCase().startsWith('fr');
}

export function getClairCopy(locale: string): ClairCopy {
  return isFrenchLocale(locale) ? FR : EN;
}
