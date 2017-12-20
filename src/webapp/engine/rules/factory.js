import _merge from 'lodash/merge';

export const GROUP_TYPE_SET = 'set';
export const GROUP_TYPE_CARD_TYPE = 'cardtype';

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
    if (group.type === GROUP_TYPE_SET) {
      return card.set === group.name;
    } else if (group.type === GROUP_TYPE_CARD_TYPE) {
      return card.types.includes(group.name);
    }
    return false;
  };
  
  const includesCardWithName = (cards, name) => {
    for(let card of cards) {
      if(card.name === name) {
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

        if (pickThisCard && !includesCardWithName(pickedCards, pickedCard.name)) {
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
