import { describe, expect, it } from 'vitest';

import { createCardPool } from '..';
import { DEFAULT_RULES } from '.';
import {
  GROUP_TYPE_CARD_TYPE,
  GROUP_TYPE_CATEGORY,
  GROUP_TYPE_COMPOUND,
  GROUP_TYPE_COST,
  GROUP_TYPE_PLUS_ACTIONS,
  GROUP_TYPE_PLUS_BUYS,
  GROUP_TYPE_PLUS_CARDS,
  GROUP_TYPE_SET,
  createRules
} from './factory';

const card = (name, props = {}) => ({
  name,
  set: 'Base',
  types: ['Action'],
  cost: { value: 3, type: 'money' },
  ...props
});

const CARDS = [
  card('Village', { plusCards: 1, plusActions: 2 }),
  card('Smithy', { cost: { value: 4, type: 'money' }, plusCards: 3 }),
  card('Market', { cost: { value: 5, type: 'money' }, plusCards: 1, plusActions: 1, plusBuys: 1 }),
  card('Militia', { types: ['Action', 'Attack'], cost: { value: 4, type: 'money' }, categories: ['handreducing'] }),
  card('Witch', { types: ['Action', 'Attack'], cost: { value: 5, type: 'money' }, categories: ['gaincurse'] }),
  card('Gardens', { types: ['Victory'], cost: { value: 4, type: 'money' } }),
  card('Lighthouse', { set: 'Seaside', types: ['Action', 'Duration'], cost: { value: 2, type: 'money' } }),
  card('Bazaar', { set: 'Seaside', cost: { value: 5, type: 'money' }, plusCards: 1, plusActions: 2 })
];

const names = cards => cards.map(c => c.name);

const rulesWith = filters => DEFAULT_RULES.merge(createRules({ filters }));

const filterNames = (include, exclude) => names(rulesWith({ include, exclude }).filterCards(CARDS));

describe('filterCards', () => {
  it('includes cards in any of the include groups', () => {
    expect(filterNames({ groups: [{ type: GROUP_TYPE_SET, name: 'Seaside' }] })).toEqual(['Lighthouse', 'Bazaar']);
  });

  it('keeps every card when there are no include groups', () => {
    expect(filterNames({ groups: [] })).toHaveLength(CARDS.length);
  });

  it('removes excluded groups and specific cards', () => {
    const exclude = { groups: [{ type: GROUP_TYPE_CARD_TYPE, name: 'Attack' }], specificCards: ['Gardens'] };
    expect(filterNames({ groups: [] }, exclude)).toEqual(['Village', 'Smithy', 'Market', 'Lighthouse', 'Bazaar']);
  });

  it('matches categories', () => {
    expect(filterNames({ groups: [{ type: GROUP_TYPE_CATEGORY, name: 'gaincurse' }] })).toEqual(['Witch']);
  });

  it('negates groups', () => {
    const groups = [{ type: GROUP_TYPE_CARD_TYPE, name: 'Action', negate: true }];
    expect(filterNames({ groups })).toEqual(['Gardens']);
  });

  it('requires every sub-group of a compound group to match', () => {
    const groups = [
      {
        type: GROUP_TYPE_COMPOUND,
        subGroups: [
          { type: GROUP_TYPE_CARD_TYPE, name: 'Attack' },
          { type: GROUP_TYPE_COST, rule: { value: 5, operator: '==' } }
        ]
      }
    ];
    expect(filterNames({ groups })).toEqual(['Witch']);
  });

  it.each([
    ['>', ['Market', 'Witch', 'Bazaar']],
    ['>=', ['Smithy', 'Market', 'Militia', 'Witch', 'Gardens', 'Bazaar']],
    ['==', ['Smithy', 'Militia', 'Gardens']],
    ['!=', ['Village', 'Market', 'Witch', 'Lighthouse', 'Bazaar']],
    ['<=', ['Village', 'Smithy', 'Militia', 'Gardens', 'Lighthouse']],
    ['<', ['Village', 'Lighthouse']]
  ])('compares cost with %s', (operator, expected) => {
    const groups = [{ type: GROUP_TYPE_COST, rule: { value: 4, operator } }];
    expect(filterNames({ groups })).toEqual(expected);
  });

  it.each([
    [GROUP_TYPE_PLUS_ACTIONS, ['Village', 'Bazaar']],
    [GROUP_TYPE_PLUS_CARDS, ['Smithy']],
    [GROUP_TYPE_PLUS_BUYS, []]
  ])('compares %s', (type, expected) => {
    const groups = [{ type, rule: { value: 2, operator: '>=' } }];
    expect(filterNames({ groups })).toEqual(expected);
  });

  it('matches nothing for an invalid operator', () => {
    const groups = [{ type: GROUP_TYPE_COST, rule: { value: 4, operator: '; alert(1)' } }];
    expect(filterNames({ groups })).toEqual([]);
  });
});

