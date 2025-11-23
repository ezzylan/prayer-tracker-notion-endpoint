import { fetchPrayerTimes, type Prayer } from "./utils/fetch-prayer-times";
import { dataSourceId, notion } from "./utils/notion";

function getPrayerTimestamps(prayerName: string, prayerTimes: Prayer) {
	const prayerTimesKeys = Object.keys(prayerTimes);
	const prayerIndex = prayerTimesKeys.indexOf(prayerName);

	const currentPrayerTime = prayerTimes[
		prayerName.toLowerCase() as keyof typeof prayerTimes
	] as number;

	const nextPrayerKey = prayerTimesKeys[prayerIndex + 1];

	const nextPrayerTime = prayerTimes[
		(nextPrayerKey?.toLowerCase() as keyof typeof prayerTimes) || "fajr"
	] as number;

	return { currentPrayerTime, nextPrayerTime };
}

async function updatePrayerStatus() {
	const prayers = await notion.dataSources.query({
		data_source_id: dataSourceId,
	});

	const prayerTimes = await fetchPrayerTimes();
	if (!prayerTimes) {
		console.error("❌ Failed to fetch prayer times");
		return;
	}

	prayers.results.forEach(async (prayer) => {
		// @ts-expect-error
		const prayerName = prayer.properties.Name.title[0].plain_text as string;

		const { currentPrayerTime, nextPrayerTime } = getPrayerTimestamps(
			prayerName,
			prayerTimes
		);

		const nowInSeconds = Math.floor(Date.now() / 1000);

		if (nowInSeconds >= nextPrayerTime) {
			await notion.pages.update({
				page_id: prayer.id,
				properties: {
					Status: {
						status: { name: "Past prayer time" },
					},
				},
			});
		} else if (nowInSeconds >= currentPrayerTime) {
			await notion.pages.update({
				page_id: prayer.id,
				properties: {
					Status: {
						status: { name: "Within prayer time" },
					},
				},
			});
		}
	});

	console.log("✅ All prayer statuses updated!");
}

(async () => {
	try {
		await updatePrayerStatus();
	} catch (err) {
		console.error("❌ Error occurred:", err);
		process.exit(1); // fail fast so GitHub Actions marks workflow as failed
	}
})();
