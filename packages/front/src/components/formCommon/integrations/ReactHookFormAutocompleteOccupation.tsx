import React, { useEffect, useMemo } from 'react';
import { Controller } from 'react-hook-form';
import { AutocompleteOccupation } from '../fields/AutocompleteOccupation';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { IOccupation } from '../../../../../../types/__project_defs/IOccupation';
import { runInAction, toJS } from 'mobx';
import { fireDB } from '../../../firebase/fireApp';
import { OccupationRepository } from '../../../repository/OccupationRepository';

export const ReactHookFormAutocompleteOccupation = observer((props: { name: string; control: any }) => (
    <Controller
        control={props.control}
        name={props.name}
        defaultValue={null}
        render={({ ref, ...reactHookProps }) => (
            <AutocompleteOccupation
                {...reactHookProps}
                onChange={(_, occupation) => {
                    props.control.setValue(reactHookProps.name, occupation);
                }}
                margin='normal'
            />
        )}
    />
));
