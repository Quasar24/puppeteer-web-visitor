const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const URL = 'https://landing-dukkecord.andres-duque.com/';
const VISITS = 50;

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Ajusta a la resolución de tu primer monitor
const MONITOR1_WIDTH = 1920;
const MONITOR2_POSITION_X = MONITOR1_WIDTH + 100; // un poco desplazado a la derecha
const MONITOR2_POSITION_Y = 50; // algo bajo para que no choque con barra de tareas

async function humanVisit(i) {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null, // importante para que la ventana se muestre
    args: [
      `--window-size=1280,800`,
      `--window-position=${MONITOR2_POSITION_X},${MONITOR2_POSITION_Y}`,
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ]
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  try {
    console.log(`🧭 Visitando ${i}`);
    await page.goto(URL, { waitUntil: 'networkidle2', timeout: 30000 });

    // Scroll automático
    await page.evaluate(() => {
      return new Promise(resolve => {
        let totalHeight = 0;
        const distance = 100;
        const timer = setInterval(() => {
          window.scrollBy(0, distance);
          totalHeight += distance;
          if (totalHeight >= document.body.scrollHeight/10) {
            clearInterval(timer);
            resolve();
          }
        }, 300);
      });
    });

    const waitTime = Math.random() * 4000 + 3000;
    await delay(waitTime);
    console.log(`✅ Visita ${i} completa`);
  } catch (err) {
    console.error(`❌ Error en visita ${i}: ${err.message}`);
  } finally {
    await browser.close();
  }
}

(async () => {
  for (let i = 1; i <= VISITS; i++) {
    await humanVisit(i);
    await delay(Math.random() * 2000 + 1000);
  }
})();
