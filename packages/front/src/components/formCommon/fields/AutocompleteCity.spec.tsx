/**
 * @jest-environment jsdom
 */
import { AutocompleteCity } from './AutocompleteCity';

jest.mock('cross-fetch');

import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AutocompleteChangeDetails, AutocompleteChangeReason } from '@material-ui/lab/useAutocomplete/useAutocomplete';
import { QueryClient, QueryClientProvider } from 'react-query';
import fetch from 'cross-fetch';
const { Response } = jest.requireActual('cross-fetch');

test('default no values placeholder', async () => {
    const queryClient = new QueryClient();
    const handleChange = jest.fn(
        (event: React.ChangeEvent<{}>, value: null | string, reason: AutocompleteChangeReason, details?: AutocompleteChangeDetails) => {}
    );

    render(
        <QueryClientProvider client={queryClient}>
            <AutocompleteCity name={'city'} margin='normal' estado='' onChange={handleChange} />
        </QueryClientProvider>
    );

    fireEvent.click(screen.getByTitle('Open'));
    await waitFor(() => expect(screen.getByRole('presentation')).toHaveTextContent('Selecione um estado antes'));
});

test('show cities when estado is provided', async () => {
    // @ts-ignore
    fetch.mockReturnValue(
        Promise.resolve(
            new Response(
                JSON.stringify([
                    {
                        id: 2600054,
                        nome: 'Abreu e Lima',
                        microrregiao: {
                            id: 26017,
                            nome: 'Recife',
                            mesorregiao: {
                                id: 2605,
                                nome: 'Metropolitana de Recife',
                                UF: {
                                    id: 26,
                                    sigla: 'PE',
                                    nome: 'Pernambuco',
                                    regiao: {
                                        id: 2,
                                        sigla: 'NE',
                                        nome: 'Nordeste',
                                    },
                                },
                            },
                        },
                    },
                ])
            )
        )
    );

    const queryClient = new QueryClient();
    const handleChange = jest.fn(
        (event: React.ChangeEvent<{}>, value: null | string, reason: AutocompleteChangeReason, details?: AutocompleteChangeDetails) => {}
    );

    render(
        <QueryClientProvider client={queryClient}>
            <AutocompleteCity name={'city'} margin='normal' estado='Pernambuco' onChange={handleChange} />
        </QueryClientProvider>
    );

    fireEvent.click(screen.getByTitle('Open'));

    await waitFor(() => expect(fetch).toHaveBeenCalledWith(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/26/municipios`));

    await waitFor(
        () => {
            act(() => {});
            return expect(screen.getByRole('presentation')).toHaveTextContent('Abreu e Lima');
        },

        { timeout: 5_000 }
    );

    fireEvent.click(screen.getByText('Abreu e Lima'));
    await waitFor(() => expect(handleChange).toBeCalledWith(expect.anything(), 'Abreu e Lima', expect.anything(), expect.anything()));
}, 10_000);
