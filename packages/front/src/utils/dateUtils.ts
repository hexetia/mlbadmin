export interface FirebaseSearchableDateObject {
    /**
     * Returns the day of the month (1–31) for the specified date according to local time.
     */
    day: number;

    /**
     * Returns the month (0–11) in the specified date according to local time.
     */
    month: number;

    /**
     * Returns the year (4 digits for 4-digit years) of the specified date according to local time.
     */
    year: number;
}

export function lastDayOfMonth(date: Date): number {
    return new Date(date.getFullYear(), date.getMonth(), 0).getDate();
}

const monthNames: [string, string, string, string, string, string, string, string, string, string, string, string] = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
];

interface MonthWithNumber {
    name: string;
    abbrev: string;
    number: number;
}

interface IMonths {
    1: MonthWithNumber;
    2: MonthWithNumber;
    3: MonthWithNumber;
    4: MonthWithNumber;
    5: MonthWithNumber;
    6: MonthWithNumber;
    7: MonthWithNumber;
    8: MonthWithNumber;
    9: MonthWithNumber;
    10: MonthWithNumber;
    11: MonthWithNumber;
    12: MonthWithNumber;
}

export const monthsNamesWithNumber: IMonths = {
    1: { name: 'Janeiro', abbrev: 'Jan', number: 1 },
    2: { name: 'Fevereiro', abbrev: 'Fev', number: 2 },
    3: { name: 'Março', abbrev: 'Mar', number: 3 },
    4: { name: 'Abril', abbrev: 'Abr', number: 4 },
    5: { name: 'Maio', abbrev: 'Mai', number: 5 },
    6: { name: 'Junho', abbrev: 'Jun', number: 6 },
    7: { name: 'Julho', abbrev: 'Jul', number: 7 },
    8: { name: 'Agosto', abbrev: 'Ago', number: 8 },
    9: { name: 'Setembro', abbrev: 'Set', number: 9 },
    10: { name: 'Outubro', abbrev: 'Out', number: 10 },
    11: { name: 'Novembro', abbrev: 'Nov', number: 11 },
    12: { name: 'Dezembro', abbrev: 'Dez', number: 12 },
};

// todo test, document and refactor to use monthNamesWithNumber
export const currentMonth = (arbitraryMonthNumber?: number): { name: string; nameAbbrev: string; number: number } => {
    const currentMonth = arbitraryMonthNumber || new Date().getMonth() + 1;
    const currentMonthName = monthNames.filter((value, index) => index === currentMonth - 1)[0];

    return {
        name: currentMonthName,
        nameAbbrev: currentMonthName.substring(0, 3),
        number: arbitraryMonthNumber || currentMonth,
    };
};

export function formatSearchableDateObject(date: string | FirebaseSearchableDateObject): string {
    if (typeof date === 'string') {
        return date;
    } else {
        return `${date.day.toString().padStart(2, '0')}/${date.month.toString().padStart(2, '0')}/${date.year}`;
    }
}

export function formatBirthDayBr(date: string | FirebaseSearchableDateObject): string {
    if (typeof date === 'string') {
        return date;
    } else {
        return `${date.day.toString().padStart(2, '0')} de ${monthsNamesWithNumber[date.month].name}`;
    }
}

export function makeSearchableDate(dateStringDDMMYYYY: string): FirebaseSearchableDateObject {
    const dateSplit = dateStringDDMMYYYY.split('/');
    const day = parseInt(dateSplit[0]);
    const month = parseInt(dateSplit[1]);
    const year = parseInt(dateSplit[2]);

    return { day, month, year };
}

export function isValidDateString(dateStringDDMMYYYY: string) {
    try {
        const dateSplit = dateStringDDMMYYYY.split('/');
        const day = parseInt(dateSplit[0]);
        const month = parseInt(dateSplit[1]) - 1;
        const year = parseInt(dateSplit[2]);

        const date = new Date(dateStringDDMMYYYY.split('/').reverse().join('/'));

        return day === date.getDate() && month === date.getMonth() && year === date.getFullYear();
    } catch (e) {
        return false;
    }
}