describe('pickCardsFromPool', () => {
  const ALL_SETS = [
    { type: GROUP_TYPE_SET, name: 'Base' },
    { type: GROUP_TYPE_SET, name: 'Seaside' }
  ];
  const pick = ({ include, ...filters }, numKingdomCards = 3, pool = CARDS) => {
    const rules = rulesWith({ include: { groups: ALL_SETS, ...include }, ...filters });
    return names(rules.merge(createRules({ numKingdomCards })).pickCardsFromPool(createCardPool(pool)));
  };

  it('picks the requested number of cards in pool order', () => {
    expect(pick({})).toEqual(['Village', 'Smithy', 'Market']);
  });

  it('never picks the same card twice', () => {
    expect(pick({}, 3, [CARDS[0], CARDS[0], CARDS[1], CARDS[2]])).toEqual(['Village', 'Smithy', 'Market']);
  });

  it('picks specific cards first', () => {
    expect(pick({ include: { specificCards: ['Witch'] } })).toEqual(['Witch', 'Village', 'Smithy']);
  });

  it('fills group minimums before other cards', () => {
    const limits = [{ type: GROUP_TYPE_SET, name: 'Seaside', min: 2 }];
    expect(pick({ include: { limits } })).toEqual(['Lighthouse', 'Bazaar', 'Village']);
  });

  it('respects group maximums', () => {
    const limits = [{ type: GROUP_TYPE_COST, rule: { value: 4, operator: '<=' }, min: 0, max: 1 }];
    expect(pick({ include: { limits } })).toEqual(['Village', 'Market', 'Witch']);
  });

  it('only picks cards from the include groups when limits are set', () => {
    const include = {
      groups: [{ type: GROUP_TYPE_SET, name: 'Seaside' }],
      limits: [{ type: GROUP_TYPE_SET, name: 'Seaside', min: 0, max: 10 }]
    };
    expect(pick({ include })).toEqual(['Lighthouse', 'Bazaar']);
  });

  it('respects other groups\' maximums while filling a minimum', () => {
    const limits = [
      { type: GROUP_TYPE_CARD_TYPE, name: 'Attack', min: 0, max: 1 },
      { type: GROUP_TYPE_COST, rule: { value: 4, operator: '>=' }, min: 4 }
    ];
    expect(pick({ include: { limits } }, 5)).toEqual(['Smithy', 'Market', 'Militia', 'Gardens', 'Village']);
  });

  it('does not pick disjoint cards together', () => {
    expect(pick({ disjointCards: [['Village', 'Smithy']] })).toEqual(['Village', 'Market', 'Militia']);
  });

  it('returns fewer cards when the rules cannot be satisfied', () => {
    const limits = [{ type: GROUP_TYPE_CARD_TYPE, name: 'Action', min: 0, max: 1 }];
    expect(pick({ include: { limits } }, 10)).toEqual(['Village', 'Gardens']);
  });
});
