import { describe, expect, it } from 'vitest';

import { createGameSetup, getExpansions } from '.';
import { ALL_CARDS } from '../data';
import { RULES_KINGDOM_CARDS } from './rules';
import { GROUP_TYPE_SET } from './rules/factory';
import { RECOMMENDED_DISJOINT_CARDS, RECOMMENDED_LIMITS } from './rules/recommended';
import { seededRandom } from '../../test/random';

const ALL_SETS = Object.keys(getExpansions());
const KINGDOM_CARD_NAMES = new Set(RULES_KINGDOM_CARDS.filterCards(ALL_CARDS).map(card => card.name));

const rulesFor = (sets, { limits = [], disjointCards = [], excluded = [], specificCards = [] } = {}) => ({
  filters: {
    include: { groups: sets.map(name => ({ type: GROUP_TYPE_SET, name })), limits, specificCards },
    exclude: { groups: [], specificCards: excluded },
    disjointCards
  }
});

const shuffle = (rules, seed, random = seededRandom(seed)) => {
  const setup = createGameSetup(rules, ALL_CARDS, random);
  const kingdomCards = setup.pickCards();
  return { kingdomCards, additionalCards: setup.getAdditionalCards() };
};

const names = cards => cards.map(card => card.name);

describe('createGameSetup', () => {
  it('picks 10 distinct kingdom cards', () => {
    const { kingdomCards } = shuffle(rulesFor(ALL_SETS), 1);
    expect(kingdomCards).toHaveLength(10);
    expect(new Set(names(kingdomCards)).size).toBe(10);
    for (const name of names(kingdomCards)) {
      expect(KINGDOM_CARD_NAMES).toContain(name);
    }
  });

  it('is repeatable for the same random source', () => {
    expect(names(shuffle(rulesFor(ALL_SETS), 42).kingdomCards)).toEqual(
      names(shuffle(rulesFor(ALL_SETS), 42).kingdomCards)
    );
  });

  it('only picks cards from the selected expansions', () => {
    const { kingdomCards } = shuffle(rulesFor(['Seaside', 'Guilds']), 7);
    expect(new Set(kingdomCards.map(card => card.set))).toEqual(new Set(['Seaside', 'Guilds']));
  });

  it('never picks excluded cards', () => {
    const seaside = Object.keys(getExpansions().Seaside);
    const excluded = seaside.slice(0, seaside.length - 12);
    for (let seed = 0; seed < 20; seed++) {
      const { kingdomCards } = shuffle(rulesFor(['Seaside'], { excluded }), seed);
      expect(names(kingdomCards).filter(name => excluded.includes(name))).toEqual([]);
    }
  });

  describe('additional cards', () => {
    // Always passes the probability checks for Platinum/Colony and Shelters.
    const alwaysInclude = () => 0;

    it('adds Potion when a card costs a potion', () => {
      const { kingdomCards, additionalCards } = shuffle(rulesFor(['Alchemy']), 3);
      expect(kingdomCards.some(card => card.cost.type === 'potion')).toBe(true);
      expect(names(additionalCards)).toContain('Potion');
    });

    it('adds Platinum and Colony for Prosperity kingdoms', () => {
      const { additionalCards } = shuffle(rulesFor(['Prosperity']), 0, alwaysInclude);
      expect(names(additionalCards)).toEqual(['Platinum', 'Colony']);
    });

    it('adds no Prosperity or Dark Ages extras without their cards', () => {
      const { additionalCards } = shuffle(rulesFor(['Seaside']), 0, alwaysInclude);
      expect(additionalCards).toEqual([]);
    });

    it('adds the Prizes for Tournament', () => {
      const { additionalCards } = shuffle(rulesFor(['Cornucopia'], { specificCards: ['Tournament'] }), 0);
      expect(names(additionalCards)).toEqual(['Bag of Gold', 'Diadem', 'Followers', 'Princess', 'Trusty Steed']);
    });

    it('adds the Dark Ages extras their cards need', () => {
      const darkAges = Object.keys(getExpansions()['Dark Ages']);
      const wanted = ['Marauder', 'Hermit', 'Urchin'];
      const excluded = darkAges.filter(name => !wanted.includes(name));
      const { kingdomCards, additionalCards } = shuffle(rulesFor(['Dark Ages'], { excluded }), 0, alwaysInclude);
      expect(names(kingdomCards).sort()).toEqual([...wanted].sort());
      expect(names(additionalCards)).toEqual(['Ruins', 'Spoils', 'Madman', 'Mercenary', 'Shelters']);
    });
  });

  describe('with recommended rules', () => {
    const rules = rulesFor(ALL_SETS, { limits: RECOMMENDED_LIMITS, disjointCards: RECOMMENDED_DISJOINT_CARDS });
    const kingdoms = Array.from({ length: 200 }, (_, seed) => shuffle(rules, seed).kingdomCards);

    it('always picks 10 cards from the full card pool', () => {
      expect(kingdoms.filter(kingdom => kingdom.length !== 10)).toEqual([]);
    });

    it('never exceeds the Attack limit', () => {
      for (const kingdom of kingdoms) {
        expect(kingdom.filter(card => card.types.includes('Attack')).length).toBeLessThanOrEqual(2);
      }
    });

    it('never picks more than one hand-reducing Attack', () => {
      for (const kingdom of kingdoms) {
        expect(kingdom.filter(card => card.categories?.includes('handreducing')).length).toBeLessThanOrEqual(1);
      }
    });

    it('never picks more than 5 terminal Action cards', () => {
      for (const kingdom of kingdoms) {
        const terminals = kingdom.filter(card => card.types.includes('Action') && !card.plusActions);
        expect(terminals.length).toBeLessThanOrEqual(5);
      }
    });

    it('never picks two cards from the same disjoint group', () => {
      for (const kingdom of kingdoms) {
        for (const group of RECOMMENDED_DISJOINT_CARDS) {
          expect(names(kingdom).filter(name => group.includes(name)).length).toBeLessThanOrEqual(1);
        }
      }
    });

    it('stays within the cost curve maximums', () => {
      const maxByCost = { 1: 1, 2: 2, 3: 3, 4: 3, 5: 4, 6: 2, 7: 1 };
      for (const kingdom of kingdoms) {
        for (const [cost, max] of Object.entries(maxByCost)) {
          expect(kingdom.filter(card => card.cost.value === Number(cost)).length).toBeLessThanOrEqual(max);
        }
      }
    });
  });
});
