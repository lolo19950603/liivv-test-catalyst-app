import { AnimatedUnderline } from '@/vibes/soul/primitives/animated-underline';
import { Link } from '~/components/link';

import { SignInAction, SignInForm } from './sign-in-form';

interface Props {
  title?: string;
  action: SignInAction;
  submitLabel?: string;
  emailLabel?: string;
  passwordLabel?: string;
  forgotPasswordHref?: string;
  forgotPasswordLabel?: string;
  signUpHref?: string;
  signUpLabel?: string;
  error?: string;
}

// eslint-disable-next-line valid-jsdoc
/**
 * This component supports various CSS variables for theming. Here's a comprehensive list, along
 * with their default values:
 *
 * ```css
 * :root {
 *   --sign-in-title-font-family: var(--font-family-heading);
 *   --sign-in-title: hsl(var(--foreground));
 * }
 * ```
 */
export function SignInSection({
  title = 'Sign In',
  action,
  submitLabel,
  emailLabel,
  passwordLabel,
  forgotPasswordHref = '/forgot-password',
  forgotPasswordLabel,
  signUpHref = '/register',
  signUpLabel,
  error,
}: Props) {
  return (
    <div className="@container">
      <div className="mx-auto flex w-full max-w-md flex-col justify-center px-3 py-10 @xl:px-6 @4xl:py-20">
        <div className="w-full">
          {title ? (
            <h1 className="mb-10 font-[family-name:var(--sign-in-title-font-family,var(--font-family-heading))] text-4xl font-medium leading-none text-[var(--sign-in-title,hsl(var(--foreground)))] @xl:text-5xl">
              {title}
            </h1>
          ) : null}
          <SignInForm
            action={action}
            emailLabel={emailLabel}
            error={error}
            passwordLabel={passwordLabel}
            submitLabel={submitLabel}
          />
          {signUpLabel || forgotPasswordLabel ? (
            <div className="mt-4 flex flex-col items-start gap-3">
              {signUpLabel ? (
                <Link className="group/underline focus:outline-none" href={signUpHref}>
                  <AnimatedUnderline className="block w-fit text-sm font-semibold">
                    {signUpLabel}
                  </AnimatedUnderline>
                </Link>
              ) : null}
              {forgotPasswordLabel ? (
                <Link className="group/underline focus:outline-none" href={forgotPasswordHref}>
                  <AnimatedUnderline className="block w-fit text-sm font-semibold">
                    {forgotPasswordLabel}
                  </AnimatedUnderline>
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
