export interface FireFilter<T> {
    type: 'stringStartsWith' | 'equal' | 'rangeEveryDaysOfMothByDate' | 'rangeAllHoursOfDayByDate' | 'justOrder';
    value: T;
    order?: 'desc' | 'asc';
    toString?: () => string;
}
