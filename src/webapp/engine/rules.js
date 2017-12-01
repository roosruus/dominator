export const GROUP_TYPE_SET = 'set';
export const GROUP_TYPE_CARD_TYPE = 'cardtype';

export const DEFAULT_RULES = {
  numKingdomCards: 10,
  filters: {
    include: {
      groups: [],
      specificCards: []
    },
    exclude: {
      groups: [],
      specificCards: []
    }
  }
};

export const RULES_KINGDOM_CARDS = {
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
        'Will-o\'-Wisp',
        'Wish',
        'Bat',
        'Imp',
        'Zombie ApprenticeZombie',
        'Zombie Mason',
        'Zombie Spy',
        'Ghost'
      ]
    }
  }
};
