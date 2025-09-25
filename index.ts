import { Client } from "@notionhq/client";

const prayers = [
	{ name: "Fajr", emoji: "🌅" },
	{ name: "Dhuhr", emoji: "☀️" },
	{ name: "Asr", emoji: "⛅" },
	{ name: "Maghrib", emoji: "🌇" },
	{ name: "Isha", emoji: "🌙" },
];

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.NOTION_DATABASE_ID!;

async function addPrayers() {
	for (const prayer of prayers) {
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
	}

	console.log("✅ All prayers added to Prayer Tracker!");
}

(async () => {
	try {
		await addPrayers();
	} catch (err) {
		console.error("❌ Error adding prayers:", err);
		process.exit(1); // fail fast so GitHub Actions marks workflow as failed
	}
})();
