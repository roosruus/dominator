import _merge from 'lodash/merge';

export const GROUP_TYPE_SET = 'set';
export const GROUP_TYPE_CARD_TYPE = 'cardtype';
export const GROUP_TYPE_CATEGORY = 'category';
export const GROUP_TYPE_COST = 'cost';
export const GROUP_TYPE_PLUS_BUYS = 'plusbuys';
export const GROUP_TYPE_PLUS_CARDS = 'pluscards';
export const GROUP_TYPE_PLUS_ACTIONS = 'plusactions';

const VALID_OPERATORS = ['>', '>=', '==', '<=', '<', '!='];

export const createRules = ruleData => {
  const rules = ruleData;

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
    return group.negate ? !isCardInGroupBeforeNegate(card, group) : isCardInGroupBeforeNegate(card, group);
  };

  const isCardInGroupBeforeNegate = (card, group) => {
    switch (group.type) {
      case GROUP_TYPE_SET:
        return card.set === group.name;
      case GROUP_TYPE_CARD_TYPE:
        return card.types.includes(group.name);
      case GROUP_TYPE_CATEGORY:
        return card.categories && card.categories.includes(group.name);
      case GROUP_TYPE_COST:
      case GROUP_TYPE_PLUS_BUYS:
      case GROUP_TYPE_PLUS_CARDS:
      case GROUP_TYPE_PLUS_ACTIONS: {
        const { value, operator } = group.rule;
        if (isNaN(value) || !VALID_OPERATORS.includes(operator)) {
          return false;
        }
        let comparable = 0;
        if (group.type === GROUP_TYPE_COST && card.cost) {
          comparable = card.cost.value;
        } else if (group.type === GROUP_TYPE_PLUS_BUYS) {
          comparable = card.plusBuys;
        } else if (group.type === GROUP_TYPE_PLUS_CARDS) {
          comparable = card.plusCards;
        } else if (group.type === GROUP_TYPE_PLUS_ACTIONS) {
          comparable = card.plusActions;
        } else {
          return false;
        }
        return eval(`${comparable} ${operator} ${value}`);
      }
      default:
        return false;
    }
  };

  const includesCardWithName = (cards, name) => {
    for (let card of cards) {
      if (card.name === name) {
        return true;
      }
    }
    return false;
  };

  return {
    filterCards: cards => {
      let filteredCards = cards;
      if (rules.filters) {
        const { include } = rules.filters;
        if (include && include.groups && include.groups.length > 0) {
          filteredCards = filteredCards.filter(card => isCardInGroups(card, include.groups));
        }
        const { exclude } = rules.filters;
        if (exclude && exclude.groups) {
          filteredCards = filteredCards.filter(
            card => !exclude.specificCards.includes(card.name) && !isCardInGroups(card, exclude.groups)
          );
        }
      }
      return filteredCards;
    },
    pickCardsFromPool: cardPool => {
      const cardsToPick = rules.numKingdomCards;
      let pickedCards = [];

      // pick must-have cards
      if (rules.filters.include) {
        const { specificCards } = rules.filters.include;
        for (let i = 0; pickedCards.length < cardsToPick && i < specificCards.length; i++) {
          const requestedCard = specificCards[i];
          const pickedCard = cardPool.findCard(requestedCard);
          if (pickedCard && !includesCardWithName(pickedCards, pickedCard.name)) {
            pickedCards.push(pickedCard);
          }
        }

        const { limits } = rules.filters.include;
        for (let group of limits) {
          if (group.min) {
            let cursor = 0;
            for (
              ;
              cursor < cardPool.length &&
              pickedCards.length < cardsToPick &&
              pickedCards.filter(card => isCardInGroup(card, group)).length < group.min;
              cursor++
            ) {
              const card = cardPool.get(cursor);
              if (!includesCardWithName(pickedCards, card.name) && isCardInGroup(card, group)) {
                pickedCards.push(card);
              }
            }
          }
        }
      }

      // pick remaining cards
      for (let cursor = 0; pickedCards.length < cardsToPick && cursor < cardPool.length; cursor++) {
        let pickedCard = cardPool.get(cursor);
        let pickThisCard = true;

        if (includesCardWithName(pickedCards, pickedCard.name)) {
          pickThisCard = false;
        } else if (rules.filters.include) {
          const { groups, limits } = rules.filters.include;
          for (let limit of limits) {
            if (
              !isCardInGroups(pickedCard, groups) ||
              (isCardInGroup(pickedCard, limit) &&
                limit.max &&
                pickedCards.filter(card => isCardInGroup(card, limit)).length >= limit.max)
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
    },
    merge: otherRules => {
      return createRules(_merge({}, rules, otherRules.valueOf()));
    },
    valueOf: () => rules
  };
};
