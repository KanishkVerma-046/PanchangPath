export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  publishDate: string; // ISO date, e.g. '2026-07-13'
  keywords: string[];
  contentHtml: string;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'hindu-panchang-tithi-nakshatra-rahu-kalam-explained',
    title: 'Understanding the Hindu Panchang: Tithi, Nakshatra & Rahu Kalam Explained',
    description: "Learn what Tithi means in the Hindu calendar, how it's calculated, the Amanta vs Purnimanta difference, and how Rahu Kalam is calculated for your city.",
    publishDate: '2026-07-13',
    keywords: ['what is tithi in hindu calendar', 'amanta vs purnimanta', 'rahu kalam calculation', 'nakshatra', 'hindu panchang'],
    contentHtml: `<p>If you have ever wondered why a Hindu festival falls on a different calendar date each year, or why your Panchang app shows a Tithi ending at an oddly specific time like 4:12 PM, the answer starts with one concept: Tithi. Tithi in the Hindu calendar is not a fixed 24-hour day — it is a unit of lunar motion, and understanding how it is measured explains almost everything else about the Panchang. It explains why Amanta and Purnimanta calendars can disagree on a month's name while still agreeing on the exact festival date, why a birth Nakshatra is looked up separately from a birth Tithi even though both come from the same daily Panchang, and why Rahu Kalam falls at a different clock time every single day, in every single city. Rather than treating these as four unrelated Panchang terms to memorize, this guide walks through the mechanics that connect them: what Tithi actually is, how it is calculated from the Sun and Moon's positions, how it relates to Nakshatra, how the Amanta and Purnimanta traditions organize the same Tithis differently, and how Rahu Kalam is derived from the same sunrise-to-sunset framework used across the rest of the Panchang.</p>

<h2>What Is a Tithi?</h2>
<p>A Tithi is a lunar day — the basic unit of time in the Hindu calendar, distinct from the 24-hour solar day used in the civil calendar. A full lunar month contains 30 Tithis, split into two halves: 15 Tithis of Shukla Paksha, during which the moon waxes from New Moon to Full Moon, and 15 Tithis of Krishna Paksha, during which it wanes from Full Moon back to New Moon. Each Tithi has a name and number — Pratipada, Dwitiya, Tritiya, and so on up to Purnima or Amavasya, part of the <a href="https://en.wikipedia.org/wiki/Tithi">30-Tithi lunar day structure</a> — and nearly every Hindu festival, vrat, and muhurta is dated by Tithi rather than by a fixed day of the solar month.</p>
<p>This is what makes Tithi in the Hindu calendar fundamentally different from a Gregorian date: it tracks a relationship between two moving bodies, not a fixed division of the day.</p>

<h2>How Is Tithi Calculated?</h2>
<h3>The 12-Degree Rule</h3>
<p>A Tithi is defined by the angular distance between the Moon and the Sun along the ecliptic. Specifically, one Tithi is the time it takes for the Moon's longitude to gain exactly 12 degrees on the Sun's longitude. Since a full circle is 360 degrees, and 360 divided by 12 is 30, this is exactly why a lunar month has 30 Tithis. The Tithi number at any moment can be found by taking the difference between Moon longitude and Sun longitude, reducing it to a value between 0 and 360 degrees, and dividing by 12 — <a href="https://calcatools.com/hindu-calculators/tithi-calculator/">this longitude-difference formula</a> is the same one used by dedicated Tithi calculators, and the result, rounded up, is the current Tithi number.</p>
<h3>Why Tithi Timings Shift Every Day</h3>
<p>Because the Moon's orbit around the Earth is elliptical rather than perfectly circular, its angular speed is not constant — it moves faster near perigee and slower near apogee. This means the time required to cover 12 degrees of separation from the Sun varies from roughly 19 hours to nearly 27 hours, with <a href="https://shrifreedom.org/vedic-astrology/tithi/">an average duration close to 23 hours and 37 minutes</a>. Since a Tithi rarely lines up neatly with a 24-hour civil day, its start and end times drift earlier or later from one day to the next, and occasionally a single civil day can contain the tail end of one Tithi and the beginning of the next, or even skip a Tithi number entirely. This is <a href="https://samvat.in/learn/tithi/">the direct mechanical reason a Panchang lists a precise start and end time for each Tithi</a> rather than simply naming "today's Tithi."</p>

<h2>Amanta vs Purnimanta: Two Calendar Systems, Same Tithi</h2>
<h3>How the Two Traditions Differ</h3>
<p>India follows two regional conventions for where a lunar month begins and ends, even though both are built from the same 30 Tithis described above. The Amanta system ends its month on Amavasya (New Moon) and begins the new month the following day, with Shukla Paksha occurring before Krishna Paksha within each named month. The Purnimanta system instead ends its month on Purnima (Full Moon), with Krishna Paksha occurring before Shukla Paksha. <a href="https://www.muhuratam.in/blog/amanta-vs-purnimanta">Amanta is generally followed across most of southern and western India</a>, while Purnimanta is more common through much of northern and central India.</p>
<h3>Why Festivals Still Fall on the Same Day</h3>
<p>Despite naming months differently, the two systems never disagree on which Tithi falls on which actual day — they simply group the same sequence of Tithis into months differently. A festival tied to, say, the fourth Tithi of Krishna Paksha in a particular lunar month happens on the identical day under both systems, even though one region might call it part of one month and another region a different month. Regional Panchang traditions across India, including several that <a href="/panchang/regional">PanchangPath's own regional Panchang pages</a> track separately by state, each apply this Amanta or Purnimanta convention consistently — <a href="https://shriastrotime.com/blogs/amanta-vs-purnimanta-understanding-the-two-hindu-lunar-month-systems-in-india">this regional split is a well-documented pattern</a>, and it is why the month name in a Bengali Panjika or a Gujarati Panchang can differ from a Hindi-belt Panchang for the exact same festival date.</p>

<h2>What Is Nakshatra, and How Does It Relate to Tithi?</h2>
<p>While Tithi measures the angular distance between the Moon and the Sun, Nakshatra measures something different: the Moon's position against a fixed backdrop of 27 star-sectors, each spanning 13 degrees and 20 minutes of the zodiac. Where Tithi answers "how far ahead of the Sun is the Moon," Nakshatra answers "which segment of the sky is the Moon currently passing through." Both values change over the course of a day, both are essential entries in a daily Panchang, and both are calculated independently — a birth Nakshatra, for instance, is often looked up using a dedicated <a href="/jyotish/nakshatra">Nakshatra calculator</a> rather than derived from the day's Tithi.</p>

<h2>What Is Rahu Kalam and How Is It Calculated?</h2>
<h3>The Eight-Part Day Division</h3>
<p>Rahu Kalam is a period during daylight hours considered inauspicious for starting new or significant undertakings — weddings, housewarmings, new business ventures, and similar events are traditionally avoided during this window, though routine or already-started activities are not affected. It is calculated by <a href="https://en.wikipedia.org/wiki/R%C4%81huk%C4%81la">dividing the time between local sunrise and sunset into eight equal parts</a>, each roughly 90 minutes long on a typical day. One of these eight segments is assigned to Rahu Kalam according to a fixed weekly rotation — for example, the eighth segment on Sunday, the second on Monday, and so on through the week — which is why Rahu Kalam falls at a different clock time depending on both the day of the week and the local sunrise time for that date and location.</p>
<h3>What to Avoid During Rahu Kalam</h3>
<p><a href="https://bhaktibharat.org/learn-panchangam/rahu-kalam">Traditional guidance avoids starting new ventures, travel, large purchases, contract signings, and auspicious ceremonies during Rahu Kalam</a>, while ongoing work, routine errands, and tasks already in progress may continue without concern. Because the window shifts with sunrise time, a Rahu Kalam calculated for one city cannot simply be reused in another — checking <a href="/muhurta/rahu-kala">today's Rahu Kala for your own location</a> is the only reliable way to know the exact window.</p>

<h2>Frequently Asked Questions</h2>
<h3>Does Tithi always start at midnight, like a calendar date?</h3>
<p>No. A Tithi can begin and end at any time of day or night, since it depends on the Moon completing 12 degrees of angular separation from the Sun rather than on a fixed clock schedule. A Tithi might start at 6:45 AM one day and 4:20 AM the next.</p>
<h3>Can two Tithis fall within the same calendar day?</h3>
<p>Yes. Because a Tithi's duration ranges from about 19 to 27 hours while a civil day is fixed at 24 hours, it is common for one Tithi to end and the next to begin within the same calendar day, and occasionally a short Tithi can begin and end entirely between sunrise on one day and sunrise on the next, effectively being skipped from the sunrise-to-sunrise date.</p>
<h3>Is Rahu Kalam the same across every city in India?</h3>
<p>No. Since Rahu Kalam is derived by dividing the sunrise-to-sunset window into eight parts, and sunrise and sunset times vary by longitude and latitude, the exact clock time for Rahu Kalam differs from city to city even on the same calendar day.</p>
<h3>How can I check today's exact Tithi, Nakshatra, and Rahu Kalam for my location?</h3>
<p>The most reliable way is to use a Panchang calculator that computes these values for your specific date and location rather than relying on a generic table. PanchangPath's homepage Panchang widget calculates all three live for any date and location you choose.</p>

<p>Tithi, Nakshatra, and Rahu Kalam are three separate but related outputs of the same underlying Panchang system: one tracks the Moon's angular distance from the Sun, another tracks the Moon's position among the 27 Nakshatras, and the third divides the day itself into auspicious and inauspicious segments. None of them align neatly with the fixed 24-hour clock, which is exactly why a proper Panchang calculates start and end times for each rather than listing a single value per day. For an accurate reading tailored to your own date and city, check <a href="/">PanchangPath's live Panchang widget</a>, browse a full month at a glance on the <a href="/calendar">Monthly Panchang Calendar</a>, or compare how your own regional tradition names its months on the <a href="/panchang/regional">Regional Panchang</a> pages.</p>`,
  },
];

export function estimateReadingTime(contentHtml: string): number {
  const text = contentHtml.replace(/<[^>]+>/g, ' ');
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function sortedByNewest(posts: BlogPost[]): BlogPost[] {
  return posts.slice().sort((a, b) => b.publishDate.localeCompare(a.publishDate));
}
