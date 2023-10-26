// Define the Item interface
export const ERROR_CURRENT_DATE_BEFORE_ENTRY_DATE = 'Current date is before item add entry date.'
type TypeTimeFrequency = "hour" | "day" | "month" | "year" | "week"
export interface Item {
    title: string;
    amount: number;
    type: string;
    limitOccurance: number;
    limitOccuranceFrequency: TypeTimeFrequency;
    entryAddDate: Date;
    id: string;
    carryOverValue: boolean;
    positiveCarryOverValue: boolean;
}


export interface Entry {
    id: string;
    entries: EntryDetail[];
}

interface EntryDetail {
    occurance: number;
    date: Date;
}

function getFrequencyInMilliseconds(limitOccuranceFrequency: TypeTimeFrequency) {
    switch (limitOccuranceFrequency) {
        case "hour":
            return 3600000; // 1 hour in milliseconds
        case "day":
            return 86400000; // 1 day in milliseconds
        case "week":
            return 604800000; // 1 week (7 days) in milliseconds
        case "month":
            return 2592000000; // Approximately 30.44 days in milliseconds
        case "year":
            return 31536000000; // 1 year in milliseconds
        default:
            return 0;
    }
}
function getSlidingTimeWindow(
    currentDate: Date,
    limitOccurance: number,
    limitOccuranceFrequency: TypeTimeFrequency,
    entryAddDate: Date,
) {
    const windowDuration = getFrequencyInMilliseconds(limitOccuranceFrequency);
    const currentTime = currentDate.getTime();

    // Calculate the difference in milliseconds between currentTime and entryAddDate
    const timeDifference = currentTime - entryAddDate.getTime();
    if (timeDifference < 0) {
        throw new Error(ERROR_CURRENT_DATE_BEFORE_ENTRY_DATE);
    }

    // Use modulo to find the remainder when dividing timeDifference by windowDuration * limitOccurance
    const remainder = timeDifference % (windowDuration * limitOccurance);

    // Calculate the slidingTime by subtracting the remainder from currentTime
    const slidingTime = new Date(currentTime - remainder);

    return slidingTime;
}
const calculateCarryOverValue = (
    currentDate: Date,
    limitOccurance: number,
    limitOccuranceFrequency: TypeTimeFrequency,
    entryAddDate: Date,
    amountAllowedPerPeroid: number,
) => {
    const windowDuration = getFrequencyInMilliseconds(limitOccuranceFrequency);
    const currentTime = currentDate.getTime();

    // Calculate the difference in milliseconds between currentTime and entryAddDate
    const timeDifference = currentTime - entryAddDate.getTime();
    if (timeDifference < 0) {
        throw new Error("Current date is before item add entry date");
    }

    // Use modulo to find the remainder when dividing timeDifference by windowDuration * limitOccurance
    const factor = Math.floor(
        timeDifference / (windowDuration * limitOccurance),
    );

    return factor * amountAllowedPerPeroid;
};
const calculateMsTimeBetweenTwoTimes = (date1: Date, date2: Date): number => {
    const timeDifference = date2.getTime() - date1.getTime();
    return timeDifference;
};

const addPeriodToDate = (date: Date, frequencyString: TypeTimeFrequency, limitOccurance: number, frequency: number) => {
    const windowDuration = getFrequencyInMilliseconds(frequencyString);
    return new Date(date.getTime() + (windowDuration * frequency * limitOccurance))
}

export const calculateRemainingOccurrences = (
    item: Item,
    entries: Entry[],
    simulatedCurrentTime?: Date,
) => {
    const currentDate = simulatedCurrentTime ?? new Date();
    const matchingEntries =
        entries.find((entry) => entry.id === item.id)?.entries ?? [];
    const timeWindow = getSlidingTimeWindow(
        currentDate,
        item.limitOccurance,
        item.limitOccuranceFrequency,
        item.entryAddDate,
    );
    const carryOverValue = calculateCarryOverValue(
        currentDate,
        item.limitOccurance,
        item.limitOccuranceFrequency,
        item.entryAddDate,
        item.amount,
    );

    // Occurances after latest time window
    const occurrences = matchingEntries.reduce((sum, entry) => {
        if (
            entry.date instanceof Date &&
            entry.date <= currentDate &&
            entry.date >= timeWindow
        ) {
            // Check if the entry date is within the specified date range

            sum += entry.occurance;
        }

        return sum;
    }, 0);

    // Occurances before latest time window
    const occurrencesTillTimeWindow = matchingEntries.reduce((sum, entry) => {
        if (
            entry.date instanceof Date &&
            entry.date <= timeWindow &&
            entry.date >= item.entryAddDate
        ) {
            // Check if the entry date is within the specified date range

            sum += entry.occurance;
        }

        return sum;
    }, 0);

    const remainingOccurrences = item.amount - occurrences;

    // If carry over value is enabled, remove the carry over value.
    // Only add the carry over value if positive carry over value is enabled, otherwise subtract only.

    const carryValueIsNegative = carryOverValue - occurrencesTillTimeWindow < 0;
    if (
        item.carryOverValue &&
        ((!carryValueIsNegative && item.positiveCarryOverValue) ||
            carryValueIsNegative)
    ) {
        return (
            remainingOccurrences + carryOverValue - occurrencesTillTimeWindow
        );
    }

    return remainingOccurrences;
};


export const calculateNextSafeDate = (item: Item, remainingOccurrences: number, simulatedCurrentTime?: Date) => {
    // If remainingOccurrences are negative, give the next window time so they can perform that
    // activity again
    // If carryOverValue is enabled, then wait for multiple (days/weeks etc.), otherwise wait till next window
    if (remainingOccurrences > 0) {
        return simulatedCurrentTime ?? new Date()
    }
    const timeWindow = getSlidingTimeWindow(
        simulatedCurrentTime ?? new Date(),
        item.limitOccurance,
        item.limitOccuranceFrequency,
        item.entryAddDate,
    );
    const frequency = Math.ceil(Math.abs(remainingOccurrences / item.amount))
    const newSafeDate = addPeriodToDate(timeWindow, item.limitOccuranceFrequency, item.limitOccurance, item.carryOverValue ? frequency : 1)
    return newSafeDate

}


const item: Item = {
    title: "Sample Item",
    type: "Sample type",
    amount: 10,
    limitOccurance: 1,
    limitOccuranceFrequency: "week",
    entryAddDate: new Date("2023-09-19"),
    id: "123",
    carryOverValue: true,
    positiveCarryOverValue: false,
};
const entries = [
    {
        id: "123",
        entries: [
            {
                occurance: 2,
                date: new Date("2023-09-19T12:00:00"),
            },

        ],
    },
];



let currentDate: Date | undefined = new Date("2023-09-25T12:00:00")
currentDate = undefined

// Calculate remaining occurrences for the example item
const remainingOccurrences = calculateRemainingOccurrences(
    item,
    entries,
    currentDate,
);
const nextSafeDate = calculateNextSafeDate(item, remainingOccurrences, currentDate)
console.log(`Remaining occurrences for the item: ${remainingOccurrences}`);
console.log(`Next Safe Date: ${nextSafeDate}`);
