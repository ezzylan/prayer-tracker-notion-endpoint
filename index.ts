import { Client } from "@notionhq/client";
import { startOfWeek } from "date-fns";

const prayers = [
	{ name: "Fajr", emoji: "🌅" },
	{ name: "Dhuhr", emoji: "☀️" },
	{ name: "Asr", emoji: "⛅" },
	{ name: "Maghrib", emoji: "🌇" },
	{ name: "Isha", emoji: "🌙" },
];

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const dataSourceId = process.env.NOTION_DATA_SOURCE_ID!;

const today = new Date();

async function addPrayers() {
	for (const prayer of prayers) {
		await notion.pages.create({
			parent: { data_source_id: dataSourceId },
			icon: {
				type: "emoji",
				// @ts-expect-error
				emoji: prayer.emoji,
			},
			properties: {
				Name: {
					title: [{ text: { content: prayer.name } }],
				},
				Date: {
					date: { start: today.toISOString() },
				},
				"Is Finished": {
					checkbox: false,
				},
			},
		});

		console.log("✅ Added prayer:", prayer.name);
	}

	console.log("✅ All prayers added to Prayer Tracker!");
}

async function deleteCompletedPrayers() {
	const completedPrayers = await notion.dataSources.query({
		data_source_id: dataSourceId,
		filter: {
			and: [
				{
					property: "Date",
					date: { before: startOfWeek(today).toISOString() },
				},
				{
					property: "Is Finished",
					checkbox: { equals: true },
				},
			],
		},
	});

	completedPrayers.results.forEach(async (page) => {
		await notion.pages.update({ page_id: page.id, archived: true });
	});

	console.log("✅ All completed prayers deleted from Prayer Tracker!");
}

(async () => {
	try {
		await addPrayers();
		await deleteCompletedPrayers();
	} catch (err) {
		console.error("❌ Error occurred:", err);
		process.exit(1); // fail fast so GitHub Actions marks workflow as failed
	}
})();
