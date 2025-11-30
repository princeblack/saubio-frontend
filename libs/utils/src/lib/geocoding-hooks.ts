import { useQuery } from '@tanstack/react-query';
import { addressAutocompleteQueryOptions } from './api-queries';

export const useAddressAutocomplete = (query: string, enabled = true) => {
  return useQuery(addressAutocompleteQueryOptions(query, undefined, { enabled }));
};
