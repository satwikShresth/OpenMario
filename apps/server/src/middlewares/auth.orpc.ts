import { os } from '@/router/helpers';
import { auth } from '@/utils/auth';
import { ORPCError } from '@orpc/contract';

export const requireAuthToken = os.middleware(async ({ context, next }) => {
   const sessionData = await auth.api.getSession({
      headers: context.headers // or reqHeaders if you're using the plugin
   });

   if (!sessionData?.session || !sessionData?.user) {
      throw new ORPCError('UNAUTHORIZED', {
         message: 'Authentication required'
      });
   }

   const user = sessionData.user;
   const session = sessionData.session;

   return next({
      context: {
         user,
         session
      }
   });
});

export const requireNonAnonymous = requireAuthToken.concat(
   ({ context, next }) => {
      if (context.user!.isAnonymous) {
         throw new ORPCError('FORBIDDEN', {
            message: 'Anonymous users cannot perform this action'
         });
      }
      return next();
   }
);
