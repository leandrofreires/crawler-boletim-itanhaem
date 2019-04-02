const request = require('request')
const cheerio = require('cheerio')
const _url = require('url')
const fs = require('fs')
const path = require('path')
const http = require('http')

const options = {
    uri: 'http://www2.itanhaem.sp.gov.br/boletim-oficial/',
}
const urls = [];
const paginas = [];

paginas.push(options.uri);

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}
function getBoletins(url) {
    return new Promise((resolve, reject) => {
        request(url, (error, response, body) => {
            if (error)
                reject()
            let $ = cheerio.load(body);
            $('.boletim-capa').each((i, element) => {
                urls.push($(element).find('a').attr('href'));
            })
            resolve(url)
        })
    });
}
function getPaginas(url) {
    return new Promise((resolve, reject) => {
        request(url, (error, response, body) => {
            if (error)
                reject(error)
            let $ = cheerio.load(body);
            $('a.page-numbers').not('.next').each((i, element) => {
                paginas.push($(element).attr('href'));
            })
            resolve(paginas)
        });
    })
}
function downloadFile(url){
    return new Promise((resolve, reject) => {
        request(url, (error, response, body) => {
            if (error)
                reject(error)
            let $ = cheerio.load(body);
            let file = _url.parse($('#boletim').attr('src'))
            fs.mkdirSync('boletim-oficial',{recursive: true})
            let download = fs.createWriteStream('boletim-oficial/' + path.basename(file.path))
            http.get(file.href, (resp) => {
                resp.pipe(download)
            })
            resolve(download)
        });
    })
}
async function main() {
    console.log('Capturando todas as paginas')
    await getPaginas(options.uri)
    console.log('Capturando boletins de cada pagina')
    await asyncForEach(paginas, async(link) => {
        await getBoletins(link);
    })
    console.log('Baixando Boletins')
    await asyncForEach(urls, async(link) => {
        await downloadFile(link)
    })
    console.log('Pronto !!')
}
main();
