import { flushSync } from 'react-dom';

type ViewTransitionDocument = Document & {
   startViewTransition: (options: {
      update: () => void;
      types?: string[];
   }) => ViewTransition;
};

export function withViewTransition(update: () => void, types?: string[]) {
   if (!('startViewTransition' in document)) {
      update();
      return;
   }

   const doc = document as ViewTransitionDocument;

   doc.startViewTransition({
      update: () => flushSync(update),
      ...(types?.length ? { types } : {}),
   });
}
