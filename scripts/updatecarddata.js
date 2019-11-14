const fs = require('fs');
const https = require('https');
const $ = require('cheerio');

const CARD_LIST_URL = 'https://dominionstrategy.com/all-cards/';
const OUTPUT_FILE = './src/webapp/data/cards.json';

const DOMINION_1ST_ED_NAME = 'Dominion 1st Edition';
const DOMINION_2ND_ED_NAME = 'Dominion 2nd Edition';
const INTRIGUE_1ST_ED_NAME = 'Intrigue 1st Edition';
const INTRIGUE_2ND_ED_NAME = 'Intrigue 2nd Edition';

const DOMINION_2ND_ED_ONLY = [
  'Harbinger',
  'Merchant',
  'Vassal',
  'Poacher',
  'Bandit',
  'Sentry',
  'Artisan'
];
const INTRIGUE_2ND_ED_ONLY = [
  'Lurker',
  'Diplomat',
  'Mill',
  'Secret Passage',
  'Courtier',
  'Patrol',
  'Replace'
];

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
    let tableTitle = '';
    content.children().each((i, child) => {
      // resolve set
      if (child.tagName === 'h2') {
        tableTitle = $(child).text().trim().replace(/\s/g, ' ');
        if (tableTitle === 'Cards Removed From Dominion 1st Edition') {
          currentSet = 'Dominion 1st Edition';
        } else if (tableTitle === 'Cards Removed From Intrigue 1st Edition') {
          currentSet = 'Intrigue 1st Edition';
        } else if (tableTitle.startsWith('Adventures:')) {
          currentSet = 'Adventures';
        } else if (tableTitle.startsWith('Dark Ages:')) {
          currentSet = 'Dark Ages';
        } else if (tableTitle.startsWith('Empires') || tableTitle === 'Castles') {
          currentSet = 'Empires';
        } else if (tableTitle.startsWith('Nocturne')) {
          currentSet = 'Nocturne';
        } else if (tableTitle.startsWith('Renaissance')) {
          currentSet = 'Renaissance';
        } else {
          currentSet = tableTitle;
        }
        console.log(`Processing: ${tableTitle}`);
      } else if (child.tagName === 'table') {
        // resolve cards in set
        $(child).find('tr').each((i, row) => {
          const card = {
            set: currentSet
          };
          $(row).find('td').each((i, cell) => {
            const cellText = $(cell).text().replace(/\u2019/g, '\'').trim();
            // resolve card properties
            if (i === 0) {
              if(!cellText && currentSet === 'Intrigue 2nd Edition') {
                // Fix card name missing in the source data
                card.name = 'Lurker';
              }
              else {
                card.name = cellText;
              }
            } else if (i === 1) {
              const types = cellText.split(/-|\u2013/).map((type) => type.trim());
              card.types = types;
            } else if (i === 2 && tableTitle !== 'Renaissance Artifacts') {
              const cost = /\$?(\d+)(◉|D)?/.exec(cellText);
              if (cost) {
                let type;
                if(cost[2] === '◉') {
                  type = 'potion';
                }
                else if(cost[2] === 'D') {
                  type = 'debt';
                }
                else {
                  type = 'money';
                }
                
                card.cost = {
                  value: parseInt(cost[1]),
                  type
                };
              }
            } else if (i === 3 || (i === 2 && tableTitle === 'Renaissance Artifacts')) {
              const description = cellText;
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
              
              const categories = [];
              const gainSpoils = /gain . spoils/i.exec(description);
              if(gainSpoils) {
                categories.push('gainspoils');
              }
              const gainCurse = /gains? a curse/i.exec(description);
              if(gainCurse) {
                categories.push('gaincurse');
              }
              const handReducing = new RegExp(
                'each other player [\\w\\s,]*' +
                '(puts [\\w\\s]+ on(to)? (his|their) deck|discards (down to|their hand|\\d cards|a copy of))', 'i'
              ).exec(description);
              if(handReducing) {
                categories.push('handreducing');
              }
              if(categories.length > 0) {
                card.categories = categories;
              }

              return false;
            }
          });
          
          // Check if split pile and add reference
          const partOf = getPartOf(card);
          if(partOf) {
            card.partOf = partOf;
          }
          
          // Not a card
          if(card.name === 'Shelters') {
            return;
          }
          // Fix types and cost for Knights
          else if(card.name === 'Knights') {
            card.types = ['Action', 'Attack', 'Victory', 'Knight'];
            card.cost = {
              value: 5,
              type: 'money'
            };
          }
          // Fix missing description for Taxman
          else if(card.name === 'Taxman') {
            card.description = 'You may trash a Treasure from your hand. ' +
              'Each other player with 5 or more cards in hand discards a copy of it (or reveals a hand without it). ' +
              'Gain a Treasure card costing up to $3 more than the trashed card, putting it on top of your deck.';
          }
          cards.push(card);
          // add common Dominion cards to 1st edition
          if (card.set === DOMINION_2ND_ED_NAME && DOMINION_2ND_ED_ONLY.indexOf(card.name) === -1) {
            cards.push(Object.assign({}, card, {set: DOMINION_1ST_ED_NAME}));
          }
          // add common Intrigue cards to 1st edition
          if (card.set === INTRIGUE_2ND_ED_NAME && INTRIGUE_2ND_ED_ONLY.indexOf(card.name) === -1) {
            cards.push(Object.assign({}, card, {set: INTRIGUE_1ST_ED_NAME}));
          }
        });
      }
    });
    
    // Add cards representing piles consisting of other cards
    const shelters = {
      name: 'Shelters',
      set: 'Dark Ages',
      types: ['Shelter'],
      cost: {
        type: 'money',
        value: 1
      }
    };
    cards.push(shelters);
    
    const ruins = {
      name: 'Ruins',
      set: 'Dark Ages',
      types: ['Ruins'],
      cost: {
        type: 'money',
        value: 0
      }
    };
    cards.push(ruins);

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

const getPartOf = card => {
  let partOf;
  if(card.types.includes('Knight')) {
    partOf = 'Knights';
  } else if(['Hovel', 'Necropolis', 'Overgrown Estate'].includes(card.name)) {
    partOf = 'Shelters';
  } else if(card.types.includes('Ruins')) {
    partOf = 'Ruins';
  } else if(card.name === 'Avanto') {
    partOf = 'Sauna';
  } else if(card.name === 'Plunder') {
    partOf = 'Encampment';
  } else if(card.name === 'Emporium') {
    partOf = 'Patrician';
  } else if(card.name === 'Bustling Village') {
    partOf = 'Settlers';
  } else if(card.name === 'Rocks') {
    partOf = 'Catapult';
  } else if(card.name === 'Fortune') {
    partOf = 'Gladiator';
  }
  return partOf;
};
