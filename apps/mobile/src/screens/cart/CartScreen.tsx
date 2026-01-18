/**
 * Cart Screen
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useCartStore } from '../../stores/cartStore';

const CartItem = ({ item, onRemove }: any) => (
  <View style={styles.cartItem}>
    <Image
      source={{ uri: item.image || 'https://via.placeholder.com/80' }}
      style={styles.itemImage}
    />
    <View style={styles.itemInfo}>
      <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
      <Text style={styles.itemSeller}>@{item.seller?.username}</Text>
      <Text style={styles.itemPrice}>₺{item.price?.toLocaleString('tr-TR')}</Text>
    </View>
    <TouchableOpacity style={styles.removeButton} onPress={() => onRemove(item.id)}>
      <Icon name="trash-outline" size={20} color="#F44336" />
    </TouchableOpacity>
  </View>
);

const CartScreen = ({ navigation }: any) => {
  const { items, total, fetchCart, removeFromCart, isLoading } = useCartStore();

  useEffect(() => {
    fetchCart();
  }, []);

  const handleRemove = (itemId: number) => {
    Alert.alert(
      'Ürün Kaldır',
      'Bu ürünü sepetten kaldırmak istiyor musunuz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Kaldır',
          style: 'destructive',
          onPress: () => removeFromCart(itemId),
        },
      ]
    );
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      Alert.alert('Hata', 'Sepetiniz boş');
      return;
    }
    navigation.navigate('Checkout');
  };

  if (isLoading && items.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E53935" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="cart-outline" size={80} color="#BDBDBD" />
          <Text style={styles.emptyTitle}>Sepetiniz Boş</Text>
          <Text style={styles.emptyText}>
            İlanlara göz atın ve beğendiklerinizi sepete ekleyin
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.browseButtonText}>İlanlara Göz At</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            renderItem={({ item }) => (
              <CartItem item={item} onRemove={handleRemove} />
            )}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            ListFooterComponent={<View style={{ height: 120 }} />}
          />

          {/* Summary */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Ürün Toplam</Text>
              <Text style={styles.summaryValue}>
                ₺{total.toLocaleString('tr-TR')}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Kargo</Text>
              <Text style={styles.summaryValue}>Hesaplanacak</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Toplam</Text>
              <Text style={styles.totalValue}>
                ₺{total.toLocaleString('tr-TR')}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={handleCheckout}
            >
              <Text style={styles.checkoutButtonText}>Ödemeye Geç</Text>
              <Icon name="arrow-forward" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#212121',
    marginTop: 24,
  },
  emptyText: {
    fontSize: 15,
    color: '#757575',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  browseButton: {
    marginTop: 24,
    backgroundColor: '#E53935',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  browseButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#212121',
  },
  itemSeller: {
    fontSize: 13,
    color: '#757575',
    marginTop: 4,
  },
  itemPrice: {
    fontSize: 17,
    fontWeight: '700',
    color: '#E53935',
    marginTop: 4,
  },
  removeButton: {
    padding: 8,
    alignSelf: 'center',
  },
  summaryContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 15,
    color: '#757575',
  },
  summaryValue: {
    fontSize: 15,
    color: '#212121',
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    marginTop: 8,
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#E53935',
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E53935',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 16,
    shadowColor: '#E53935',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  checkoutButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
});

export default CartScreen;


