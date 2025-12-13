'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { clearBookingPlannerState } from '../../utils/bookingPlannerStorage';

const FLOW_PREFIXES = ['/bookings/planning', '/bookings/select-provider', '/bookings/account'];

const isInsideBookingFlow = (pathname: string | null) => {
  if (!pathname) {
    return false;
  }
  return FLOW_PREFIXES.some((prefix) => pathname.startsWith(prefix));
};

export function BookingFlowWatcher() {
  const pathname = usePathname();
  const wasInsideRef = useRef(false);

  useEffect(() => {
    const inside = isInsideBookingFlow(pathname);
    if (wasInsideRef.current && !inside) {
      clearBookingPlannerState();
    }
    wasInsideRef.current = inside;
  }, [pathname]);

  return null;
}
