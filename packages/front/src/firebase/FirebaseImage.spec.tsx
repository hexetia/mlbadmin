/** @jest-environment jsdom */
import { FirebaseImage } from './FirebaseImage';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';

const ImageComponent = (props: any) => <img {...props} data-testid='img' />;

const client = new QueryClient();
const Fallback = () => <h1 data-testid='fallback'>oin</h1>;

test('can render', () => {
    render(
        <QueryClientProvider client={client}>
            <FirebaseImage src='/fakeDir/oin.jpg' Component={ImageComponent} Fallback={Fallback} />
        </QueryClientProvider>
    );
});

test('display fallback while url is not resolved', () => {
    render(
        <QueryClientProvider client={client}>
            <FirebaseImage src='/fakeDir/oin.jpg' Component={ImageComponent} Fallback={Fallback} />
        </QueryClientProvider>
    );

    expect(screen.getByTestId('fallback').textContent).toBe('oin');
});

test('resolve stored image refs to a full url', () => {
    render(
        <QueryClientProvider client={client}>
            <FirebaseImage src='/fakeDir/oin.jpg' Component={ImageComponent} Fallback={Fallback} />
        </QueryClientProvider>
    );

    waitFor(() => expect(screen.getByTestId('img').getAttribute('src').includes(encodeURIComponent('/fakeDir/oin.jpg'))).toBeTruthy());
    waitFor(() => expect(screen.queryByTestId('fallback')).toBeNull());
});
