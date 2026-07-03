'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { clsx } from 'clsx';
import { XIcon } from 'lucide-react';
import { useSyncExternalStore } from 'react';

import { Button } from '@/vibes/soul/primitives/button';

/** Radix Dialog IDs must not SSR — they drift from client `useId` order and break hydration. */
function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export interface ModalProps extends React.PropsWithChildren {
  className?: string;
  isOpen?: boolean;
  setOpen?: (open: boolean) => void;
  /** Title should always be given for screen reader support. */
  title: string;
  /** Element to trigger the modal. Not required if the modal is being controlled manually. */
  trigger?: React.ReactNode;
  /** If `true`, a user will be required to make a choice by clicking on one of the provided actions. Defaults to `false`. */
  required?: boolean;
  /** Hides the header / top of the modal. */
  hideHeader?: boolean;
  /** When false, the modal sizes to its content instead of scrolling. Defaults to `true`. */
  scrollable?: boolean;
  /** Applies backdrop blur to the overlay behind the modal. */
  backdropBlur?: boolean;
}

// eslint-disable-next-line valid-jsdoc
/**
 * This component supports various CSS variables for theming. Here's a comprehensive list, along
 * with their default values:
 *
 * ```css
 * :root {
 *   --modal-background: hsl(var(--background));
 *   --modal-overlay-background: hsl(var(--foreground)/50%);
 * }
 * ```
 */
export const Modal = ({
  className = '',
  isOpen,
  setOpen,
  title,
  trigger,
  children,
  required = false,
  hideHeader = false,
  scrollable = true,
  backdropBlur = false,
}: ModalProps) => {
  const isClient = useIsClient();

  if (!isClient) {
    return trigger != null ? <>{trigger}</> : null;
  }

  return (
    <Dialog.Root onOpenChange={setOpen} open={isOpen}>
      {trigger != null && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}
      <Dialog.Portal>
        <Dialog.Overlay
          className={clsx(
            'fixed inset-0 z-40 bg-black/45 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            backdropBlur && 'backdrop-blur-md',
          )}
        />
        <Dialog.Content
          className={clsx(
            'fixed left-1/2 top-1/2 z-50 w-[calc(100%-1.5rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-[var(--modal-background,hsl(var(--background)))]',
            scrollable ? 'max-h-[90vh] max-w-3xl overflow-y-auto' : 'max-w-md overflow-visible',
            'transition ease-out',
            'data-[state=closed]:duration-200 data-[state=open]:duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out',
            'focus:outline-none data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            className,
          )}
          onEscapeKeyDown={required ? (event) => event.preventDefault() : undefined}
          onInteractOutside={required ? (event) => event.preventDefault() : undefined}
          onPointerDownOutside={required ? (event) => event.preventDefault() : undefined}
        >
          <div className="flex flex-col">
            <div
              className={clsx(
                'flex min-h-10 flex-row items-center py-3 pl-5',
                hideHeader ? 'sr-only' : '',
              )}
            >
              <Dialog.Title asChild>
                <h1 className="flex-1 pr-4 text-base font-semibold leading-none">{title}</h1>
              </Dialog.Title>
              {!(required || hideHeader) && (
                <div className="flex items-center justify-center pr-3">
                  <Dialog.Close asChild>
                    <Button shape="circle" size="x-small" variant="ghost">
                      <XIcon size={20} />
                    </Button>
                  </Dialog.Close>
                </div>
              )}
            </div>
            <div className={clsx('mb-5 flex-1 px-5', hideHeader ? 'mt-5' : '')}>{children}</div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
