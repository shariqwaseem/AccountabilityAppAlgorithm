import {
	ERROR_CURRENT_DATE_BEFORE_ENTRY_DATE,
	Item,
	calculateRemainingOccurrences,
} from ".";

describe("calculateRemainingOccurrences", () => {
	test("it should return the correct remaining occurrences when there are no matching entries", () => {
		const item: Item = {
			title: "Sample Item",
			type: "sample type",
			amount: 10,
			limitOccurance: 1,
			limitOccuranceFrequency: "hour",
			entryAddDate: new Date("2023-10-15"),
			id: "123",
			carryOverValue: false,
			positiveCarryOverValue: false,
		};
		const entries = [];
		const remainingOccurrences = calculateRemainingOccurrences(
			item,
			entries,
		);
		expect(remainingOccurrences).toBe(item.amount);
	});

	test("it should handle entries that are not within the time window", () => {
		const item: Item = {
			title: "Sample Item",
			amount: 10,
			type: "sample type",
			limitOccurance: 1,
			limitOccuranceFrequency: "hour",
			entryAddDate: new Date("2023-10-15"),
			id: "123",
			carryOverValue: false,
			positiveCarryOverValue: false,
		};
		const entries = [
			{
				id: "123",
				entries: [
					{
						occurance: 2,
						date: new Date("2023-02-16T12:00:00"),
					},
				],
			},
		];
		const remainingOccurrences = calculateRemainingOccurrences(
			item,
			entries,
		);
		expect(remainingOccurrences).toBe(item.amount);
	});

	test("it should correctly calculate remaining occurrences with matching entries", () => {
		const item: Item = {
			title: "Sample Item",
			type: "Sample type",
			amount: 10,
			limitOccurance: 2,
			limitOccuranceFrequency: "month",
			entryAddDate: new Date("2023-10-15"),
			id: "123",
			carryOverValue: false,
			positiveCarryOverValue: false,
		};
		const entries = [
			{
				id: "123",
				entries: [
					{
						occurance: 2,
						date: new Date("2023-10-16T12:00:00"),
					},
				],
			},
		];
		const remainingOccurrences = calculateRemainingOccurrences(
			item,
			entries,
		);
		expect(remainingOccurrences).toBe(8);
	});

	test("custom test case 1", () => {
		const item: Item = {
			title: "Sample Item",
			type: "Sample type",
			amount: 10,
			limitOccurance: 1,
			limitOccuranceFrequency: "week",
			entryAddDate: new Date("2023-10-19"),
			id: "123",
			carryOverValue: false,
			positiveCarryOverValue: false,
		};
		const entries = [
			{
				id: "123",
				entries: [
					{
						occurance: 1,
						date: new Date("2023-10-16T12:00:00"),
					},
				],
			},
		];
		const remainingOccurrences = calculateRemainingOccurrences(
			item,
			entries,
		);
		expect(remainingOccurrences).toBe(10);
	});
	test("custom test case 2", () => {
		const item: Item = {
			title: "Sample Item",
			type: "Sample type",
			amount: 10,
			limitOccurance: 1,
			limitOccuranceFrequency: "week",
			entryAddDate: new Date("2023-10-19"),
			id: "123",
			carryOverValue: false,
			positiveCarryOverValue: false,
		};
		const entries = [
			{
				id: "123",
				entries: [
					{
						occurance: 4,
						date: new Date("2023-10-20T12:00:00"),
					},
				],
			},
		];
		const remainingOccurrences = calculateRemainingOccurrences(
			item,
			entries,
			new Date("2023-10-25T12:00:00"),
		);
		expect(remainingOccurrences).toBe(6);
	});
	test("custom test case 3", () => {
		const item: Item = {
			title: "Sample Item",
			type: "Sample type",
			amount: 10,
			limitOccurance: 1,
			limitOccuranceFrequency: "week",
			entryAddDate: new Date("2023-10-19"),
			id: "123",
			carryOverValue: false,
			positiveCarryOverValue: false,
		};
		const entries = [
			{
				id: "123",
				entries: [
					{
						occurance: 1,
						date: new Date("2023-10-20T12:00:00"),
					},
					{
						occurance: 1,
						date: new Date("2023-10-21T12:00:00"),
					},
					{
						occurance: 1,
						date: new Date("2023-10-22T12:00:00"),
					},
					{
						occurance: 1,
						date: new Date("2023-10-23T12:00:00"),
					},
					{
						occurance: 1,
						date: new Date("2023-10-24T12:00:00"),
					},
					{
						occurance: 1,
						date: new Date("2023-10-25T12:00:00"),
					},
					{
						occurance: 1,
						date: new Date("2023-10-26T12:00:00"),
					},
				],
			},
		];
		const remainingOccurrences = calculateRemainingOccurrences(
			item,
			entries,
			new Date("2023-10-27T12:00:00"), //current date
		);
		expect(remainingOccurrences).toBe(9);
	});
	test("Edge Case 1: Carry-over with Positive Carry-over Value", () => {
		const item: Item = {
			title: "Sample Item",
			type: "Sample type",
			amount: 10,
			limitOccurance: 1,
			limitOccuranceFrequency: "week",
			entryAddDate: new Date("2023-10-19"),
			id: "123",
			carryOverValue: true,
			positiveCarryOverValue: true,
		};
		const entries = [
			{
				id: "123",
				entries: [
					{
						occurance: 4,
						date: new Date("2023-10-20T12:00:00"),
					},
				],
			},
		];
		const remainingOccurrences = calculateRemainingOccurrences(
			item,
			entries,
			new Date("2023-10-25T12:00:00"),
		);
		expect(remainingOccurrences).toBe(6); // 10 (initial amount)  - 4 (used occurrences) = 6
	});

	test("Edge Case 2: Carry-over with Negative Carry-over Value", () => {
		const item: Item = {
			title: "Sample Item",
			type: "Sample type",
			amount: 10,
			limitOccurance: 1,
			limitOccuranceFrequency: "week",
			entryAddDate: new Date("2023-10-19"),
			id: "123",
			carryOverValue: true,
			positiveCarryOverValue: false,
		};
		const entries = [
			{
				id: "123",
				entries: [
					{
						occurance: 12,
						date: new Date("2023-10-20T12:00:00"),
					},
				],
			},
		];
		const remainingOccurrences = calculateRemainingOccurrences(
			item,
			entries,
			new Date("2023-10-26T12:00:00"),
		);
		expect(remainingOccurrences).toBe(8);
	});
	test("Edge Case 3: Entry Date Before Entry Add Date", () => {
		const item: Item = {
			title: "Sample Item",
			type: "Sample type",
			amount: 10,
			limitOccurance: 1,
			limitOccuranceFrequency: "week",
			entryAddDate: new Date("2023-10-19"),
			id: "123",
			carryOverValue: false,
			positiveCarryOverValue: false,
		};
		const entries = [
			{
				id: "123",
				entries: [
					{
						occurance: 1,
						date: new Date("2023-10-18T12:00:00"),
					},
				],
			},
		];
		const remainingOccurrences = calculateRemainingOccurrences(
			item,
			entries,
			new Date("2023-10-25T12:00:00"),
		);
		expect(remainingOccurrences).toBe(10);
	});
	test("Edge Case 4: Large Limit Occurance and Amount", () => {
		const item: Item = {
			title: "Sample Item",
			type: "Sample type",
			amount: 1000000, // A very large amount
			limitOccurance: 1000000, // A very large limitOccurance
			limitOccuranceFrequency: "year",
			entryAddDate: new Date("2023-10-19"),
			id: "123",
			carryOverValue: false,
			positiveCarryOverValue: false,
		};
		const entries = []; // No entries
		const remainingOccurrences = calculateRemainingOccurrences(
			item,
			entries,
			new Date("2023-10-25T12:00:00"),
		);
		expect(remainingOccurrences).toBe(1000000); // The initial amount is very large
	});
	test("Edge Case 3: Current Date Before Entry Add Date", () => {
		const item: Item = {
			title: "Sample Item",
			type: "Sample type",
			amount: 10,
			limitOccurance: 1,
			limitOccuranceFrequency: "week",
			entryAddDate: new Date("2023-10-19"),
			id: "123",
			carryOverValue: false,
			positiveCarryOverValue: false,
		};
		const entries = [
			{
				id: "123",
				entries: [
					{
						occurance: 1,
						date: new Date("2023-10-18T12:00:00"),
					},
				],
			},
		];
		try {
			calculateRemainingOccurrences(
				item,
				entries,
				new Date("2023-10-18T12:00:00"),
			);
		} catch (error) {
			expect(error).toHaveProperty(
				"message",
				ERROR_CURRENT_DATE_BEFORE_ENTRY_DATE,
			);
		}
	});
});
