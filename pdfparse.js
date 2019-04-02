const fs = require('fs')
const path = require('path')
const parsePdf = require('parse-pdf')

const dir = path.join(__dirname, 'boletim-oficial');
const matchedSites = [];
async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}
(async () => {
    await new Promise((resolve, reject) => {
        asyncForEach(fs.readdirSync(dir), async(file) => {
            parsed = await parsePdf(fs.readFileSync(path.join(dir,file)))
            const regex =  new RegExp('PROCESSO DE LOCAÇÃO','gi')
            matchedSites.push(parsed.pages.filter(({text}) => text.match(regex)));
        });
        resolve(matchedSites)
    })
    
    console.log(matchedSites)
})();

