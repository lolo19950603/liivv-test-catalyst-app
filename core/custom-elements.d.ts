import 'react';

declare global {
  namespace React.JSX {
    interface IntrinsicElements {
      'slider-element': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & { selector?: string },
        HTMLElement
      >;
    }
  }
}

export {};
