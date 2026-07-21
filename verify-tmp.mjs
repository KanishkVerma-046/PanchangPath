import { lahiriAyanamsha, moonLongitude, sunTrueLongitude } from './src/lib/panchang.ts';

function toJD(y,m,d,h){h=h||0;if(m<=2){y--;m+=12;}const A=Math.floor(y/100),B=2-A+Math.floor(A/4);return Math.floor(365.25*(y+4716))+Math.floor(30.6001*(m+1))+d+h/24+B-1524.5;}

// 2026-07-20, New Delhi, lat 28.6139 lng 77.209 tz 5.5, noon local time
const jd = toJD(2026,7,20,12-5.5);
const ay = lahiriAyanamsha(jd);
const moon = moonLongitude(jd);
const sun = sunTrueLongitude(jd);
console.log('jd', jd);
console.log('ayanamsha', ay, '(expect ~24 deg)');
console.log('moonLongitude', moon);
console.log('sunTrueLongitude', sun);
console.log('sidereal moon', ((moon-ay)%360+360)%360);
console.log('sidereal sun', ((sun-ay)%360+360)%360);
