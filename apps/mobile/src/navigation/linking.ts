import { LinkingOptions } from '@react-navigation/native';
import * as Linking from 'expo-linking';

const prefix = Linking.createURL('/');

export const linking: LinkingOptions<any> = {
  prefixes: [prefix, 'tarodan://'],
  config: {
    screens: {
      // Auth screens
      Login: 'login',
      Register: 'register',
      ForgotPassword: 'forgot-password',
      
      // Main tabs
      Main: {
        screens: {
          HomeTab: {
            screens: {
              Home: 'home',
              ListingDetail: 'listing/:id',
              Listings: 'listings',
            },
          },
          SearchTab: {
            screens: {
              Search: 'search',
            },
          },
          TradesTab: {
            screens: {
              Trades: 'trades',
              TradeDetail: 'trade/:id',
              InitiateTrade: 'trade/new/:productId',
            },
          },
          MessagesTab: {
            screens: {
              Messages: 'messages',
              Chat: 'chat/:threadId',
            },
          },
          ProfileTab: {
            screens: {
              Profile: 'profile',
              MyListings: 'my-listings',
              MyOrders: 'my-orders',
              MyCollections: 'my-collections',
              Collection: 'collection/:id',
              Membership: 'membership',
              Settings: 'settings',
            },
          },
        },
      },
      
      // Standalone screens
      CreateListing: 'create-listing',
      EditListing: 'edit-listing/:id',
      Cart: 'cart',
      Checkout: 'checkout',
      OrderDetail: 'order/:id',
      Support: 'support',
      TicketDetail: 'ticket/:id',
    },
  },
};
