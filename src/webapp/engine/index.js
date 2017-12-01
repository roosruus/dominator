import ALL_CARDS from '../data/cards.json';
import {shuffleArray} from './utils';
import {GROUP_TYPE_SET, GROUP_TYPE_CARD_TYPE, DEFAULT_RULES, RULES_KINGDOM_CARDS} from './rules';


export const shuffle = (customRules = {}) => {
  const rules = {...DEFAULT_RULES, ...customRules};
  let cardPool = filterCards(filterCards(ALL_CARDS, RULES_KINGDOM_CARDS), rules);
  cardPool = shuffleArray(cardPool, rules);

  const pickedCards = pickCards(cardPool, rules);
  return pickedCards;
};

const pickCards = (cardPool, rules) => {
  const pickedCards = [];

  const cardsToPick = rules.numKingdomCards;

  // pick must-have cards
  if (rules.filters.include) {
    const {specificCards} = rules.filters.include;
    for (let i = 0; pickedCards.length < cardsToPick && i < specificCards.length; i++) {
      const requestedCard = specificCards[i];
      const pickedCard = cardPool.filter((card) => card.name === requestedCard);
      if (pickedCard) {
        pickedCards.push(pickedCard);
      }
    }

    const {groups} = rules.filters.include;
    for (let group of groups) {
      console.log(`Picking cards for group ${group.name}`);
      if (group.min) {
        let cursor = 0;
        for (
          ;
          cursor < cardPool.length &&
          pickedCards.length < cardsToPick &&
          pickedCards.filter((card) => isCardInGroup(card, group)).length < group.min;
          cursor++
        ) {
          const card = cardPool[cursor];
          if (pickedCards.indexOf(card) === -1 && isCardInGroup(card, group)) {
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

    if (pickedCards.indexOf(pickedCard) !== -1) {
      pickThisCard = false;
    } else if (rules.filters.include) {
      for (let group of rules.filters.include.groups) {
        if (
          group.max &&
          isCardInGroup(pickedCard, group) &&
          pickedCards.filter((card) => isCardInGroup(card, group)).length >= group.max
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

  return pickedCards;
};

const filterCards = (cards, rules) => {
  if (rules && rules.filters && rules.filters.exclude) {
    const {exclude} = rules.filters;
    return cards.filter(
      (card) => exclude.specificCards.indexOf(card.name) === -1 && !isCardInGroups(card, exclude.groups)
    );
  }
  return cards;
};

const isCardInGroups = (card, groups) => {
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
    return card.types.indexOf(group.name) !== -1;
  }
  return false;
};
