const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const Bottleneck = require('bottleneck');

// Carrega as configurações do arquivo config.json
const config = require('./config.json');

// Configuração do throttle
const limiter = new Bottleneck({
  maxConcurrent: config.maxConcurrentRequests,
  minTime: config.minRequestInterval,
});

async function scrapeGames(urls) {
  try {
    console.log('=> Iniciando raspagem...');
    // Criando a pasta "games" se não existir
    const gamesDir = path.join(__dirname, 'games');
    if (!fs.existsSync(gamesDir)) {
      fs.mkdirSync(gamesDir);
      console.log('Pasta "games" criada com sucesso.');
    }

    // Array de promessas para armazenar todas as solicitações HTTP
    const requests = urls.map(url => limiter.schedule(() => scrapePage(url, gamesDir)));

    // Aguarda todas as solicitações HTTP serem concluídas
    await Promise.all(requests);
  } catch (error) {
    console.error('Ocorreu um erro:', error);
  }

  // Programa a próxima execução após o intervalo definido em config.json (em milissegundos)
  setTimeout(() => {
    console.log('=> Reiniciando raspagem...');
    scrapeGames(urls);
  }, config.scrapeInterval * 60 * 1000); // Converte minutos para milissegundos
}

async function scrapePage(url, gamesDir) {
  try {
    const response = await axios.get(url);
    const html = response.data;

    const $ = cheerio.load(html);
    const pageGames = $('.product-item')
      .map((index, element) => extractGameData($, element))
      .get()
      .filter(game => game);

    // Escreve os dados em um arquivo JSON somente se houver jogos na página
    if (pageGames.length > 0) {
      const fileName = url.split('/').pop().replace('-', '_') + '_games.json';
      const filePath = path.join(gamesDir, fileName);
      const writeStream = fs.createWriteStream(filePath, { flags: 'w+' });
      writeStream.write(JSON.stringify(pageGames, null, 2));
      writeStream.end();
      console.log(`Arquivo ${filePath} criado.`);
    } else {
      console.log(`Nenhum jogo encontrado na página ${url}`);
    }
  } catch (error) {
    console.error(`Erro ao processar a página ${url}:`, error);
  }
}

function extractGameData($, element) {
  let name = $(element).find('.product-item__title').text().trim();
  const image = $(element).find('.product-item__primary-image').attr('src');
  let price = $(element).find('.price--highlight').text().trim();
  let originalPrice = $(element).find('.price--compare').text().trim();
  let promotion = $(element).find('.product-item__label-list').text().trim();

  // Verifica se o item está esgotado
  const isSoldOut = $(element).find('.button--disabled').length > 0;

  // Formatação das informações
  name = name.replace(/\s+/g, ' ').replace(/\n/g, '');
  price = formatPrice(price);
  originalPrice = formatPrice(originalPrice);
  promotion = promotion.replace('-', '-').trim();

  // Verifica se o título do jogo contém "DLC"
  const isDLC = name.includes('DLC');

  // Verifica se todas as informações necessárias estão presentes e se o item não está esgotado
  if (name && image && price && originalPrice && promotion && !isSoldOut) {
    const platformMatch = name.match(/\(([^)]+)\)$/);
    let platform = '';
    if (platformMatch && platformMatch.length > 1) {
      platform = platformMatch[1];
      name = name.replace(/\s*\([^)]*\)$/, '');
    }

    return { name, image, price, originalPrice, promotion, platform, isDLC};
  }
  return null;
}

function formatPrice(price) {
  if (!price) return null;
  return price.replace('Preço promocional', '').replace('Preço normal', '').replace('R$', 'R$').trim();
}

// Carrega as URLs a serem raspadas a partir do arquivo config.json
const urls = config.urls;

// Inicia a raspagem e programa a próxima execução
scrapeGames(urls);
