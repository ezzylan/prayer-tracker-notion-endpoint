interface WaktuSolatAPIResponse {
	zone: string;
	year: number;
	month: string;
	month_number: number;
	last_updated: null;
	prayers: Prayer[];
}

export interface Prayer {
	day: number;
	hijri: Date;
	fajr: number;
	syuruk: number;
	dhuhr: number;
	asr: number;
	maghrib: number;
	isha: number;
}

export async function fetchPrayerTimes() {
	try {
		const res = await fetch("https://api.waktusolat.app/v2/solat/WLY01");
		if (!res.ok) throw new Error(`Response status: ${res.status}`);

		const data = (await res.json()) as WaktuSolatAPIResponse;

		return data.prayers.find(
			(prayer) => prayer.day === new Date().getDate()
		);
	} catch (error) {
		if (error instanceof Error) console.error(error.message);
	}
}
