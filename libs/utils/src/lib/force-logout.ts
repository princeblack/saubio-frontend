import { clearSession } from './session-store';

let forcedLogoutInProgress = false;

const buildRedirectUrl = () => {
  if (typeof window === 'undefined') {
    return '/login?reason=session_expired';
  }
  const current = `${window.location.pathname ?? ''}${window.location.search ?? ''}`;
  const params = new URLSearchParams();
  params.set('reason', 'session_expired');
  if (current && current !== '/login') {
    params.set('next', current);
  }
  return `/login?${params.toString()}`;
};

export const forceLogout = () => {
  if (forcedLogoutInProgress) {
    return;
  }
  forcedLogoutInProgress = true;
  clearSession();

  if (typeof window !== 'undefined') {
    try {
      window.alert('Your session has expired. Please log in again.');
    } catch {
      // ignore alert failures
    }
    const target = buildRedirectUrl();
    window.location.replace(target);
  }
};
