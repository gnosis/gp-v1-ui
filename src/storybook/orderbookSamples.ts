export default [
  {
    name: 'Liquid market',
    description: 'Typical stair case order book. The market is liquid and a relatively small spread',
    bids: [
      {
        volume: 125,
        price: 99.99,
      },
      {
        volume: 135,
        price: 94.99,
      },
      {
        volume: 145,
        price: 89.99,
      },
      {
        volume: 155,
        price: 84.99,
      },
    ],
    asks: [
      {
        volume: 125,
        price: 100.1,
      },
      {
        volume: 135,
        price: 105.1,
      },
      {
        volume: 145,
        price: 110.1,
      },
      {
        volume: 155,
        price: 115.1,
      },
    ],
  },
  {
    name: 'Liquid market, big spread',
    description: 'Wide spread, asks/bids are large in size and stepped',
    bids: [
      {
        volume: 125,
        price: 50,
      },
      {
        volume: 135,
        price: 45,
      },
      {
        volume: 145,
        price: 35,
      },
      {
        volume: 155,
        price: 25,
      },
    ],
    asks: [
      {
        volume: 125,
        price: 150,
      },
      {
        volume: 135,
        price: 155,
      },
      {
        volume: 145,
        price: 165,
      },
      {
        volume: 155,
        price: 175,
      },
    ],
  },
  {
    name: 'Liquid market when prices fall 20%',
    description: 'The market has low volumes near the current price, it has high volumes when price drops around 20%',
    bids: [
      {
        volume: 5,
        price: 99.99,
      },
      {
        volume: 6,
        price: 94.99,
      },
      {
        volume: 7,
        price: 89.99,
      },
      {
        volume: 8,
        price: 84.99,
      },
      {
        volume: 155,
        price: 79.99,
      },
      {
        volume: 165,
        price: 74.99,
      },
    ],
    asks: [
      {
        volume: 5,
        price: 100.1,
      },
      {
        volume: 6,
        price: 105.1,
      },
      {
        volume: 7,
        price: 110.1,
      },
      {
        volume: 8,
        price: 115.1,
      },
      {
        volume: 155,
        price: 120.1,
      },
      {
        volume: 165,
        price: 125.1,
      },
    ],
  },
  {
    name: 'Liquid market when prices fall 40%',
    description: 'The market has low volumes near the current price, it has high volumes when price drops around 40%',
    bids: [
      {
        volume: 5,
        price: 99.99,
      },
      {
        volume: 6,
        price: 94.99,
      },
      {
        volume: 7,
        price: 89.99,
      },
      {
        volume: 8,
        price: 84.99,
      },
      {
        volume: 8,
        price: 79.99,
      },
      {
        volume: 8,
        price: 74.99,
      },
      {
        volume: 8, // Repeated volumes on purpose
        price: 69.99,
      },
      {
        volume: 9,
        price: 64.99,
      },
      {
        volume: 155,
        price: 59.99,
      },
      {
        volume: 165,
        price: 54.99,
      },
      {
        volume: 175,
        price: 49.99,
      },
      {
        volume: 185,
        price: 44.99,
      },
    ],
    asks: [
      {
        volume: 5,
        price: 100.1,
      },
      {
        volume: 6,
        price: 105.1,
      },
      {
        volume: 7,
        price: 110.1,
      },
      {
        volume: 8,
        price: 115.1,
      },
      {
        volume: 8,
        price: 120.1,
      },
      {
        volume: 8,
        price: 125.1,
      },
      {
        volume: 8, // Repeated volumes on purpose
        price: 130.1,
      },
      {
        volume: 9,
        price: 135.1,
      },
      {
        volume: 155,
        price: 140.1,
      },
      {
        volume: 165,
        price: 145.1,
      },
      {
        volume: 175,
        price: 150.1,
      },
      {
        volume: 185,
        price: 155.1,
      },
    ],
  },
  {
    name: 'Liquid market with very high volume and high price in the asks',
    description: 'Self explanatory',
    bids: [
      {
        volume: 5,
        price: 99.99,
      },
      {
        volume: 6,
        price: 94.99,
      },
      {
        volume: 7,
        price: 89.99,
      },
      {
        volume: 8,
        price: 84.99,
      },
      {
        volume: 9,
        price: 79.99,
      },
      {
        volume: 10,
        price: 74.99,
      },
      {
        volume: 11,
        price: 69.99,
      },
      {
        volume: 12,
        price: 64.99,
      },
      {
        volume: 13,
        price: 59.99,
      },
      {
        volume: 14,
        price: 54.99,
      },
      {
        volume: 15,
        price: 49.99,
      },
      {
        volume: 16,
        price: 44.99,
      },
      {
        volume: 150,
        price: 39.99,
      },
      {
        volume: 160,
        price: 34.99,
      },
      {
        volume: 170,
        price: 29.99,
      },
      {
        volume: 180,
        price: 24.99,
      },
    ],
    asks: [
      {
        volume: 5,
        price: 100.1,
      },
      {
        volume: 6,
        price: 105.1,
      },
      {
        volume: 7,
        price: 110.1,
      },
      {
        volume: 8,
        price: 115.1,
      },
      {
        volume: 9,
        price: 120.1,
      },
      {
        volume: 10,
        price: 125.1,
      },
      {
        volume: 11,
        price: 130.1,
      },
      {
        volume: 12,
        price: 135.1,
      },
      {
        volume: 13,
        price: 140.1,
      },
      {
        volume: 14,
        price: 145.1,
      },
      {
        volume: 15,
        price: 150.1,
      },
      {
        volume: 16,
        price: 155.1,
      },
      {
        volume: 150,
        price: 160.1,
      },
      {
        volume: 160,
        price: 165.1,
      },
      {
        volume: 170,
        price: 170.1,
      },
      {
        volume: 1800000,
        price: 175.1,
      },
    ],
  },
  {
    name: 'Low volume overlap',
    description:
      'The market overlaps with not very high volume, more volume is added in furthest bids/asks to add perspective',
    bids: [
      {
        volume: 4,
        price: 105,
      },
      {
        volume: 6,
        price: 100,
      },
      {
        volume: 7,
        price: 90,
      },
      {
        volume: 25,
        price: 85,
      },
      {
        volume: 27,
        price: 80,
      },
    ],
    asks: [
      {
        volume: 4,
        price: 95,
      },
      {
        volume: 6,
        price: 100,
      },
      {
        volume: 7,
        price: 110,
      },
      {
        volume: 25,
        price: 115,
      },
      {
        volume: 27,
        price: 120,
      },
    ],
  },
  {
    name: 'High volume overlap',
    description:
      'Market overlaps at a high volume, will maintain similar volumes throught for large volume perspective',
    bids: [
      {
        volume: 1000,
        price: 105,
      },
      {
        volume: 1010,
        price: 100,
      },
      {
        volume: 1020,
        price: 90,
      },
      {
        volume: 1030,
        price: 85,
      },
      {
        volume: 1040,
        price: 80,
      },
    ],
    asks: [
      {
        volume: 1000,
        price: 95,
      },
      {
        volume: 1010,
        price: 100,
      },
      {
        volume: 1020,
        price: 110,
      },
      {
        volume: 1030,
        price: 115,
      },
      {
        volume: 1040,
        price: 120,
      },
    ],
  },
  {
    name: 'Low volume overlap, with big price difference',
    description: 'Market overlaps deeper than the previous examples',
    bids: [
      {
        volume: 4,
        price: 140,
      },
      {
        volume: 6,
        price: 130,
      },
      {
        volume: 7,
        price: 120,
      },
      {
        volume: 25,
        price: 70,
      },
      {
        volume: 27,
        price: 50,
      },
    ],
    asks: [
      {
        volume: 4,
        price: 60,
      },
      {
        volume: 6,
        price: 70,
      },
      {
        volume: 7,
        price: 80,
      },
      {
        volume: 25,
        price: 130,
      },
      {
        volume: 27,
        price: 150,
      },
    ],
  },
  {
    name: 'High volume overlap, with big price difference',
    description: 'High volume markets overlap ',
    bids: [
      {
        volume: 1000,
        price: 140,
      },
      {
        volume: 1010,
        price: 130,
      },
      {
        volume: 1020,
        price: 120,
      },
      {
        volume: 1030,
        price: 70,
      },
      {
        volume: 1040,
        price: 50,
      },
    ],
    asks: [
      {
        volume: 1000,
        price: 60,
      },
      {
        volume: 1010,
        price: 70,
      },
      {
        volume: 1020,
        price: 80,
      },
      {
        volume: 1030,
        price: 130,
      },
      {
        volume: 1040,
        price: 150,
      },
    ],
  },
  {
    name: 'Spread is almost non-existent 0.000000000000001%',
    description: 'liquid market with tiny spread',
    bids: [
      {
        volume: 125,
        price: 99.999999999999999999,
      },
      {
        volume: 126,
        price: 94.99,
      },
      {
        volume: 127,
        price: 89.99,
      },
      {
        volume: 128,
        price: 84.99,
      },
    ],
    asks: [
      {
        volume: 125,
        price: 100,
      },
      {
        volume: 126,
        price: 105.1,
      },
      {
        volume: 127,
        price: 110.1,
      },
      {
        volume: 128,
        price: 115.1,
      },
    ],
  },
  {
    // current current
    name: 'Bids liquid, Asks illiquid',
    description: 'Self explanatory, as usual',
    bids: [
      {
        volume: 1,
        price: 99.99,
      },
      {
        volume: 2,
        price: 94.99,
      },
      {
        volume: 3,
        price: 89.99,
      },
      {
        volume: 4,
        price: 84.99,
      },
    ],
    asks: [
      {
        volume: 125,
        price: 100.1,
      },
      {
        volume: 135,
        price: 105.1,
      },
      {
        volume: 145,
        price: 110.1,
      },
      {
        volume: 155,
        price: 115.1,
      },
    ],
  },
  {
    name: 'Asks liquid, Bids illiquid',
    description: 'Typical stair case order book. The market is liquid and a relatively small spread',
    bids: [
      {
        volume: 125,
        price: 99.99,
      },
      {
        volume: 135,
        price: 94.99,
      },
      {
        volume: 145,
        price: 89.99,
      },
      {
        volume: 155,
        price: 84.99,
      },
    ],
    asks: [
      {
        volume: 1,
        price: 100.1,
      },
      {
        volume: 2,
        price: 105.1,
      },
      {
        volume: 3,
        price: 110.1,
      },
      {
        volume: 4,
        price: 115.1,
      },
    ],
  },
  {
    name: 'Asks liquid in the edges, Bids illiquid',
    description: 'Big volume on the edge of the sell side, low volume on bid side',
    bids: [
      {
        volume: 5,
        price: 99.99,
      },
      {
        volume: 6,
        price: 94.99,
      },
      {
        volume: 7,
        price: 89.99,
      },
      {
        volume: 8,
        price: 84.99,
      },
      {
        volume: 8,
        price: 79.99,
      },
      {
        volume: 8,
        price: 74.99,
      },
    ],
    asks: [
      {
        volume: 5,
        price: 100.1,
      },
      {
        volume: 6,
        price: 105.1,
      },
      {
        volume: 7,
        price: 110.1,
      },
      {
        volume: 8,
        price: 115.1,
      },
      {
        volume: 500,
        price: 120.1,
      },
      {
        volume: 503,
        price: 125.1,
      },
    ],
  },
  {
    // current
    name: 'Bids liquid in the edges, Asks illiquid',
    description: 'Big volume on the edge of the buy side, low volume on sell side',
    bids: [
      {
        volume: 5,
        price: 99.99,
      },
      {
        volume: 6,
        price: 94.99,
      },
      {
        volume: 7,
        price: 89.99,
      },
      {
        volume: 8,
        price: 84.99,
      },
      {
        volume: 500,
        price: 79.99,
      },
      {
        volume: 503,
        price: 74.99,
      },
    ],
    asks: [
      {
        volume: 5,
        price: 100.1,
      },
      {
        volume: 6,
        price: 105.1,
      },
      {
        volume: 7,
        price: 110.1,
      },
      {
        volume: 8,
        price: 115.1,
      },
      {
        volume: 8,
        price: 120.1,
      },
      {
        volume: 8,
        price: 125.1,
      },
    ],
  },
  {
    name: 'No bids',
    description: 'self explanatory',
    bids: [
      {
        volume: 125,
        price: 99.99,
      },
      {
        volume: 135,
        price: 94.99,
      },
      {
        volume: 145,
        price: 89.99,
      },
      {
        volume: 155,
        price: 84.99,
      },
    ],
  },
  {
    name: 'No asks',
    description: 'self explanatory',
    asks: [
      {
        volume: 125,
        price: 100.1,
      },
      {
        volume: 135,
        price: 105.1,
      },
      {
        volume: 145,
        price: 110.1,
      },
      {
        volume: 155,
        price: 115.1,
      },
    ],
  },
  {
    name: 'No bids and no asks',
    // ... :o
  },
  // ... in general, we need to create markets where we play with where the liquidity is, we can define cases where big chunks of it is a big price falls
]
