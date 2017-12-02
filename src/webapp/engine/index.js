import { shuffleArray } from './utils';
import { GROUP_TYPE_SET, GROUP_TYPE_CARD_TYPE, DEFAULT_RULES, RULES_KINGDOM_CARDS } from './rules';

export const shuffle = (allCards, customRules = {}) => {
  const rules = {
    ...DEFAULT_RULES,
    ...customRules
  };
  let cardPool = filterCards(filterCards(allCards, RULES_KINGDOM_CARDS), rules);
  cardPool = shuffleArray(cardPool, rules);

  const pickedCards = pickCards(cardPool, rules, allCards);
  return pickedCards;
};

const pickCards = (cardPool, rules, allCards) => {
  let pickedCards = [];

  const cardsToPick = rules.numKingdomCards;

  // pick must-have cards
  if (rules.filters.include) {
    const { specificCards } = rules.filters.include;
    for (let i = 0; pickedCards.length < cardsToPick && i < specificCards.length; i++) {
      const requestedCard = specificCards[i];
      const pickedCard = findCard(requestedCard, cardPool);
      if (pickedCard) {
        pickedCards.push(pickedCard);
      }
    }

    const { groups } = rules.filters.include;
    for (let group of groups) {
      if (group.min) {
        let cursor = 0;
        for (
          ;
          cursor < cardPool.length &&
          pickedCards.length < cardsToPick &&
          pickedCards.filter(card => isCardInGroup(card, group)).length < group.min;
          cursor++
        ) {
          const card = cardPool[cursor];
          if (!pickedCards.includes(card) && isCardInGroup(card, group)) {
            pickedCards.push(card);
          }
        }
      }
    }
  }

  // pick remaining cards
  for (let cursor = 0; pickedCards.length < cardsToPick && cursor < cardPool.length; cursor++) {
    let pickedCard = cardPool[cursor];
    let pickThisCard = true;

    if (pickedCards.includes(pickedCard)) {
      pickThisCard = false;
    } else if (rules.filters.include) {
      for (let group of rules.filters.include.groups) {
        if (
          group.max &&
          isCardInGroup(pickedCard, group) &&
          pickedCards.filter(card => isCardInGroup(card, group)).length >= group.max
        ) {
          pickThisCard = false;
          break;
        }
      }
    }

    if (pickThisCard) {
      pickedCards.push(pickedCard);
    }
  }

  // add additional Prosperity cards
  pickedCards = addProsperityCards(pickedCards, allCards);

  // add additional Dark Ages cards
  pickedCards = addDarkAgesCards(pickedCards, allCards);

  return pickedCards;
};

const findCards = (names, cardPool) => {
  return names.map(name => findCard(name, cardPool));
};

const findCard = (name, cardPool) => {
  for (const card of cardPool) {
    if (card.name === name) {
      return card;
    }
  }
};

const filterCards = (cards, rules) => {
  let filteredCards = cards;
  if (rules && rules.filters) {
    if (rules.filters.include) {
      const { include } = rules.filters;
      filteredCards = filteredCards.filter(card => isCardInGroups(card, include.groups));
    }
    if (rules.filters.exclude) {
      const { exclude } = rules.filters;
      filteredCards = filteredCards.filter(
        card => !exclude.specificCards.includes(card.name) && !isCardInGroups(card, exclude.groups)
      );
    }
  }
  return filteredCards;
};

const isCardInGroups = (card, groups) => {
  if (!card || !groups) {
    return false;
  }
  for (let group of groups) {
    if (isCardInGroup(card, group)) {
      return true;
    }
  }
  return false;
};

const isCardInGroup = (card, group) => {
  if (group.type === GROUP_TYPE_SET) {
    return card.set === group.name;
  } else if (group.type === GROUP_TYPE_CARD_TYPE) {
    return card.types.includes(group.name);
  }
  return false;
};

const addProsperityCards = (cards, allCards) => {
  const numProsperityCards = cards.filter(card => card.set === 'Prosperity').length;
  // include prosperity Platinum and Colony based on number of Prosperity cards in the deck
  const includeProsperityCards = Math.random() < numProsperityCards / cards.length;
  if (includeProsperityCards) {
    return [...cards, ...findCards(['Platinum', 'Colony'], allCards)];
  }
  return cards;
};

const addDarkAgesCards = (cards, allCards) => {
  const additionalCards = [];
  const hasLooter = !!cards.find(card => card.types.includes('Looter'));
  if (hasLooter) {
    additionalCards.push(
      ...findCards(['Abandoned Mine', 'Ruined Library', 'Ruined Market', 'Ruined Village', 'Survivors'], allCards)
    );
  }
  
  const hasGainSpoils = !!cards.find(card => card.categories && card.categories.includes('gainspoils'));
  if (hasGainSpoils) {
    additionalCards.push(findCard('Spoils', allCards));
  }
  
  const hasHermit = !!cards.find(card => card.name === 'Hermit');
  if(hasHermit) {
    additionalCards.push(findCard('Madman', allCards));
  }
  
  const hasUrchin = !!cards.find(card => card.name === 'Urchin');
  if(hasUrchin) {
    additionalCards.push(findCard('Mercenary', allCards));
  }
  
  return [...cards, ...additionalCards];
};
