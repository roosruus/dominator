const fs = require('fs');
const https = require('https');
const $ = require('cheerio');

const CARD_LIST_URL = 'https://dominionstrategy.com/all-cards/';
const OUTPUT_FILE = 'cards.json';

console.log(`Loading card list from ${CARD_LIST_URL} ...`);

https.get(CARD_LIST_URL, (res) => {
  let rawData = '';
  res.on('data', (chunk) => {
    rawData += chunk;
  });
  res.on('end', () => {
    console.log('Card list loaded.\n');

    const cards = [];
    const dom = $.load(rawData);
    const content = dom('#post-3041 .entry-content');
    let currentSet = '';
    content.children().each((i, child) => {
      // resolve set
      if (child.tagName === 'h2') {
        let tableTitle = $(child).text().trim();
        if (tableTitle === 'Cards Removed From Dominion 1st Edition') {
          tableTitle = 'Dominion 1st Edition';
        } else if (tableTitle === 'Cards Removed From Intrigue 1st Edition') {
          tableTitle = 'Intrigue 1st Edition';
        } else if (tableTitle.startsWith('Adventures:')) {
          tableTitle = 'Adventures';
        } else if (tableTitle.startsWith('Dark Ages:')) {
          tableTitle = 'Dark Ages';
        } else if (tableTitle.startsWith('Empires')
            || tableTitle === 'Castles') {
          tableTitle = 'Empires';
        } else if (tableTitle.startsWith('Nocturne')) {
          tableTitle = 'Nocturne';
        }
        currentSet = tableTitle;
        console.log(`Processing: ${currentSet}`);
      } else if (child.tagName === 'table') {
        // resolve cards in set
        $(child).find('tr').each((i, row) => {
          const card = {
            set: currentSet
          };
          $(row).find('td').each((i, cell) => {
            // resolve card properties
            if (i === 0) {
              const name = $(cell).text().trim();
              card.name = name;
            } else if (i === 1) {
              const types = $(cell).text().split(/-|\u2013/)
                  .map((type) => type.trim());
              card.types = types;
            } else if (i === 2) {
              const cost = $(cell).text().replace(/\D/, '');
              card.cost = parseInt(cost);
            } else if (i === 3) {
              const description = $(cell).text().trim();
              card.description = description;

              const plusCards = /\+(\d) Card/.exec(description);
              if (plusCards) {
                card.plusCards = parseInt(plusCards[1]);
              }
              const plusActions = /\+(\d) Action/.exec(description);
              if (plusActions) {
                card.plusActions = parseInt(plusActions[1]);
              }
              const plusBuys = /\+(\d) Buy/.exec(description);
              if (plusBuys) {
                card.plusBuys = parseInt(plusBuys[1]);
              }
              const plusCoins = /\+\$(\d)/.exec(description);
              if (plusCoins) {
                card.plusCoins = parseInt(plusCoins[1]);
              }

              return false;
            }
          });
          cards.push(card);
        });
      }
    });

    console.log(`Writing results to: ${OUTPUT_FILE}`);
    fs.writeFile(OUTPUT_FILE, JSON.stringify(cards, null, '  '), (err) => {
      if (err) {
        console.error(`Unable to write results: ${err}`);
      } else {
        console.log('Done.');
      }
    });
  });
}).on('error', (e) => {
  console.error(`Got error: ${e.message}`);
});
