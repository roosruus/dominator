import { describe, expect, it } from 'vitest';

import { ALL_CARDS } from '.';

const namesWithType = type => ALL_CARDS.filter(card => card.types.includes(type)).map(card => card.name);

describe('ALL_CARDS', () => {
  it.each([
    ['Castle', ['Castles']],
    ['Knight', ['Knights']],
    ['Ruins', ['Ruins']]
  ])('lists the %s pile once, not each card in it', (type, expected) => {
    expect(namesWithType(type)).toEqual(expected);
  });
});
