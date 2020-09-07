export default [
  {
    name: 'Liquid market',
    description: 'Typical stair case order book. The market is liquid and a relatively small spread',
    bids: [
      {
        amount: 125,
        price: 99.99,
      },
      {
        amount: 135,
        price: 94.99,
      },
      {
        amount: 145,
        price: 89.99,
      },
      {
        amount: 155,
        price: 84.99,
      },
    ],
    asks: [
      {
        amount: 125,
        price: 100.1,
      },
      {
        amount: 135,
        price: 105.1,
      },
      {
        amount: 145,
        price: 110.1,
      },
      {
        amount: 155,
        price: 115.1,
      },
    ],
  },
  {
    name: 'Liquid market, big spread',
    description: 'Wide spread, asks/bids are large in size and stepped',
    bids: [
      {
        amount: 125,
        price: 50,
      },
      {
        amount: 135,
        price: 45,
      },
      {
        amount: 145,
        price: 35,
      },
      {
        amount: 155,
        price: 25,
      },
    ],
    asks: [
      {
        amount: 125,
        price: 150,
      },
      {
        amount: 135,
        price: 155,
      },
      {
        amount: 145,
        price: 165,
      },
      {
        amount: 155,
        price: 175,
      },
    ],
  },
  {
    name: 'Liquid market when prices fall 20%',
    description: 'The market has low volumes near the current price, it has high volumes when price drops around 20%',
    bids: [
      {
        amount: 5,
        price: 99.99,
      },
      {
        amount: 6,
        price: 94.99,
      },
      {
        amount: 7,
        price: 89.99,
      },
      {
        amount: 8,
        price: 84.99,
      },
      {
        amount: 155,
        price: 79.99,
      },
      {
        amount: 165,
        price: 74.99,
      },
    ],
    asks: [
      {
        amount: 5,
        price: 100.1,
      },
      {
        amount: 6,
        price: 105.1,
      },
      {
        amount: 7,
        price: 110.1,
      },
      {
        amount: 8,
        price: 115.1,
      },
      {
        amount: 155,
        price: 120.1,
      },
      {
        amount: 165,
        price: 125.1,
      },
    ],
  },
  {
    name: 'Liquid market when prices fall 40%',
    description: 'The market has low volumes near the current price, it has high volumes when price drops around 40%',
    bids: [
      {
        amount: 5,
        price: 99.99,
      },
      {
        amount: 6,
        price: 94.99,
      },
      {
        amount: 7,
        price: 89.99,
      },
      {
        amount: 8,
        price: 84.99,
      },
      {
        amount: 8,
        price: 79.99,
      },
      {
        amount: 8,
        price: 74.99,
      },
      {
        amount: 8, // Repeated amounts on purpose
        price: 69.99,
      },
      {
        amount: 9,
        price: 64.99,
      },
      {
        amount: 155,
        price: 59.99,
      },
      {
        amount: 165,
        price: 54.99,
      },
      {
        amount: 175,
        price: 49.99,
      },
      {
        amount: 185,
        price: 44.99,
      },
    ],
    asks: [
      {
        amount: 5,
        price: 100.1,
      },
      {
        amount: 6,
        price: 105.1,
      },
      {
        amount: 7,
        price: 110.1,
      },
      {
        amount: 8,
        price: 115.1,
      },
      {
        amount: 8,
        price: 120.1,
      },
      {
        amount: 8,
        price: 125.1,
      },
      {
        amount: 8, // Repeated amounts on purpose
        price: 130.1,
      },
      {
        amount: 9,
        price: 135.1,
      },
      {
        amount: 155,
        price: 140.1,
      },
      {
        amount: 165,
        price: 145.1,
      },
      {
        amount: 175,
        price: 150.1,
      },
      {
        amount: 185,
        price: 155.1,
      },
    ],
  },
  {
    name: 'Liquid market when prices fall 60%',
    description: 'The market has low volumes near the current price, it has high volumes when price drops around 60%',
    bids: [
      {
        amount: 5,
        price: 99.99,
      },
      {
        amount: 6,
        price: 94.99,
      },
      {
        amount: 7,
        price: 89.99,
      },
      {
        amount: 8,
        price: 84.99,
      },
      {
        amount: 9,
        price: 79.99,
      },
      {
        amount: 10,
        price: 74.99,
      },
      {
        amount: 11,
        price: 69.99,
      },
      {
        amount: 12,
        price: 64.99,
      },
      {
        amount: 13,
        price: 59.99,
      },
      {
        amount: 14,
        price: 54.99,
      },
      {
        amount: 15,
        price: 49.99,
      },
      {
        amount: 16,
        price: 44.99,
      },
      {
        amount: 150,
        price: 39.99,
      },
      {
        amount: 160,
        price: 34.99,
      },
      {
        amount: 170,
        price: 29.99,
      },
      {
        amount: 180,
        price: 24.99,
      },
    ],
    asks: [
      {
        amount: 5,
        price: 100.1,
      },
      {
        amount: 6,
        price: 105.1,
      },
      {
        amount: 7,
        price: 110.1,
      },
      {
        amount: 8,
        price: 115.1,
      },
      {
        amount: 9,
        price: 120.1,
      },
      {
        amount: 10,
        price: 125.1,
      },
      {
        amount: 11,
        price: 130.1,
      },
      {
        amount: 12,
        price: 135.1,
      },
      {
        amount: 13,
        price: 140.1,
      },
      {
        amount: 14,
        price: 145.1,
      },
      {
        amount: 15,
        price: 150.1,
      },
      {
        amount: 16,
        price: 155.1,
      },
      {
        amount: 150,
        price: 160.1,
      },
      {
        amount: 160,
        price: 165.1,
      },
      {
        amount: 170,
        price: 170.1,
      },
      {
        amount: 180,
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
        amount: 4,
        price: 105,
      },
      {
        amount: 6,
        price: 100,
      },
      {
        amount: 7,
        price: 90,
      },
      {
        amount: 25,
        price: 85,
      },
      {
        amount: 27,
        price: 80,
      },
    ],
    asks: [
      {
        amount: 4,
        price: 95,
      },
      {
        amount: 6,
        price: 100,
      },
      {
        amount: 7,
        price: 110,
      },
      {
        amount: 25,
        price: 115,
      },
      {
        amount: 27,
        price: 120,
      },
    ],
  },
  {
    name: 'High volume overlap',
    description:
      'Market overlaps at a high volume, will maintain similar amounts throught for large volume perspective',
    bids: [
      {
        amount: 1000,
        price: 105,
      },
      {
        amount: 1010,
        price: 100,
      },
      {
        amount: 1020,
        price: 90,
      },
      {
        amount: 1030,
        price: 85,
      },
      {
        amount: 1040,
        price: 80,
      },
    ],
    asks: [
      {
        amount: 1000,
        price: 95,
      },
      {
        amount: 1010,
        price: 100,
      },
      {
        amount: 1020,
        price: 110,
      },
      {
        amount: 1030,
        price: 115,
      },
      {
        amount: 1040,
        price: 120,
      },
    ],
  },
  {
    name: 'Low volume overlap, with big price difference',
    description: 'Market overlaps deeper than the previous examples',
    bids: [
      {
        amount: 4,
        price: 140,
      },
      {
        amount: 6,
        price: 130,
      },
      {
        amount: 7,
        price: 120,
      },
      {
        amount: 25,
        price: 70,
      },
      {
        amount: 27,
        price: 50,
      },
    ],
    asks: [
      {
        amount: 4,
        price: 60,
      },
      {
        amount: 6,
        price: 70,
      },
      {
        amount: 7,
        price: 80,
      },
      {
        amount: 25,
        price: 130,
      },
      {
        amount: 27,
        price: 150,
      },
    ],
  },
  {
    name: 'High volume overlap, with big price difference',
    description: 'High volume markets overlap ',
    bids: [
      {
        amount: 1000,
        price: 140,
      },
      {
        amount: 1010,
        price: 130,
      },
      {
        amount: 1020,
        price: 120,
      },
      {
        amount: 1030,
        price: 70,
      },
      {
        amount: 1040,
        price: 50,
      },
    ],
    asks: [
      {
        amount: 1000,
        price: 60,
      },
      {
        amount: 1010,
        price: 70,
      },
      {
        amount: 1020,
        price: 80,
      },
      {
        amount: 1030,
        price: 130,
      },
      {
        amount: 1040,
        price: 150,
      },
    ],
  },
  {
    name: 'Spread is almost non-existent 0.000000000000001%',
    description: 'liquid market with tiny spread',
    bids: [
      {
        amount: 125,
        price: 99.999999999999999999,
      },
      {
        amount: 126,
        price: 94.99,
      },
      {
        amount: 127,
        price: 89.99,
      },
      {
        amount: 128,
        price: 84.99,
      },
    ],
    asks: [
      {
        amount: 125,
        price: 100,
      },
      {
        amount: 126,
        price: 105.1,
      },
      {
        amount: 127,
        price: 110.1,
      },
      {
        amount: 128,
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
        amount: 1,
        price: 99.99,
      },
      {
        amount: 2,
        price: 94.99,
      },
      {
        amount: 3,
        price: 89.99,
      },
      {
        amount: 4,
        price: 84.99,
      },
    ],
    asks: [
      {
        amount: 125,
        price: 100.1,
      },
      {
        amount: 135,
        price: 105.1,
      },
      {
        amount: 145,
        price: 110.1,
      },
      {
        amount: 155,
        price: 115.1,
      },
    ],
  },
  {
    name: 'Asks liquid, Bids illiquid',
    description: 'Typical stair case order book. The market is liquid and a relatively small spread',
    bids: [
      {
        amount: 125,
        price: 99.99,
      },
      {
        amount: 135,
        price: 94.99,
      },
      {
        amount: 145,
        price: 89.99,
      },
      {
        amount: 155,
        price: 84.99,
      },
    ],
    asks: [
      {
        amount: 1,
        price: 100.1,
      },
      {
        amount: 2,
        price: 105.1,
      },
      {
        amount: 3,
        price: 110.1,
      },
      {
        amount: 4,
        price: 115.1,
      },
    ],
  },
  {
    name: 'Asks liquid in the edges, Bids illiquid',
    description: 'Big volume on the edge of the sell side, low volume on bid side',
    bids: [
      {
        amount: 5,
        price: 99.99,
      },
      {
        amount: 6,
        price: 94.99,
      },
      {
        amount: 7,
        price: 89.99,
      },
      {
        amount: 8,
        price: 84.99,
      },
      {
        amount: 8,
        price: 79.99,
      },
      {
        amount: 8,
        price: 74.99,
      },
    ],
    asks: [
      {
        amount: 5,
        price: 100.1,
      },
      {
        amount: 6,
        price: 105.1,
      },
      {
        amount: 7,
        price: 110.1,
      },
      {
        amount: 8,
        price: 115.1,
      },
      {
        amount: 500,
        price: 120.1,
      },
      {
        amount: 503,
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
        amount: 5,
        price: 99.99,
      },
      {
        amount: 6,
        price: 94.99,
      },
      {
        amount: 7,
        price: 89.99,
      },
      {
        amount: 8,
        price: 84.99,
      },
      {
        amount: 500,
        price: 79.99,
      },
      {
        amount: 503,
        price: 74.99,
      },
    ],
    asks: [
      {
        amount: 5,
        price: 100.1,
      },
      {
        amount: 6,
        price: 105.1,
      },
      {
        amount: 7,
        price: 110.1,
      },
      {
        amount: 8,
        price: 115.1,
      },
      {
        amount: 8,
        price: 120.1,
      },
      {
        amount: 8,
        price: 125.1,
      },
    ],
  },
  {
    name: 'No bids',
    description: 'self explanatory',
    bids: [
      {
        amount: 125,
        price: 99.99,
      },
      {
        amount: 135,
        price: 94.99,
      },
      {
        amount: 145,
        price: 89.99,
      },
      {
        amount: 155,
        price: 84.99,
      },
    ],
  },
  {
    name: 'No asks',
    description: 'self explanatory',
    asks: [
      {
        amount: 125,
        price: 100.1,
      },
      {
        amount: 135,
        price: 105.1,
      },
      {
        amount: 145,
        price: 110.1,
      },
      {
        amount: 155,
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
