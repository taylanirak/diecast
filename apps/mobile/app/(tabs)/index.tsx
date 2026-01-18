import { View, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { Text, Card, Chip, Searchbar, ActivityIndicator, useTheme } from 'react-native-paper';
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../src/services/api';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const CATEGORIES = [
  { id: 'vintage', name: 'Vintage', icon: 'time' },
  { id: 'sports', name: 'Spor', icon: 'speedometer' },
  { id: 'muscle', name: 'Muscle', icon: 'car-sport' },
  { id: 'trucks', name: 'Kamyon', icon: 'bus' },
  { id: 'f1', name: 'F1', icon: 'flag' },
  { id: 'custom', name: 'Custom', icon: 'color-palette' },
];

const BRANDS = [
  { id: 'hotwheels', name: 'Hot Wheels' },
  { id: 'matchbox', name: 'Matchbox' },
  { id: 'majorette', name: 'Majorette' },
  { id: 'tomica', name: 'Tomica' },
  { id: 'minichamps', name: 'Minichamps' },
  { id: 'autoart', name: 'AutoArt' },
];

export default function HomeScreen() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const { data: listings, isLoading, refetch } = useQuery({
    queryKey: ['listings', 'featured'],
    queryFn: () => api.get('/products?featured=true&limit=10').then(res => res.data),
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleCategoryPress = (categoryId: string) => {
    router.push(`/search?category=${categoryId}`);
  };

  const handleBrandPress = (brandId: string) => {
    router.push(`/search?brand=${brandId}`);
  };

  const handleProductPress = (productId: string) => {
    router.push(`/product/${productId}`);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Search Bar */}
      <View style={{ padding: 16 }}>
        <Searchbar
          placeholder="Model ara..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          style={{ backgroundColor: theme.colors.surface }}
        />
      </View>

      {/* Categories */}
      <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
        <Text variant="titleMedium" style={{ marginBottom: 12 }}>Kategoriler</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {CATEGORIES.map(category => (
            <Chip
              key={category.id}
              icon={() => <Ionicons name={category.icon as any} size={18} color={theme.colors.primary} />}
              style={{ marginRight: 8, backgroundColor: theme.colors.surface }}
              onPress={() => handleCategoryPress(category.id)}
            >
              {category.name}
            </Chip>
          ))}
        </ScrollView>
      </View>

      {/* Brands */}
      <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
        <Text variant="titleMedium" style={{ marginBottom: 12 }}>Popüler Markalar</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {BRANDS.map(brand => (
            <Chip
              key={brand.id}
              style={{ marginRight: 8 }}
              mode="outlined"
              onPress={() => handleBrandPress(brand.id)}
            >
              {brand.name}
            </Chip>
          ))}
        </ScrollView>
      </View>

      {/* Trade Banner */}
      <Card
        style={{
          marginHorizontal: 16,
          marginBottom: 16,
          backgroundColor: theme.colors.primary,
        }}
        onPress={() => router.push('/trades')}
      >
        <Card.Content style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="swap-horizontal" size={32} color="#fff" />
          <View style={{ marginLeft: 16 }}>
            <Text variant="titleMedium" style={{ color: '#fff' }}>Takas Yap!</Text>
            <Text variant="bodySmall" style={{ color: 'rgba(255,255,255,0.85)' }}>
              Koleksiyonundaki modelleri güvenle takas et
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Featured Listings */}
      <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
        <Text variant="titleMedium" style={{ marginBottom: 12 }}>Öne Çıkanlar</Text>
        {isLoading ? (
          <ActivityIndicator style={{ marginTop: 32 }} />
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {(listings?.data || []).slice(0, 6).map((item: any) => (
              <Card
                key={item.id}
                style={{ width: CARD_WIDTH, marginBottom: 16 }}
                onPress={() => handleProductPress(item.id)}
              >
                <Card.Cover
                  source={{ uri: item.images?.[0] || 'https://via.placeholder.com/200' }}
                  style={{ height: CARD_WIDTH }}
                />
                {item.tradeAvailable && (
                  <Chip
                    icon="swap-horizontal"
                    style={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      backgroundColor: '#4CAF50',
                    }}
                    textStyle={{ color: '#fff', fontSize: 10 }}
                  >
                    Takas
                  </Chip>
                )}
                <Card.Content style={{ paddingTop: 8 }}>
                  <Text variant="titleSmall" numberOfLines={2}>{item.title}</Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                    {item.brand} • {item.scale}
                  </Text>
                  <Text variant="titleMedium" style={{ color: theme.colors.primary, marginTop: 4 }}>
                    ₺{item.price?.toLocaleString('tr-TR')}
                  </Text>
                </Card.Content>
              </Card>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
