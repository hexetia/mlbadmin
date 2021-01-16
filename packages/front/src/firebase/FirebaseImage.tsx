import { useQuery } from 'react-query';
import { fireStorage } from './fireApp';
import { imgStr } from './imgStr';
import { notEmptyStr } from '../utils/StringUtils';

export const FirebaseImage = (props: { src: string; Component: any; Fallback?: any }) => {
    const { data } = useQuery(props.src, ctx => {
        if (ctx.queryKey[0] === undefined || (typeof ctx.queryKey[0] === 'string' && ctx.queryKey[0] === '')) {
            return undefined;
        } else if (
            ctx.queryKey[0].startsWith('https') ||
            ctx.queryKey[0].startsWith('blob:') ||
            ctx.queryKey[0] === 'none' ||
            !notEmptyStr(ctx.queryKey[0])
        ) {
            return ctx.queryKey[0];
        }

        return fireStorage.ref(ctx.queryKey[0]).getDownloadURL();
    });
    const Component = props.Component;
    const Fallback = props.Fallback;

    if (Fallback) {
        return data ? <Component src={imgStr(data)} /> : <Fallback />;
    }

    return <Component src={imgStr(data)} />;
};
