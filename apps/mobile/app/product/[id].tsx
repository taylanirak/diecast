import { View, ScrollView, Image, Dimensions } from 'react-native';
import { Text, Button, Chip, Card, Avatar, IconButton, useTheme, ActivityIndicator, Snackbar } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, router } from 'expo-router';
import { useState } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { api } from '../../src/services/api';
import { useAuthStore } from '../../src/stores/authStore';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const [currentImage, setCurrentImage] = useState(0);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => api.get(`/products/${id}`).then(res => res.data),
  });

  const addToCartMutation = useMutation({
    mutationFn: () => api.post('/cart/items', { productId: id }),
    onSuccess: () => {
      setSnackbar({ visible: true, message: 'Sepete eklendi!' });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: () => {
      setSnackbar({ visible: true, message: 'Sepete eklenemedi' });
    },
  });

  const addToWishlistMutation = useMutation({
    mutationFn: () => api.post('/wishlist', { productId: id }),
    onSuccess: () => {
      setSnackbar({ visible: true, message: 'Favorilere eklendi!' });
    },
  });

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text variant="bodyLarge">Ürün bulunamadı</Text>
      </View>
    );
  }

  const images = product.images?.length > 0 ? product.images : ['https://via.placeholder.com/400'];

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView>
        {/* Image Gallery */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={(e) => {
            const page = Math.round(e.nativeEvent.contentOffset.x / width);
            setCurrentImage(page);
          }}
          scrollEventThrottle={16}
        >
          {images.map((uri: string, index: number) => (
            <Image
              key={index}
              source={{ uri }}
              style={{ width, height: width, backgroundColor: '#f5f5f5' }}
              resizeMode="contain"
            />
          ))}
        </ScrollView>

        {/* Image Indicators */}
        {images.length > 1 && (
          <View style={{ flexDirection: 'row', justifyContent: 'center', paddingVertical: 8 }}>
            {images.map((_: any, index: number) => (
              <View
                key={index}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: currentImage === index ? theme.colors.primary : theme.colors.outline,
                  marginHorizontal: 4,
                }}
              />
            ))}
          </View>
        )}

        {/* Content */}
        <View style={{ padding: 16 }}>
          {/* Title & Price */}
          <Text variant="headlineSmall" style={{ marginBottom: 8 }}>{product.title}</Text>
          <Text variant="displaySmall" style={{ color: theme.colors.primary, marginBottom: 16 }}>
            ₺{product.price?.toLocaleString('tr-TR')}
          </Text>

          {/* Badges */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {product.tradeAvailable && (
              <Chip icon="swap-horizontal" style={{ backgroundColor: '#4CAF50' }} textStyle={{ color: '#fff' }}>
                Takas Açık
              </Chip>
            )}
            <Chip icon="tag" mode="outlined">{product.brand}</Chip>
            <Chip icon="resize" mode="outlined">{product.scale}</Chip>
            <Chip icon="check-circle" mode="outlined">{product.condition}</Chip>
          </View>

          {/* Description */}
          {product.description && (
            <Card style={{ marginBottom: 16 }}>
              <Card.Content>
                <Text variant="titleMedium" style={{ marginBottom: 8 }}>Açıklama</Text>
                <Text variant="bodyMedium">{product.description}</Text>
              </Card.Content>
            </Card>
          )}

          {/* Details */}
          <Card style={{ marginBottom: 16 }}>
            <Card.Content>
              <Text variant="titleMedium" style={{ marginBottom: 8 }}>Detaylar</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text variant="bodyMedium" style={{ color: theme.colors.outline }}>Marka</Text>
                <Text variant="bodyMedium">{product.brand}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text variant="bodyMedium" style={{ color: theme.colors.outline }}>Ölçek</Text>
                <Text variant="bodyMedium">{product.scale}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text variant="bodyMedium" style={{ color: theme.colors.outline }}>Durum</Text>
                <Text variant="bodyMedium">{product.condition}</Text>
              </View>
              {product.category && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text variant="bodyMedium" style={{ color: theme.colors.outline }}>Kategori</Text>
                  <Text variant="bodyMedium">{product.category}</Text>
                </View>
              )}
              {product.year && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text variant="bodyMedium" style={{ color: theme.colors.outline }}>Model Yılı</Text>
                  <Text variant="bodyMedium">{product.year}</Text>
                </View>
              )}
            </Card.Content>
          </Card>

          {/* Seller */}
          <Card style={{ marginBottom: 16 }} onPress={() => router.push(`/seller/${product.seller?.id}`)}>
            <Card.Content style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Avatar.Text
                size={48}
                label={product.seller?.displayName?.substring(0, 2).toUpperCase() || 'S'}
              />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text variant="titleMedium">{product.seller?.displayName}</Text>
                <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                  Üye: {format(new Date(product.seller?.createdAt || Date.now()), 'MMM yyyy', { locale: tr })}
                </Text>
              </View>
              <IconButton icon="chevron-right" />
            </Card.Content>
          </Card>

          {/* Listed Date */}
          <Text variant="bodySmall" style={{ color: theme.colors.outline, textAlign: 'center' }}>
            İlan tarihi: {format(new Date(product.createdAt), 'dd MMM yyyy', { locale: tr })}
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={{
        flexDirection: 'row',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: theme.colors.outline,
        backgroundColor: theme.colors.surface,
      }}>
        <IconButton
          icon="heart-outline"
          mode="outlined"
          onPress={() => {
            if (!isAuthenticated) {
              router.push('/(auth)/login');
              return;
            }
            addToWishlistMutation.mutate();
          }}
        />
        {product.tradeAvailable && (
          <Button
            mode="outlined"
            style={{ flex: 1, marginHorizontal: 8 }}
            onPress={() => {
              if (!isAuthenticated) {
                router.push('/(auth)/login');
                return;
              }
              router.push(`/trade/create?productId=${id}`);
            }}
          >
            Takas Teklif Et
          </Button>
        )}
        <Button
          mode="contained"
          style={{ flex: 1 }}
          loading={addToCartMutation.isPending}
          onPress={() => {
            if (!isAuthenticated) {
              router.push('/(auth)/login');
              return;
            }
            addToCartMutation.mutate();
          }}
        >
          Sepete Ekle
        </Button>
      </View>

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
        duration={2000}
      >
        {snackbar.message}
      </Snackbar>
    </View>
  );
}
