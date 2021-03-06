import { GROUP_TYPE_CARD_TYPE, createRules } from './factory.js';

export const MAX_KINGDOM_CARDS = 10;

export const DEFAULT_RULES = createRules({
  numKingdomCards: MAX_KINGDOM_CARDS,
  filters: {
    include: {
      groups: [],
      limits: [],
      specificCards: []
    },
    exclude: {
      groups: [],
      specificCards: []
    },
    disjointCards: []
  }
});

export const RULES_KINGDOM_CARDS = createRules({
  filters: {
    exclude: {
      groups: [
        {
          name: 'Ruins',
          type: GROUP_TYPE_CARD_TYPE
        },
        {
          name: 'Shelter',
          type: GROUP_TYPE_CARD_TYPE
        },
        {
          name: 'Prize',
          type: GROUP_TYPE_CARD_TYPE
        },
        {
          name: 'Event',
          type: GROUP_TYPE_CARD_TYPE
        },
        {
          name: 'Landmark',
          type: GROUP_TYPE_CARD_TYPE
        },
        {
          name: 'Heirloom',
          type: GROUP_TYPE_CARD_TYPE
        },
        {
          name: 'Boon',
          type: GROUP_TYPE_CARD_TYPE
        },
        {
          name: 'Hex',
          type: GROUP_TYPE_CARD_TYPE
        },
        {
          name: 'State',
          type: GROUP_TYPE_CARD_TYPE
        },
        {
          name: 'Artifact',
          type: GROUP_TYPE_CARD_TYPE
        },
        {
          name: 'Project',
          type: GROUP_TYPE_CARD_TYPE
        }
      ],
      specificCards: [
        // Prosperity
        'Platinum',
        'Colony',
        // Alchemy
        'Potion',
        // Adventures
        'Soldier',
        'Treasure Hunter',
        'Fugitive',
        'Warrior',
        'Disciple',
        'Hero',
        'Teacher',
        'Champion',
        // Nocturne
        'Will-O\'-Wisp',
        'Wish',
        'Bat',
        'Imp',
        'Zombie Apprentice',
        'Zombie Mason',
        'Zombie Spy',
        'Ghost',
        // Dark Ages
        'Spoils',
        'Madman',
        'Mercenary',
        // Dark Ages - Knights
        'Dame Anna',
        'Dame Josephine',
        'Dame Molly',
        'Dame Natalie',
        'Dame Sylvia',
        'Sir Bailey',
        'Sir Destry',
        'Sir Martin',
        'Sir Michael',
        'Sir Vander',
        // Empires
        'Plunder',
        'Emporium',
        'Bustling Village',
        'Rocks',
        'Fortune',
        // Promo Cards
        'Avanto'
      ]
    }
  }
});
