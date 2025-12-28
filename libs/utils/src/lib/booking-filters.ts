import type { BookingRequest } from '@saubio/models';

export type BookingStatusFilter = 'all' | BookingRequest['status'];

export interface BookingFilterOptions {
  status: BookingStatusFilter;
  city: string;
}

export const filterBookings = (
  bookings: BookingRequest[],
  { status, city }: BookingFilterOptions
): BookingRequest[] => {
  const trimmedCity = city.trim().toLowerCase();

  return bookings.filter((booking) => {
    const normalizedStatus = booking.status.toLowerCase();
    const statusMatch =
      status === 'all'
        ? normalizedStatus !== 'draft'
        : normalizedStatus === status.toLowerCase();
    const cityMatch = trimmedCity
      ? booking.address.city.toLowerCase().includes(trimmedCity)
      : true;

    return statusMatch && cityMatch;
  });
};
