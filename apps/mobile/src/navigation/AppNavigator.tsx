import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../stores/authStore';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Main Screens
import HomeScreen from '../screens/home/HomeScreen';
import ListingsScreen from '../screens/listings/ListingsScreen';
import ListingDetailScreen from '../screens/listings/ListingDetailScreen';
import CreateListingScreen from '../screens/listings/CreateListingScreen';

// Trade Screens
import TradesScreen from '../screens/trades/TradesScreen';
import TradeDetailScreen from '../screens/trades/TradeDetailScreen';
import InitiateTradeScreen from '../screens/trades/InitiateTradeScreen';
import CounterOfferScreen from '../screens/trades/CounterOfferScreen';

// Message Screens
import MessagesScreen from '../screens/messages/MessagesScreen';
import ChatScreen from '../screens/messages/ChatScreen';

// Profile Screens
import ProfileScreen from '../screens/profile/ProfileScreen';
import MyListingsScreen from '../screens/profile/MyListingsScreen';
import MyOrdersScreen from '../screens/profile/MyOrdersScreen';
import MyCollectionsScreen from '../screens/profile/MyCollectionsScreen';
import MembershipScreen from '../screens/profile/MembershipScreen';

// Cart Screens
import CartScreen from '../screens/cart/CartScreen';
import CheckoutScreen from '../screens/cart/CheckoutScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const TradesStack = createNativeStackNavigator();
const MessagesStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

// Theme colors
const colors = {
  primary: '#e94560',
  background: '#1a1a2e',
  surface: '#16213e',
  text: '#ffffff',
  textSecondary: '#9ca3af',
  border: '#3c3d4f',
};

// Home tab navigator
function HomeStackNavigator() {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <HomeStack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="Listings"
        component={ListingsScreen}
        options={{ title: 'İlanlar' }}
      />
      <HomeStack.Screen
        name="ListingDetail"
        component={ListingDetailScreen}
        options={{ title: 'İlan Detayı' }}
      />
    </HomeStack.Navigator>
  );
}

// Trades tab navigator
function TradesStackNavigator() {
  return (
    <TradesStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
      }}
    >
      <TradesStack.Screen
        name="Trades"
        component={TradesScreen}
        options={{ title: 'Takaslarım' }}
      />
      <TradesStack.Screen
        name="TradeDetail"
        component={TradeDetailScreen}
        options={{ title: 'Takas Detayı' }}
      />
      <TradesStack.Screen
        name="InitiateTrade"
        component={InitiateTradeScreen}
        options={{ title: 'Takas Teklifi' }}
      />
      <TradesStack.Screen
        name="CounterOffer"
        component={CounterOfferScreen}
        options={{ title: 'Karşı Teklif' }}
      />
    </TradesStack.Navigator>
  );
}

// Messages tab navigator
function MessagesStackNavigator() {
  return (
    <MessagesStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
      }}
    >
      <MessagesStack.Screen
        name="Messages"
        component={MessagesScreen}
        options={{ title: 'Mesajlar' }}
      />
      <MessagesStack.Screen
        name="Chat"
        component={ChatScreen}
        options={{ title: 'Sohbet' }}
      />
    </MessagesStack.Navigator>
  );
}

// Profile tab navigator
function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
      }}
    >
      <ProfileStack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profilim' }}
      />
      <ProfileStack.Screen
        name="MyListings"
        component={MyListingsScreen}
        options={{ title: 'İlanlarım' }}
      />
      <ProfileStack.Screen
        name="MyOrders"
        component={MyOrdersScreen}
        options={{ title: 'Siparişlerim' }}
      />
      <ProfileStack.Screen
        name="MyCollections"
        component={MyCollectionsScreen}
        options={{ title: 'Koleksiyonlarım' }}
      />
      <ProfileStack.Screen
        name="Membership"
        component={MembershipScreen}
        options={{ title: 'Üyelik' }}
      />
    </ProfileStack.Navigator>
  );
}

// Main tab navigator (authenticated)
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'HomeTab':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'TradesTab':
              iconName = focused ? 'swap-horizontal' : 'swap-horizontal-outline';
              break;
            case 'CreateTab':
              iconName = focused ? 'add-circle' : 'add-circle-outline';
              break;
            case 'MessagesTab':
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
              break;
            case 'ProfileTab':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{ tabBarLabel: 'Ana Sayfa' }}
      />
      <Tab.Screen
        name="TradesTab"
        component={TradesStackNavigator}
        options={{ tabBarLabel: 'Takaslar' }}
      />
      <Tab.Screen
        name="CreateTab"
        component={CreateListingScreen}
        options={{
          tabBarLabel: 'İlan Ver',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle" size={32} color={colors.primary} />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('CreateListing');
          },
        })}
      />
      <Tab.Screen
        name="MessagesTab"
        component={MessagesStackNavigator}
        options={{ tabBarLabel: 'Mesajlar' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{ tabBarLabel: 'Profil' }}
      />
    </Tab.Navigator>
  );
}

// Auth navigator
function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}

// Main app navigator
export default function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return null; // Splash screen handles this
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Main" component={MainTabNavigator} />
          <Stack.Screen
            name="CreateListing"
            component={CreateListingScreen}
            options={{
              presentation: 'modal',
              headerShown: true,
              headerStyle: { backgroundColor: colors.background },
              headerTintColor: colors.text,
              title: 'Yeni İlan',
            }}
          />
          <Stack.Screen
            name="Cart"
            component={CartScreen}
            options={{
              headerShown: true,
              headerStyle: { backgroundColor: colors.background },
              headerTintColor: colors.text,
              title: 'Sepet',
            }}
          />
          <Stack.Screen
            name="Checkout"
            component={CheckoutScreen}
            options={{
              headerShown: true,
              headerStyle: { backgroundColor: colors.background },
              headerTintColor: colors.text,
              title: 'Ödeme',
            }}
          />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}
