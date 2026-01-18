/**
 * My Listings Screen
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import api from '../../services/api';

const MyListingsScreen = ({ navigation }: any) => {
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    try {
      const response = await api.getListings({ my_listings: true });
      setListings(response.listings);
    } catch (error) {
      console.error('Failed to load listings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadListings();
    setRefreshing(false);
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.listingCard}
      onPress={() => navigation.navigate('ListingDetail', { id: item.id })}
    >
      <Image
        source={{ uri: item.images?.[0] || 'https://via.placeholder.com/100' }}
        style={styles.listingImage}
      />
      <View style={styles.listingInfo}>
        <Text style={styles.listingTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.listingMeta}>{item.brand} • {item.scale}</Text>
        <Text style={styles.listingPrice}>₺{item.price?.toLocaleString('tr-TR')}</Text>
      </View>
      <View style={styles.statusContainer}>
        <View style={[
          styles.statusBadge,
          { backgroundColor: item.status === 'active' ? '#E8F5E9' : '#FFF3E0' }
        ]}>
          <Text style={[
            styles.statusText,
            { color: item.status === 'active' ? '#4CAF50' : '#FF9800' }
          ]}>
            {item.status === 'active' ? 'Aktif' : 'Bekliyor'}
          </Text>
        </View>
        <Icon name="chevron-forward" size={20} color="#BDBDBD" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={listings}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Icon name="list-outline" size={64} color="#BDBDBD" />
              <Text style={styles.emptyTitle}>Henüz ilanınız yok</Text>
              <Text style={styles.emptyText}>İlk ilanınızı oluşturun</Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => navigation.navigate('Listings', { screen: 'CreateListing' })}
              >
                <Icon name="add" size={20} color="#FFF" />
                <Text style={styles.createButtonText}>İlan Oluştur</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  listContainer: {
    padding: 16,
  },
  listingCard: {
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
  listingImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
  },
  listingInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  listingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#212121',
  },
  listingMeta: {
    fontSize: 13,
    color: '#757575',
    marginTop: 4,
  },
  listingPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E53935',
    marginTop: 4,
  },
  statusContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#757575',
    marginTop: 8,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E53935',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 24,
  },
  createButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default MyListingsScreen;


