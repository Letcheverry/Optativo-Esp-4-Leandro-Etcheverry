const puppeteer = require('puppeteer');
const htmlParser = require('node-html-parser');
const ObectsToCsv = require('objects-to-csv');


const url = 'https://www.solotodo.cl/video_cards?memory_quantity_start=105521&ordering=offer_price_usd&'

const scrapStart = async ()=>{
    const browser = await puppeteer.launch({
        headless: false
    });

    const page = await browser.newPage();

    await page.goto(url);

    await page.waitForSelector('[id="category-browse-results-card"]');

    const gpus= []

    const categoria = await page.evaluate(()=>document.getElementById('category-browse-results-card').innerHTML)

    const numeracion = htmlParser.parse(categoria);

    const number = (numeracion.querySelector('.category-browse-pagination').querySelectorAll('li').length -1);

    const limit = numeracion.querySelector('.category-browse-pagination').querySelectorAll('li')[number-1].innerText

    const regex = /[$ .]/gm;

    const dateObject = new Date();
    const date = (dateObject.getDate() +"-"+ dateObject.getMonth() +"-"+ dateObject.getFullYear());


    for (let i = 2; i <= limit; i++) {

        const categoryElement = await page.evaluate(()=>document.getElementById('category-browse-results-card').innerHTML);

        const parsedContext = htmlParser.parse(categoryElement);

        const a = parsedContext.querySelectorAll('.category-browse-result')

        for (const htmlGpu of a) {


            gpus.push({
                title: htmlGpu.querySelectorAll('dd')[0].innerText,
                memory: htmlGpu.querySelectorAll('dd')[1].innerText,
                price: parseFloat((htmlGpu.querySelector('.price').innerText).replace(regex, "")),
                date: date
                //image: htmlGpu.querySelector('.image-container').querySelector('img').attributes['src']
            })
//querySelector('a')


        }

        await page.goto(url+"page="+i)

    }

    console.log(gpus.length);

    const csv = new ObectsToCsv(gpus)

    await csv.toDisk('./SolotodoGpuList.csv',{append: true});

    await browser.close();

}

scrapStart()