import { useEffect, useState } from 'react';
import { nanoid } from 'nanoid/non-secure';

/**
 * Browsers ignore the autoComplete='off', that's a problem when we need to avoid browser autofill,
 * but there is a way to trick browser and force the autoComplete to be off
 *
 * instead of autoComplete='off' use autoComplete={someRandomIDHere}
 *
 * that hook make the trick possible and avoid rerenders, since he randomID in autoCompleteProp stay the same
 */
export function useId() {
    const [id] = useState(() => nanoid());

    return id;
}
