'use client';

import { useEffect, useState } from 'react';

import { stashGuestHealthAnswers } from '~/app/[locale]/(default)/liivv-health/_actions/stash-guest-health-answers';
import { saveSignedInLandingQuiz } from '~/app/[locale]/(default)/liivv-health/_actions/save-signed-in-landing-quiz';
import { Image } from '~/components/image';
import { useRouter } from '~/i18n/routing';
import {
  getLandingCategoryMeta,
  isQuestionAnswered,
  LANDING_CATEGORY_QUESTIONNAIRES,
  type CategoryResponses,
  type LandingHealthCategoryId,
} from '~/lib/onboarding/category-questionnaires';

import oliviaDiabetesIdle from './olivia-variants/diabetes.png';
import oliviaDiabetesBlink from './olivia-variants/diabetes-blink.png';
import oliviaOstomyIdle from './olivia-variants/ostomy.png';
import oliviaOstomyBlink from './olivia-variants/ostomy-blink.png';
import oliviaWomensIdle from './olivia-variants/womens-health.png';
import oliviaWomensBlink from './olivia-variants/womens-health-blink.png';

import './guest-category-quiz.css';

type GuestCategoryQuizProps = {
  categoryId: LandingHealthCategoryId;
  className?: string;
  isSignedIn?: boolean;
};

type OliviaPose = 'idle' | 'blink' | 'wave' | 'hi';
type OliviaMood = 'live' | 'bounce' | 'celebrate';

const OLIVIA_POSES: Record<
  LandingHealthCategoryId,
  { idle: typeof oliviaDiabetesIdle; blink: typeof oliviaDiabetesIdle }
> = {
  diabetes_care_everyday: { idle: oliviaDiabetesIdle, blink: oliviaDiabetesBlink },
  ostomy_care_everyday: { idle: oliviaOstomyIdle, blink: oliviaOstomyBlink },
  womens_health_wellness: { idle: oliviaWomensIdle, blink: oliviaWomensBlink },
};

const WELCOME: Record<
  LandingHealthCategoryId,
  { kicker: string; title: string; lead: string }
> = {
  diabetes_care_everyday: {
    kicker: 'Come as you are',
    title: "Let's find your pace.",
    lead: 'A few quiet questions — then we will keep this ready for your health profile. No rush. No wrong answers.',
  },
  ostomy_care_everyday: {
    kicker: 'Come as you are',
    title: "You're in the right place.",
    lead: 'Tell us a little about your everyday, and we will save it to your profile when you are ready. Kind, private, yours.',
  },
  womens_health_wellness: {
    kicker: 'Come as you are',
    title: "Let's start where you are today.",
    lead: 'A couple of gentle questions — then this becomes part of your health profile. Take your time.',
  },
};

