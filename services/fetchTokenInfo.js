const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const GMGN_BASE_URL  = 'https://gmgn.ai/sol/token';

puppeteer.use(StealthPlugin());

async function fetchTokenInfo(mintAddress) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    try {
        await page.goto(`${GMGN_BASE_URL}/${mintAddress}`, { waitUntil: 'networkidle0' });

        const tokenInfo = await page.evaluate(() => {
            const scriptTag = document.querySelector('#__NEXT_DATA__');
            if (scriptTag) {
                const jsonData = JSON.parse(scriptTag.textContent);
                return jsonData.props.pageProps.tokenInfo;
            }
            return null;
        });

        console.log('Token Info:', tokenInfo);
        return tokenInfo;
    } catch (error) {
        console.error('Error fetching token info:', error);
        throw error;
    } finally {
        await browser.close();
    }
}

module.exports = fetchTokenInfo;
