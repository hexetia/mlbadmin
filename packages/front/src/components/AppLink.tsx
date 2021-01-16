import React, { Ref } from 'react';
import Link, { LinkProps } from 'next/link';
import { StyledA } from './StyledA';

export const AppLink: React.ForwardRefExoticComponent<React.PropsWithChildren<LinkProps>> = React.forwardRef(function LinkEmbeddable(
    props,
    ref: Ref<HTMLAnchorElement>
): JSX.Element {
    const { href, children, prefetch, passHref, ...rest } = props;

    return (
        <Link href={href} prefetch={prefetch} passHref>
            <StyledA {...(rest as any)} ref={ref}>
                {children}
            </StyledA>
        </Link>
    );
});
