const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const GMGN_BASE_URL = 'https://gmgn.ai/sol/token';

puppeteer.use(StealthPlugin());

async function fetchTokenInfo(mintAddress) {
    console.log(`Starting token info fetch for mint address: ${mintAddress}`);

    const browser = await puppeteer.launch({
        headless: false,  
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-blink-features=AutomationControlled',
        ]
    });
    console.log('Browser launched successfully');

    const page = await browser.newPage();
    console.log('New page opened in the browser');

    // Set a custom user agent to mimic a real browser
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36');

    // Set the viewport to a common desktop resolution
    await page.setViewport({ width: 1366, height: 768 });

    // Log requests and responses
    page.on('request', request => {
        console.log(`Page requested URL: ${request.url()}`);
    });
    page.on('response', response => {
        console.log(`Page received response from URL: ${response.url()} with status: ${response.status()}`);
    });

    try {
        const targetUrl = `${GMGN_BASE_URL}/${mintAddress}`;
        console.log(`Navigating to URL: ${targetUrl}`);

        await page.goto(targetUrl, { waitUntil: 'networkidle0' });
        console.log('Page loaded successfully');

        const tokenInfo = await page.evaluate(() => {
            const scriptTag = document.querySelector('#__NEXT_DATA__');
            if (scriptTag) {
                const jsonData = JSON.parse(scriptTag.textContent);
                return jsonData.props.pageProps.tokenInfo;
            }
            return null;
        });

        if (tokenInfo) {
            console.log('Token Info extracted:', tokenInfo);
        } else {
            console.log('Token Info not found');
        }

        return tokenInfo;
    } catch (error) {
        console.error('Error occurred during token info fetch:', error);
        throw error;
    } finally {
        console.log('Closing browser');
        await browser.close();
        console.log('Browser closed');
    }
}

module.exports = fetchTokenInfo;
