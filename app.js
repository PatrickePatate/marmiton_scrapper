import {PlaywrightCrawler, Dataset, FileDownload, Configuration} from 'crawlee';
import {findRecipeDifficulty} from "./utils/RecipeDifficulty.js";
import {findRecipePrice} from "./utils/RecipePrice.js";
import {findMealType} from "./utils/MealType.js";
import knex from 'knex';

let db = knex({
    client: 'postgresql',
    connection: {
        host: '127.0.0.1',
        user: 'root',
        password: 'root',
        database: 'marmiton'
    }
});

// PlaywrightCrawler crawls the web using a headless
// browser controlled by the Playwright library.
const crawler = new PlaywrightCrawler({
        // Use the requestHandler to process each of the crawled pages.
        async requestHandler({ request, page, enqueueLinks, log }) {
            page.setDefaultTimeout(100);

            // Scraping data only for recipe pages.
            if(request.loadedUrl.match('https:\/\/www\.marmiton\.org\/recettes\/recette_([A-Za-z0-9\-\_]+).aspx')) {
                page.setDefaultTimeout(1000);

                // try{
                //     let consent = await page.locator('#didomi-notice-agree-button').click();
                // }catch (e) {
                //     console.error('No consent button found');
                // }

                let title = (await page.locator('.main-title h1', { timeout: 5000 }).textContent());
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
                let difficulty = findRecipeDifficulty((await page.locator('div.recipe-primary__item:nth-child(3) span').textContent()));
                let price = findRecipePrice((await page.locator('div.recipe-primary__item:nth-child(5) span').textContent()));

                // Primary picture
                let primary_picture = (await page.locator('#recipe-media-viewer-main-picture').getAttribute('src'))
                if (!primary_picture.match('lazyload.png')) {
                    pictures.push(primary_picture);
                }

                //(await page.locator('#recipe-media-viewer-main-picture').click());
                // for (const img of (await page.locator('.af_diapo_global img.af_diapo_zoom').all())) {
                //     await img.getAttribute('src').then((src) => {
                //         if (!src.match('lazyload.png')) {
                //             pictures.push(src);
                //         }
                //     });
                // }
                for (const img of (await page.locator('.recipe-media-viewer img').all())) {
                    await img.getAttribute('src').then((src) => {
                        if (!src.match('lazyload.png')) {
                            pictures.push(src);
                        }
                    });
                }

                // (await page.locator('.af_diapo__right-container__header #af_diapo_closeBtn').click());

                let meal_type = findMealType((await page.locator('span.modal__tag:nth-child(2)').textContent()));

                let people = (await page.locator('input.recipe-ingredients__qt-counter__value').inputValue()).trim();

                let ingredients = [];
                for (const ingredient of (await page.locator('.mrtn-recette_ingredients .card-ingredient').all())) {
                    let quantity = (await ingredient.evaluate((el) => el.querySelector('.card-ingredient-quantity').getAttribute('data-ingredientquantity')));
                    let quantity_unit = (await ingredient.evaluate((el) => el.querySelector('.card-ingredient-quantity .unit').textContent)).trim();
                    let quantity_text = (await ingredient.evaluate((el) => el.querySelector('.card-ingredient-quantity').textContent)).trim().replaceAll(/\r\n|\n|\r/gm, '').replaceAll(/([\ ]{2,})/gm, ' ');
                    let label = (await ingredient.evaluate((el) => el.querySelector('.ingredient-name').textContent)).trim();
                    let singular = (await ingredient.evaluate((el) => el.querySelector('.ingredient-name').getAttribute('data-ingredientnamesingular')));
                    ingredients.push({
                        quantity: quantity,
                        quantity_unit: quantity_unit,
                        quantity_text: quantity_text,
                        label: label,
                        singular: singular
                    })
                }

                let utensils = [];
                for (const utensil of (await page.locator('.mrtn-recette_utensils .card-utensil').all())) {
                    let utensil_name = (await utensil.getAttribute('data-name'));
                    let utensil_text = (await utensil.evaluate((el) => el.querySelector('.card-utensil-quantity').textContent)).trim().replaceAll(/\r\n|\n|\r/gm, '').replaceAll(/([\ ]{2,})/gm, ' ');
                    utensils.push({
                        name: utensil_name,
                        label: utensil_text
                    });
                }

                let steps = [];
                for (const step of (await page.locator('.recipe-step-list .recipe-step-list__container').all())) {
                    let step_heading = (await step.evaluate((el) => el.querySelector('.recipe-step-list__head').textContent)).trim();
                    let step_text = (await step.evaluate((el) => el.querySelector('p').textContent)).trim();
                    steps.push({
                        heading: step_heading,
                        text: step_text
                    });
                }

                let author = null;
                let author_note = null;
                try{
                    author = (await page.locator('.recipe-author-note__author-name').textContent());
                }
                catch (e) {
                    author = null;
                }

                try{
                    author_note = (await page.locator('.recipe-author-note > i:nth-child(3)', { timeout: 5000 }).textContent());
                }catch (e) {
                    author_note = null;
                }

                db('recipes').insert({
                    title: title,
                    url: request.loadedUrl,
                    pictures: JSON.stringify(pictures),
                    total_time: time.total,
                    times: JSON.stringify(time),
                    difficulty: difficulty,
                    price: price,
                    meal_type: meal_type,
                    people: people,
                    ingredients: JSON.stringify(ingredients),
                    utensils: JSON.stringify(utensils),
                    steps: JSON.stringify(steps),
                    author: author || null,
                    author_note: author_note || null
                }).then(() => {
                    log.info(`Recipe at ${request.loadedUrl}  ['${title}'] has been saved.`);
                }).catch((e) => {
                    log.error(e);
                });
            }

            // Extract links from the current page
            // and add them to the crawling queue.
            await enqueueLinks();
        },
        maxRequestRetries: 1,
        maxConcurrency: 5,
        // Uncomment this option to see the browser window.
        // headless: false,
    },
    new Configuration({ availableMemoryRatio: 0.5 })
);

// Add first URL to the queue and start the crawl.
Promise.all([await crawler.run(['https://www.marmiton.org/recettes/index/ingredient'])])