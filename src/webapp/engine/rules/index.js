import { GROUP_TYPE_CARD_TYPE, createRules } from './factory.js';

export const DEFAULT_RULES = createRules({
  numKingdomCards: 10,
  filters: {
    include: {
      groups: [],
      limits: [],
      specificCards: []
    },
    exclude: {
      groups: [],
      specificCards: []
    }
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
        }
      ],
      specificCards: [
        'Spoils',
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
        // Knights
        'Dame Anna',
        'Dame Josephine',
        'Dame Molly',
        'Dame Natalie',
        'Dame Sylvia',
        'Sir Bailey',
        'Sir Destry',
        'Sir Martin',
        'Sir Michael',
        'Sir Vander'
      ]
    }
  }
});
