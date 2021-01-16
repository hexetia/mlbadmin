import { attachFireFilters } from './attachFireFilters';
import firebase from 'firebase/app';
import 'firebase/firestore';
import { lastDayOfMonth } from '../utils/dateUtils';

type WhereFilterOp = '<' | '<=' | '==' | '!=' | '>=' | '>' | 'array-contains' | 'in' | 'array-contains-any' | 'not-in';

// high coupled to firestore current api,
// but that's not a problem since firestore query is stable since firestore launched

const queryFactory = () => {
    return new (class Query {
        orderBy = jest.fn((fieldPath: string, directionStr?: 'asc' | 'desc') => {
            return this;
        });
        where = jest.fn((fieldPath: string, opStr: WhereFilterOp, value: any) => {
            return this;
        });
    })();
};

test(`don't touch query without filters`, () => {
    const query = queryFactory();
    const filters = {};

    attachFireFilters(query as any, JSON.stringify(filters));

    expect(JSON.stringify(query)).toEqual(JSON.stringify(queryFactory()));
});

test('attach orders filters', async () => {
    const query = queryFactory();

    const filters = {
        oin: {
            type: 'justOrder',
            value: 'x',
            order: 'desc',
            toString: () => 'xxx',
        },
    };

    attachFireFilters(query as any, JSON.stringify(filters));

    expect(query.orderBy).toBeCalledTimes(1);
    expect(query.orderBy).toBeCalledWith('oin', 'desc');
});

test('attach equal filters', () => {
    const query = queryFactory();

    const filters = {
        oin: {
            type: 'equal',
            value: 'x',
            order: 'desc',
            toString: () => 'xxx',
        },
    };

    attachFireFilters(query as any, JSON.stringify(filters));

    expect(query.where).toBeCalledTimes(1);
    expect(query.where).toBeCalledWith('oin', '==', 'x');

    expect(query.orderBy).toBeCalledTimes(1);
    expect(query.orderBy).toBeCalledWith('oin', 'desc');
});

test('attach stringStartsWith with lowercase filter type', () => {
    const query = queryFactory();

    const filters = {
        oin_lowercase: {
            type: 'stringStartsWith',
            value: 'çxâ'.toUpperCase(),
            order: 'desc',
            toString: () => 'xxx',
        },
    };

    attachFireFilters(query as any, JSON.stringify(filters));

    expect(query.where).toBeCalledTimes(2);
    expect(query.where).toBeCalledWith('oin_lowercase', '>=', 'cxa');
    expect(query.where).toBeCalledWith('oin_lowercase', '<=', 'cxa' + '\uf8ff');

    expect(query.orderBy).toBeCalledTimes(1);
    expect(query.orderBy).toBeCalledWith('oin_lowercase');
});

test('only one inequality filters per query', () => {
    const query = queryFactory();

    const filters = {
        oin: {
            type: 'stringStartsWith',
            value: 'çxâ'.toUpperCase(),
            order: 'desc',
            toString: () => 'xxx',
        },
        hey: {
            type: 'stringStartsWith',
            value: 'çxâ'.toUpperCase(),
            order: 'desc',
            toString: () => 'xxx',
        },
    };

    expect(() => {
        attachFireFilters(query as any, JSON.stringify(filters));
    }).toThrowError('Check the filters code, firebase allow just ONE inequality filter per query, inequality filters used: 2');
});

test('attach rangeEveryDaysOfMothByDate', () => {
    const query = queryFactory();

    const filterValue = new Date();
    const filters = {
        by: {
            type: 'rangeEveryDaysOfMothByDate',
            value: filterValue,
            order: 'desc',
            toString: () => 'xxx',
        },
    };

    attachFireFilters(query as any, JSON.stringify(filters));

    expect(query.where).toBeCalledTimes(2);
    expect(query.where).toBeCalledWith(
        'by',
        '>=',
        firebase.firestore.Timestamp.fromDate(new Date(filterValue.getFullYear(), filterValue.getMonth()))
    );

    expect(query.where).toBeCalledWith(
        'by',
        '<',
        firebase.firestore.Timestamp.fromDate(
            new Date(filterValue.getFullYear(), filterValue.getMonth(), lastDayOfMonth(filterValue), 23, 59, 59, 99)
        )
    );

    expect(query.orderBy).toBeCalledTimes(1);
    expect(query.orderBy).toBeCalledWith('by');
});

test('attach rangeAllHoursOfDayByDate', () => {
    const query = queryFactory();

    const filterValue = new Date();
    const filters = {
        by: {
            type: 'rangeAllHoursOfDayByDate',
            value: filterValue,
            order: 'desc',
            toString: () => 'xxx',
        },
    };

    attachFireFilters(query as any, JSON.stringify(filters));

    expect(query.where).toBeCalledTimes(2);
    expect(query.where).toBeCalledWith(
        'by',
        '>=',
        firebase.firestore.Timestamp.fromDate(new Date(filterValue.getFullYear(), filterValue.getMonth(), filterValue.getDate()))
    );

    expect(query.where).toBeCalledWith(
        'by',
        '<',
        firebase.firestore.Timestamp.fromDate(
            new Date(filterValue.getFullYear(), filterValue.getMonth(), filterValue.getDate(), 23, 59, 59, 99)
        )
    );

    expect(query.orderBy).toBeCalledTimes(1);
    expect(query.orderBy).toBeCalledWith('by');
});
