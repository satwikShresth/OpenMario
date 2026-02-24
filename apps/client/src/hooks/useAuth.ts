// import { useRouteContext } from '@tanstack/react-router';
// import type { Session, User } from '@/clients/auth';
// import type {
//    QueryObserverResult,
//    RefetchOptions
// } from '@tanstack/react-query';
//
// export type ExtendedUser = User & { isAnonymous?: boolean | null };
//
// export interface AuthState {
//    user?: ExtendedUser | null;
//    session?: Session | null;
//    refetch?: (options?: RefetchOptions) => Promise<
//       QueryObserverResult<
//          {
//             session: Session;
//             user: ExtendedUser;
//          },
//          Error
//       >
//    > | null;
// }
//
// export function useAuth(): AuthState {
//    return useRouteContext({ from: '__root__' }).auth;
// }
