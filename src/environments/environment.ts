export const environment = {
  production: false,
  apiUrl: 'http://localhost:4200',
  
  // API3 Configuration
  api3: {
    endpoint: 'https://api3.io/authentication',
    chainId: 137, // Polygon mainnet
    testnetChainId: 80001, // Polygon testnet
    apiKey: '', // Will be set when API3 account is created
    partners: {
      watchbox: {
        name: 'WatchBox',
        fee: 50,
        specialty: 'General',
        endpoint: 'https://api.watchbox.com/authentication'
      },
      gia: {
        name: 'GIA (Gemological Institute of America)',
        fee: 75,
        specialty: 'Diamond',
        endpoint: 'https://api.gia.edu/authentication'
      },
      rolex: {
        name: 'Rolex Service Center',
        fee: 100,
        specialty: 'Rolex',
        endpoint: 'https://api.rolex.com/service/authentication'
      },
      chrono24: {
        name: 'Chrono24 Authentication',
        fee: 60,
        specialty: 'General',
        endpoint: 'https://api.chrono24.com/authentication'
      },
      watchfinder: {
        name: 'Watchfinder & Co.',
        fee: 65,
        specialty: 'General',
        endpoint: 'https://api.watchfinder.com/authentication'
      },
      tourneau: {
        name: 'Tourneau',
        fee: 70,
        specialty: 'General',
        endpoint: 'https://api.tourneau.com/authentication'
      },
      igi: {
        name: 'IGI (International Gemological Institute)',
        fee: 65,
        specialty: 'Diamond',
        endpoint: 'https://api.igi.org/authentication'
      },
      hrd: {
        name: 'HRD Antwerp',
        fee: 80,
        specialty: 'Diamond',
        endpoint: 'https://api.hrdantwerp.com/authentication'
      },
      omega: {
        name: 'Omega Service Center',
        fee: 85,
        specialty: 'General',
        endpoint: 'https://api.omegawatches.com/service/authentication'
      },
      patek: {
        name: 'Patek Philippe Service',
        fee: 120,
        specialty: 'Vintage',
        endpoint: 'https://api.patek.com/service/authentication'
      },
      ap: {
        name: 'Audemars Piguet Service',
        fee: 110,
        specialty: 'General',
        endpoint: 'https://api.audemarspiguet.com/service/authentication'
      },
      cartier: {
        name: 'Cartier Service Center',
        fee: 90,
        specialty: 'General',
        endpoint: 'https://api.cartier.com/service/authentication'
      },
      bucherer: {
        name: 'Bucherer (Official Rolex Dealer)',
        fee: 95,
        specialty: 'Rolex',
        endpoint: 'https://api.bucherer.com/authentication'
      },
      phillips: {
        name: 'Phillips Auction House',
        fee: 150,
        specialty: 'Vintage',
        endpoint: 'https://api.phillips.com/watches/authentication'
      },
      christies: {
        name: 'Christie\'s Watch Department',
        fee: 140,
        specialty: 'Vintage',
        endpoint: 'https://api.christies.com/watches/authentication'
      },
      sothebys: {
        name: 'Sotheby\'s Watch Department',
        fee: 145,
        specialty: 'Vintage',
        endpoint: 'https://api.sothebys.com/watches/authentication'
      },
      independent: {
        name: 'Independent Watch Appraiser',
        fee: 40,
        specialty: 'Independent',
        endpoint: 'https://api.independentappraiser.com/authentication'
      },
      luxury: {
        name: 'Luxury Watch Specialist',
        fee: 55,
        specialty: 'Independent',
        endpoint: 'https://api.luxurywatchspecialist.com/authentication'
      }
    }
  },
  
  // Smart Contract Configuration
  smartContract: {
    address: '', // Will be set after deployment
    network: 'polygon',
    gasLimit: 300000,
    gasPrice: 'auto'
  },
  
  // Stripe Configuration
  stripe: {
    publishableKey: '', // Will be set when Stripe account is created
    apiKey: '', // Will be set when Stripe account is created
    webhookSecret: '' // Will be set when webhook is configured
  }
};
