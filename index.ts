import { Client } from "@notionhq/client";
import { Cron } from "croner";

const prayers = [
	{
		name: "Fajr",
		emoji: "🌅",
	},
	{
		name: "Dhuhr",
		emoji: "☀️",
	},
	{
		name: "Asr",
		emoji: "⛅",
	},
	{
		name: "Maghrib",
		emoji: "🌇",
	},
	{
		name: "Isha",
		emoji: "🌙",
	},
];

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.NOTION_DATABASE_ID!;

async function addPrayers() {
	for (const prayer of prayers) {
		try {
			await notion.pages.create({
				parent: { database_id: databaseId },
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
						date: { start: new Date().toISOString() },
					},
					"Is Finished": {
						checkbox: false,
					},
				},
			});

			console.log("✅ Added prayer:", prayer.name);
		} catch (err) {
			console.error("❌ Error adding prayer:", err);
			return;
		}
	}

	console.log("✅ All prayers added to Prayer Tracker!");
}

// Run every midnight (server time)
new Cron("0 0 * * *", { catch: (e) => console.error(e) }, addPrayers);

// Run immediately for testing
addPrayers();
