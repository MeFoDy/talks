import http from 'http';
import fs from 'fs';
import path from 'path';

import puppeteer from 'puppeteer';

let browser;

try {
    browser = await puppeteer.launch();
    startServer();
} catch (error) {
    console.log(error);
}

function startServer() {
    const host = 'localhost';
    const port = 8000;

    const requestListener = async function (req, res) {
        const url = req.url.replace('/', '');

        if (!url) {
            res.writeHead(400);
            res.end('Ooops!');

            return;
        }

        try {
            let image;

            const imagePath = path.join(
                'saved',
                url.replace(/[^a-zA-Z0-9]/gi, '_').toLowerCase() + '.png'
            );
            if (fs.existsSync(imagePath)) {
                image = fs.readFileSync(imagePath);
            } else {
                image = await generateOgImage(url);
                fs.writeFileSync(imagePath, image);
            }

            res.setHeader('Content-Type', 'image/png');
            res.writeHead(200);
            res.end(image);
        } catch (e) {
            // console.log(e);

            res.writeHead(500);
            res.end('Ouch!');

            return;
        }
    };

    const server = http.createServer(requestListener);

    server.listen(port, host, () => {
        console.log(`Server is running on http://${host}:${port}`);
    });
}

async function generateOgImage(url) {
    const page = await browser.newPage();

    await page.setViewport({
        width: 1200,
        height: 630,
        deviceScaleFactor: 1,
    });

    await page.goto(url);

    await page.evaluate(() => {
        const avatar = document.querySelector('.review-speaker__photo').src;
        const title = document.querySelector(
            '.review-header__title'
        ).textContent;
        const name = document.querySelector(
            '.review-speaker__name'
        ).textContent;
        const position = document.querySelector(
            '.review-speaker__position'
        ).textContent;
        const logo = document.querySelector('.logo__img').src;

        document.body.innerHTML = `
<div class="wrapper">
    <div class="title">${title}</div>
    <div class="avatar">
        <img src="${avatar}">
    </div>
    <div class="name">${name}</div>
    <div class="position">${position}</div>
    <div class="bottom">
        <img src="${logo}">
    </div>
</div>
`;
    });

    await page.addStyleTag({ path: 'og.css' });

    const screenshotBuffer = await page.screenshot({
        fullPage: false,
        type: 'png',
    });

    // done!
    console.log(`✅ OG image of ${url} generated!`);

    await page.close();

    return screenshotBuffer;
}
