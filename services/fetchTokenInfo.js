const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const GMGN_BASE_URL = 'https://gmgn.ai/sol/token';

puppeteer.use(StealthPlugin());

async function fetchTokenInfo(mintAddress) {
    console.log(`Starting token info fetch for mint address: ${mintAddress}`);

    const browser = await puppeteer.launch({ headless: true });
    console.log('Browser launched successfully');

    const page = await browser.newPage();
    console.log('New page opened in the browser');

    // Log all requests made by the page
    page.on('request', request => {
        console.log(`Page requested URL: ${request.url()}`);
    });

    // Log all responses received by the page
    page.on('response', response => {
        console.log(`Page received response from URL: ${response.url()} with status: ${response.status()}`);
    });

    try {
        const targetUrl = `${GMGN_BASE_URL}/${mintAddress}`;
        console.log(`Navigating to URL: ${targetUrl}`);
        
        await page.goto(targetUrl, { waitUntil: 'networkidle0' });
        console.log('Page loaded successfully');

        const tokenInfo = await page.evaluate(() => {
            console.log('Evaluating page content to extract token info');
            
            const scriptTag = document.querySelector('#__NEXT_DATA__');
            if (scriptTag) {
                console.log('Found script tag with token info');
                
                const jsonData = JSON.parse(scriptTag.textContent);
                return jsonData.props.pageProps.tokenInfo;
            }
            console.log('No script tag found, returning null');
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
