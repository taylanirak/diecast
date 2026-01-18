import { View, FlatList, Dimensions } from 'react-native';
import { Text, Card, Searchbar, Chip, ActivityIndicator, useTheme, SegmentedButtons } from 'react-native-paper';
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { api } from '../../src/services/api';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const SORT_OPTIONS = [
  { value: 'newest', label: 'En Yeni' },
  { value: 'price_asc', label: 'Fiyat ↑' },
  { value: 'price_desc', label: 'Fiyat ↓' },
];

export default function SearchScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState((params.q as string) || '');
  const [sortBy, setSortBy] = useState('newest');
  const [category, setCategory] = useState((params.category as string) || '');
  const [brand, setBrand] = useState((params.brand as string) || '');

  const queryParams = useMemo(() => ({
    q: searchQuery,
    sort: sortBy,
    category,
    brand,
  }), [searchQuery, sortBy, category, brand]);

  const { data: results, isLoading, refetch } = useQuery({
    queryKey: ['products', queryParams],
    queryFn: () => api.get('/products', { params: queryParams }).then(res => res.data),
  });

  const handleSearch = () => {
    refetch();
  };

  const handleProductPress = (productId: string) => {
    router.push(`/product/${productId}`);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setCategory('');
    setBrand('');
    setSortBy('newest');
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
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

      {/* Sort Options */}
      <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
        <SegmentedButtons
          value={sortBy}
          onValueChange={setSortBy}
          buttons={SORT_OPTIONS}
          density="small"
        />
      </View>

      {/* Active Filters */}
      {(category || brand) && (
        <View style={{ paddingHorizontal: 16, flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
          {category && (
            <Chip 
              onClose={() => setCategory('')} 
              style={{ marginRight: 8, marginBottom: 4 }}
            >
              Kategori: {category}
            </Chip>
          )}
          {brand && (
            <Chip 
              onClose={() => setBrand('')}
              style={{ marginRight: 8, marginBottom: 4 }}
            >
              Marka: {brand}
            </Chip>
          )}
          <Chip onPress={clearFilters} mode="outlined">
            Temizle
          </Chip>
        </View>
      )}

      {/* Results Count */}
      <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
        <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
          {results?.total || 0} sonuç bulundu
        </Text>
      </View>

      {/* Results */}
      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={results?.data || []}
          numColumns={2}
          contentContainerStyle={{ padding: 16 }}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Card
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
          )}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 32 }}>
              <Text variant="bodyLarge" style={{ color: theme.colors.outline }}>
                Sonuç bulunamadı
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
