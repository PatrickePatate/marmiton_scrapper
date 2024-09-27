import {PlaywrightCrawler, Dataset, FileDownload} from 'crawlee';

let fileDownload = new FileDownload({
    async requestHandler({ body, request, contentType, getKeyValueStore }) {
        const url = new URL(request.url);
        const kvs = await getKeyValueStore();

        await kvs.setValue(url.pathname.replace(/\//g, '_'), body, { contentType: contentType.type });
    },
});
// PlaywrightCrawler crawls the web using a headless
// browser controlled by the Playwright library.
const crawler = new PlaywrightCrawler({
    // Use the requestHandler to process each of the crawled pages.
    async requestHandler({ request, page, enqueueLinks, log }) {

        let title = (await page.locator('.main-title h1').textContent());
        let pictures = [];
        let total_time = (await page.locator('.time__total div').textContent());
        let prep_time = (await page.locator('.time__details div:first-child div').textContent());
        let rest_time = (await page.locator('.time__details div:nth-child(2) div').textContent());
        let cook_time = (await page.locator('.time__details div:nth-child(3) div').textContent());
        let time = {
            total: total_time,
            prep: prep_time,
            rest_time: rest_time,
            cook: cook_time
        };

        for (const img of (await page.locator('.recipe-media-viewer img').all())) {
            await img.getAttribute('src').then((src) => {
                if (!src.match('lazyload.png')) {
                    pictures.push(src);
                    fileDownload.addRequests([src]);
                }
            });
        }

        log.info(`Title of ${request.loadedUrl} is '${title}'`);

        // Save results as JSON to ./storage/datasets/default
        await Dataset.pushData(
            {
                title: title,
                url: request.loadedUrl,
                pictures: pictures,
                time: time
            });

        // Extract links from the current page
        // and add them to the crawling queue.
        await enqueueLinks({
            regexps: [new RegExp('https:\/\/www\.marmiton\.org\/recettes\/recette_([A-Za-z0-9\-\_]+).aspx')]
        });
    },
    // Uncomment this option to see the browser window.
    // headless: false,
});

// Add first URL to the queue and start the crawl.
Promise.all([await crawler.run(['https://www.marmiton.org/recettes/recette_chou-campagnard_12832.aspx#d58611-p3']), await fileDownload.run()])