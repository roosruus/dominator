import { shuffleArray } from './utils';
import { DEFAULT_RULES, RULES_KINGDOM_CARDS } from './rules/index';
import { ALL_CARDS } from '../data';

export const getExpansions = () => {
  return ALL_CARDS.reduce((sets, card) => {
    if (!sets.includes(card.set)) {
      sets.push(card.set);
    }
    return sets;
  }, []);
};

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
  const additionalCards = [];
  let pickedCards = [];

  allCards = createCardPool(allCards);
  rules = DEFAULT_RULES.merge(rules);
  const cardPool = allCards.filterCards(RULES_KINGDOM_CARDS).filterCards(rules);

  const getAlchemyCards = cards => {
    if (cards.find(card => card.cost && card.cost.type === 'potion')) {
      additionalCards.push(allCards.findCard('Potion'));
    }
    return [];
  };

  const getProsperityCards = cards => {
    const numProsperityCards = cards.filter(card => card.set === 'Prosperity').length;
    // include prosperity Platinum and Colony based on the number of Prosperity cards in the deck
    const includeProsperityCards = Math.random() < numProsperityCards / cards.length;
    if (includeProsperityCards) {
      return allCards.findCards(['Platinum', 'Colony']);
    }
    return [];
  };

  const getCornucopiaCards = cards => {
    if (cards.find(card => card.name === 'Tournament')) {
      return allCards.findCards(['Bag of Gold', 'Diadem', 'Followers', 'Princess', 'Trusty Steed']);
    }
    return [];
  };

  const getDarkAgesCards = cards => {
    const additionalCards = [];
    const hasLooter = !!cards.find(card => card.types.includes('Looter'));
    if (hasLooter) {
      additionalCards.push(allCards.findCard('Ruins'));
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

    const numDarkAgesCards = cards.filter(card => card.set === 'Dark Ages').length;
    // include Shelters based on the number of Dark Ages cards in the deck
    const includeShelters = Math.random() < numDarkAgesCards / cards.length;
    if (includeShelters) {
      additionalCards.push(allCards.findCard('Shelters'));
    }

    return additionalCards;
  };

  const getAdditionalCards = () => additionalCards;
  const getPickedCards = () => pickedCards;

  return {
    getAdditionalCards,
    getPickedCards,
    pickCards: () => {
      pickedCards = rules.pickCardsFromPool(cardPool.shuffle());

      // add additional Alchemy cards
      additionalCards.push(...getAlchemyCards(pickedCards));

      // add additional Prosperity cards
      additionalCards.push(...getProsperityCards(pickedCards));

      // add additional Cornucopia cards
      additionalCards.push(...getCornucopiaCards(pickedCards));
      // TODO: handle Young Witch

      // add additional Dark Ages cards
      additionalCards.push(...getDarkAgesCards(pickedCards));

      return pickedCards;
    }
  };
};
