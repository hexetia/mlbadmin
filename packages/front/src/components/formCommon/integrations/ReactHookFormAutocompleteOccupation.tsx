import React from 'react';
import { Controller } from 'react-hook-form';
import { AutocompleteOccupation } from '../fields/AutocompleteOccupation';
import { observer } from 'mobx-react-lite';

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
