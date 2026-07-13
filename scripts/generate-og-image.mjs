import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templatePath = path.join(__dirname, 'og-image-template.html');
const outputPath = path.join(__dirname, '..', 'public', 'og-image.png');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.goto(`file://${templatePath.replace(/\\/g, '/')}`);
await page.screenshot({ path: outputPath });
await browser.close();

console.log(`OG image written to ${outputPath}`);
