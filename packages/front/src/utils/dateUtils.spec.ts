export const a = 1;
import { currentMonth, isValidDateString } from './dateUtils';

test('valid dates should be accepted', () => {
    expect(isValidDateString('28/02/2015')).toBe(true);
    expect(isValidDateString('31/01/2016')).toBe(true);
});

test('detect that day not exists in that month', () => {
    expect(isValidDateString('29/02/2015')).toBe(false);
    expect(isValidDateString('32/01/2016')).toBe(false);
});

test('invalid month', () => {
    expect(isValidDateString('31/13/2016')).toBe(false);
    expect(isValidDateString('22/22/2020')).toBe(false);
});

test('current month', () => {
    expect(currentMonth(1)).toStrictEqual({ name: 'Janeiro', nameAbbrev: 'Jan', number: 1 });
    expect(currentMonth(10)).toStrictEqual({ name: 'Outubro', nameAbbrev: 'Out', number: 10 });
});