const FRIENDLY_PROMPTS: Record<string, string> = {
  diabetes_path: 'Which path feels like yours right now?',
  diabetes_journey_stage: 'Where are you in this chapter?',
  diabetes_management: 'What is helping you keep things in balance? Choose everything that fits.',
  ostomy_type: 'What kind of ostomy is part of your everyday?',
  ostomy_journey_stage: 'Where are you in this chapter?',
  ostomy_preferred_brand: 'Any brand that already feels like home?',
  womens_age_range: 'First — whereabouts in life are you?',
  womens_life_phase: 'What are we focusing on together today?',
};

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function useQuizOlivia(reactToken: number, submitting: boolean) {
  const [pose, setPose] = useState<OliviaPose>('hi');
  const [mood, setMood] = useState<OliviaMood>('live');

  useEffect(() => {
    if (prefersReducedMotion()) {
      setPose(submitting ? 'hi' : 'idle');
      setMood('live');
      return;
    }

    if (submitting) {
      setMood('celebrate');
      setPose('hi');
      return;
    }

    let cancelled = false;
    const timers: number[] = [];
    const later = (fn: () => void, ms: number) => {
      timers.push(window.setTimeout(fn, ms));
    };

    setMood('live');
    setPose('hi');
    later(() => {
      if (!cancelled) setPose('idle');
    }, 1600);

    const scheduleBlink = () => {
      if (cancelled) return;
      later(() => {
        if (cancelled) return;
        setPose((current) => (current === 'idle' ? 'blink' : current));
        later(() => {
          if (cancelled) return;
          setPose((current) => (current === 'blink' ? 'idle' : current));
          scheduleBlink();
        }, 140);
      }, 2200 + Math.random() * 2800);
    };

    scheduleBlink();

    return () => {
      cancelled = true;
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [submitting]);

  useEffect(() => {
    if (reactToken === 0 || submitting || prefersReducedMotion()) return;

    setMood('bounce');
    setPose('wave');
    const id = window.setTimeout(() => {
      setMood('live');
      setPose('idle');
    }, 720);

    return () => window.clearTimeout(id);
  }, [reactToken, submitting]);

  return { pose, mood };
}

function oliviaCaption(pose: OliviaPose, submitting: boolean, isLast: boolean) {
  if (submitting) return 'Saving your place…';
  if (pose === 'wave') return 'Nice. That helps.';
  if (pose === 'hi') return 'Olivia is glad you are here.';
  if (isLast) return 'Almost there.';
  return 'Take your time — no wrong answers.';
}

export function GuestCategoryQuiz({
  categoryId,
  className,
  isSignedIn = false,
}: GuestCategoryQuizProps) {
  const router = useRouter();
  const questions = LANDING_CATEGORY_QUESTIONNAIRES[categoryId];
  const meta = getLandingCategoryMeta(categoryId);
  const welcome = WELCOME[categoryId];
  const [step, setStep] = useState(0);
  const [responses, setResponses] = useState<CategoryResponses>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reactToken, setReactToken] = useState(0);
  const [saved, setSaved] = useState(false);
  const { pose, mood } = useQuizOlivia(reactToken, submitting);
  const oliviaFrames = OLIVIA_POSES[categoryId];

  const question = questions[step];
  const total = questions.length;
  const isLast = step === total - 1;
  const answered = question ? isQuestionAnswered(question, responses) : false;

  const setSingle = (key: string, value: string) => {
    setError(null);
    setResponses((prev) => ({ ...prev, [key]: value }));
    setReactToken((token) => token + 1);
  };

  const toggleMulti = (key: string, value: string) => {
    setError(null);
    setResponses((prev) => {
      const current = prev[key];
      const selected = Array.isArray(current) ? [...current] : [];
      const next = selected.includes(value)
        ? selected.filter((entry) => entry !== value)
        : [...selected, value];

      return { ...prev, [key]: next };
    });
    setReactToken((token) => token + 1);
  };

  if (!question || saved) {
    return null;
  }

  const goNext = async () => {
    if (!answered || submitting) return;

    if (!isLast) {
      setStep((prev) => Math.min(total - 1, prev + 1));
      return;
    }

    setSubmitting(true);
    setError(null);

    const result = isSignedIn
      ? await saveSignedInLandingQuiz({ categoryId, responses })
      : await stashGuestHealthAnswers({ categoryId, responses });

    if (!result.ok) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    if (isSignedIn) {
      setSaved(true);
      router.refresh();
      return;
    }

    router.push('/register');
  };

  const currentValue = responses[question.key];
  const multiSelected = Array.isArray(currentValue) ? currentValue : [];
  const prompt = FRIENDLY_PROMPTS[question.key] ?? question.prompt.replace(/\s*\*$/, '');

  return (
    <section
      aria-label={`${meta.label} welcome`}
      className={['guest-category-quiz', className].filter(Boolean).join(' ')}
    >
      <div className="guest-category-quiz-inner">
        <div className="guest-category-quiz-card">
          <div aria-hidden className="guest-category-quiz-orbs">
            <span />
            <span />
          </div>

          <aside className="guest-category-quiz-host">
            <div className="guest-category-quiz-olivia" data-mood={mood} data-pose={pose}>
              <div className="guest-category-quiz-olivia-sway">
                <div className="guest-category-quiz-olivia-figure">
                  <Image
                    alt="Olivia"
                    className="guest-category-quiz-olivia-img is-on"
                    fill
                    sizes="(min-width: 900px) 220px, 140px"
                    src={oliviaFrames.idle}
                  />
                  <Image
                    alt=""
                    aria-hidden
                    className={`guest-category-quiz-olivia-img${pose === 'blink' ? ' is-on' : ''}`}
                    fill
                    sizes="(min-width: 900px) 220px, 140px"
                    src={oliviaFrames.blink}
                  />
                </div>
              </div>
            </div>
            <p aria-live="polite" className="guest-category-quiz-wave">
              {oliviaCaption(pose, submitting, isLast)}
            </p>
          </aside>

          <div className="guest-category-quiz-main">
            <p className="guest-category-quiz-kicker">{welcome.kicker}</p>
            <h2 className="guest-category-quiz-title">{welcome.title}</h2>
            <p className="guest-category-quiz-lead">
              {isSignedIn
                ? 'A few quiet questions — then we will add this category to your health profile. No rush. No wrong answers.'
                : welcome.lead}
            </p>

            <div aria-hidden className="guest-category-quiz-steps">
              {questions.map((_, index) => (
                <span
                  className={`guest-category-quiz-dot${index === step ? ' is-current' : ''}${
                    index < step ? ' is-done' : ''
                  }`}
                  key={index}
                />
              ))}
            </div>

            <p className="guest-category-quiz-prompt">{prompt}</p>
            <div className="guest-category-quiz-options">
              {question.options.map((option) => {
                const active =
                  question.mode === 'multi'
                    ? multiSelected.includes(option.value)
                    : currentValue === option.value;

                return (
                  <button
                    aria-pressed={active}
                    className={`guest-category-quiz-pill${active ? ' is-active' : ''}`}
                    key={option.value}
                    onClick={() =>
                      question.mode === 'multi'
                        ? toggleMulti(question.key, option.value)
                        : setSingle(question.key, option.value)
                    }
                    type="button"
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

            <div className="guest-category-quiz-actions">
              {step > 0 ? (
                <button
                  className="guest-category-quiz-back"
                  onClick={() => {
                    setError(null);
                    setStep((prev) => Math.max(0, prev - 1));
                  }}
                  type="button"
                >
                  Take me back
                </button>
              ) : null}
              <button
                className="guest-category-quiz-next"
                disabled={!answered || submitting}
                onClick={() => {
                  void goNext();
                }}
                type="button"
              >
                {isLast
                  ? submitting
                    ? 'Saving your place…'
                    : isSignedIn
                      ? 'Save to my health profile'
                      : "That's me — create my profile"
                  : 'Keep going'}
              </button>
            </div>

            {error ? <p className="guest-category-quiz-error">{error}</p> : null}
          </div>
        </div>
      </div>
    </section>
  );
}
