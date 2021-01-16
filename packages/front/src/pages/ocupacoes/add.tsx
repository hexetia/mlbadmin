import React from 'react';
import { OccupationForm } from '../../components/occupationsComponents/OccupationForm';
import { ROLES } from '../../enums/ROLES';
import { GuardPage } from '../../security/GuardPage';
import Head from 'next/head';

function Add() {
    return (
        <>
            <Head>
                <title>Adicionar ocupação</title>
            </Head>
            <OccupationForm occupation={{}} />
        </>
    );
}

export default GuardPage(ROLES.CONTENT_EDITOR, Add);
