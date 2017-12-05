import { shuffleArray } from './utils';
import { DEFAULT_RULES, RULES_KINGDOM_CARDS } from './rules/index';
import ALL_CARDS from '../data/cards.json';

const createCardPool = cards => {
  const findCard = name => {
    for (const card of cards) {
      if (card.name === name) {
        return card;
      }
    }
  };

  const findCards = names => {
    return names.map(name => findCard(name));
  };

  return {
    get length() {
      return cards.length;
    },
    [Symbol.iterator]: cards[Symbol.iterator],
    get: i => cards[i],
    findCard,
    findCards,
    filterCards: rules => createCardPool(rules ? rules.filterCards(cards) : cards),
    shuffle: () => createCardPool(shuffleArray(cards)),
    toString: () => cards.toString(),
    valueOf: () => cards
  };
};

export const createGameSetup = (rules, allCards = ALL_CARDS) => {
  allCards = createCardPool(allCards);
  rules = DEFAULT_RULES.merge(rules);
  const cardPool = allCards.filterCards(RULES_KINGDOM_CARDS).filterCards(rules);

  const addProsperityCards = cards => {
    const numProsperityCards = cards.filter(card => card.set === 'Prosperity').length;
    // include prosperity Platinum and Colony based on number of Prosperity cards in the deck
    const includeProsperityCards = Math.random() < numProsperityCards / cards.length;
    if (includeProsperityCards) {
      return [...cards, ...allCards.findCards(['Platinum', 'Colony'])];
    }
    return cards;
  };

  const addDarkAgesCards = cards => {
    const additionalCards = [];
    const hasLooter = !!cards.find(card => card.types.includes('Looter'));
    if (hasLooter) {
      additionalCards.push(
        ...allCards.findCards(['Abandoned Mine', 'Ruined Library', 'Ruined Market', 'Ruined Village', 'Survivors'])
      );
    }

    const hasGainSpoils = !!cards.find(card => card.categories && card.categories.includes('gainspoils'));
    if (hasGainSpoils) {
      additionalCards.push(allCards.findCard('Spoils'));
    }

    const hasHermit = !!cards.find(card => card.name === 'Hermit');
    if (hasHermit) {
      additionalCards.push(allCards.findCard('Madman'));
    }

    const hasUrchin = !!cards.find(card => card.name === 'Urchin');
    if (hasUrchin) {
      additionalCards.push(allCards.findCard('Mercenary'));
    }

    return [...cards, ...additionalCards];
  };

  return {
    pickCards: () => {
      let pickedCards = rules.pickCardsFromPool(cardPool.shuffle());

      // add additional Prosperity cards
      pickedCards = addProsperityCards(pickedCards);

      // add additional Dark Ages cards
      pickedCards = addDarkAgesCards(pickedCards);

      return pickedCards;
    }
  };
};
