import RAW_CARDS from './cards.json';

const buildCardData = rawCards => {
  const cardData = [];
  const partials = [];
  for (let card of rawCards) {
    if (card.partOf) {
      partials.push(partials);
    } else {
      cardData.push(card);
    }
  }

  for (let partial of partials) {
    const mainCard = cardData.find(card => card.name === partial.partOf);
    if (mainCard) {
      if (!mainCard.children) {
        mainCard.children = [];
      }
      mainCard.children.push(partial);
    }
  }

  return cardData;
};

export const ALL_CARDS = buildCardData(RAW_CARDS);
