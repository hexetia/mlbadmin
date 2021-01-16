/**
 * @jest-environment jsdom
 */
import type { QueryFunctionContext } from 'react-query/types/core/types';
const fakeOccupation = { id: '123987191xaasd', name: 'tatapaum', address: { state: '', city: '' } };

jest.mock('./queryMatchingOccupations', () => ({
    queryMatchingOccupations: jest.fn((context: QueryFunctionContext<string, string>) => {
        if (context.queryKey[1] === '') {
            return Promise.resolve([]);
        } else {
            return Promise.resolve([fakeOccupation]);
        }
    }),
}));

import { AutocompleteOccupation } from './AutocompleteOccupation';

jest.mock('cross-fetch');

import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AutocompleteChangeDetails, AutocompleteChangeReason } from '@material-ui/lab/useAutocomplete/useAutocomplete';
import { QueryClient, QueryClientProvider } from 'react-query';
import { IOccupation } from '../../../../../../types/__project_defs/IOccupation';
import userEvent from '@testing-library/user-event';

test('default no values placeholder', async () => {
    const queryClient = new QueryClient();
    const handleChange = jest.fn(
        (
            event: React.ChangeEvent<{}>,
            value: IOccupation,
            reason: AutocompleteChangeReason,
            details?: AutocompleteChangeDetails<IOccupation>
        ) => {}
    );

    render(
        <QueryClientProvider client={queryClient}>
            <AutocompleteOccupation name='' onChange={handleChange} />
        </QueryClientProvider>
    );

    fireEvent.click(screen.getByTitle('Open'));
    await waitFor(() => expect(screen.getByRole('presentation')).toHaveTextContent('Digite o nome da ocupação'));
});

test('show cities when estado is provided', async () => {
    const queryClient = new QueryClient();
    const handleChange = jest.fn(
        (
            event: React.ChangeEvent<{}>,
            value: IOccupation,
            reason: AutocompleteChangeReason,
            details?: AutocompleteChangeDetails<IOccupation>
        ) => {}
    );

    const { container } = render(
        <QueryClientProvider client={queryClient}>
            <AutocompleteOccupation name='city' onChange={handleChange} />
        </QueryClientProvider>
    );

    fireEvent.click(screen.getByTitle('Open'));

    await waitFor(
        () => {
            return expect(screen.getByRole('presentation')).toHaveTextContent('Digite o nome da ocupação');
        },

        { timeout: 5_000 }
    );

    userEvent.type(container.querySelector('input[name="city"]'), 'tata');
    await waitFor(() => {
        return expect(screen.getByText('tatapaum'));
    });

    fireEvent.click(screen.getByText('tatapaum'));
    await waitFor(() => expect(handleChange).toBeCalledWith(expect.anything(), fakeOccupation, expect.anything(), expect.anything()));
}, 10_000);
