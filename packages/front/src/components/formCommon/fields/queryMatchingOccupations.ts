import AwesomeDebouncePromise from 'awesome-debounce-promise';
import { QueryFunctionContext } from 'react-query/types/core/types';
import { IOccupation } from '../../../../../../types/__project_defs/IOccupation';
import { fireDB } from '../../../firebase/fireApp';
import { occupationCollectionName } from '../../../constants';

export const queryMatchingOccupations = AwesomeDebouncePromise(async (context: QueryFunctionContext<string, string>): Promise<
    IOccupation[]
> => {
    if (context.queryKey[1].trim() === '') {
        return [];
    }

    const querySnapshot = await fireDB
        .collection(occupationCollectionName)
        .where('name_lowercase', '>=', context.queryKey[1].toLowerCase())
        .where('name_lowercase', '<=', context.queryKey[1].toLowerCase() + '\uf8ff')
        .orderBy('name_lowercase')
        .limit(7)
        .get();

    return querySnapshot.docs.map(occupationDoc => {
        const { id, name, address } = occupationDoc.data();

        return ({ id, name, address } as Partial<IOccupation>) as IOccupation;
    });
}, 500);
