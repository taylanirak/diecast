/**
 * Counter Offer Screen
 * Allows users to make a counter-offer on a received trade proposal
 * 
 * Requirement: Mobile parity with web trade counter-offer functionality
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTradesStore } from '../../stores/tradesStore';
import { useAuthStore } from '../../stores/authStore';
import api from '../../services/api';

interface Listing {
  id: string;
  title: string;
  price: number;
  images: string[];
  condition: string;
}

const CounterOfferScreen = ({ route, navigation }: any) => {
  const { tradeId } = route.params;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [selectedListings, setSelectedListings] = useState<string[]>([]);
  const [cashAmount, setCashAmount] = useState('0');
  const [cashDirection, setCashDirection] = useState<'to_them' | 'to_me'>('to_them');
  const [message, setMessage] = useState('');
  
  const { currentTrade, fetchTrade } = useTradesStore();
  const { user } = useAuthStore();

  useEffect(() => {
    loadData();
  }, [tradeId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Fetch current trade details
      await fetchTrade(tradeId);
      
      // Fetch user's available listings
      const response = await api.get('/products', {
        params: {
          sellerId: user?.id,
          status: 'active',
        },
      });
      setMyListings(response.data.products || []);
      
      // Pre-select listings that were originally requested
      if (currentTrade) {
        const isInitiator = currentTrade.initiator?.id === user?.id;
        const originalListings = isInitiator 
          ? currentTrade.initiator_listings 
          : currentTrade.receiver_listings;
        
        if (originalListings) {
          setSelectedListings(originalListings.map((l: any) => l.id));
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      Alert.alert('Hata', 'Veriler yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleListingSelection = (listingId: string) => {
    setSelectedListings(prev => {
      if (prev.includes(listingId)) {
        return prev.filter(id => id !== listingId);
      } else {
        return [...prev, listingId];
      }
    });
  };

  const calculateTotalValue = (listingIds: string[]) => {
    return listingIds.reduce((sum, id) => {
      const listing = myListings.find(l => l.id === id);
      return sum + (listing?.price || 0);
    }, 0);
  };

  const handleSubmitCounterOffer = async () => {
    if (selectedListings.length === 0) {
      Alert.alert('Hata', 'En az bir ürün seçmelisiniz');
      return;
    }

    const cashAmountNum = parseFloat(cashAmount) || 0;

    Alert.alert(
      'Karşı Teklif Gönder',
      `${selectedListings.length} ürün${cashAmountNum > 0 ? ` ve ₺${cashAmountNum.toLocaleString('tr-TR')} nakit` : ''} ile karşı teklif göndermek istediğinize emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Gönder',
          onPress: async () => {
            setIsSubmitting(true);
            try {
              await api.post(`/trades/${tradeId}/counter`, {
                offeredListingIds: selectedListings,
                cashAmount: cashAmountNum,
                cashDirection: cashDirection === 'to_them' ? 'initiator_to_receiver' : 'receiver_to_initiator',
                message: message.trim() || undefined,
              });

              Alert.alert(
                'Başarılı',
                'Karşı teklifiniz gönderildi',
                [
                  {
                    text: 'Tamam',
                    onPress: () => navigation.goBack(),
                  },
                ]
              );
            } catch (error: any) {
              const errorMessage = error.response?.data?.message || 'Karşı teklif gönderilemedi';
              Alert.alert('Hata', errorMessage);
            } finally {
              setIsSubmitting(false);
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E53935" />
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  const theirListings = currentTrade?.initiator?.id === user?.id
    ? currentTrade?.receiver_listings
    : currentTrade?.initiator_listings;

  const mySelectedTotal = calculateTotalValue(selectedListings);
  const theirTotal = (theirListings || []).reduce((sum: number, l: any) => sum + (l.price || 0), 0);
  const cashAmountNum = parseFloat(cashAmount) || 0;
  const valueDifference = cashDirection === 'to_them'
    ? theirTotal - mySelectedTotal + cashAmountNum
    : theirTotal - mySelectedTotal - cashAmountNum;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Info */}
        <View style={styles.headerCard}>
          <Icon name="swap-horizontal" size={32} color="#E53935" />
          <Text style={styles.headerTitle}>Karşı Teklif Oluştur</Text>
          <Text style={styles.headerSubtitle}>
            Mevcut teklife alternatif bir teklif gönderin
          </Text>
        </View>

        {/* Their Offer */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Karşı Tarafın Teklifi</Text>
          <Text style={styles.sectionSubtitle}>Bu ürünler size teklif edildi</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {theirListings?.map((item: any) => (
              <View key={item.id} style={styles.theirItemCard}>
                <Image
                  source={{ uri: item.images?.[0] || 'https://via.placeholder.com/100' }}
                  style={styles.itemImage}
                />
                <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.itemPrice}>₺{item.price?.toLocaleString('tr-TR')}</Text>
              </View>
            ))}
          </ScrollView>
          <View style={styles.totalBadge}>
            <Text style={styles.totalBadgeText}>
              Toplam Değer: ₺{theirTotal.toLocaleString('tr-TR')}
            </Text>
          </View>
        </View>

        {/* My Listings Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sizin Teklifiniz</Text>
          <Text style={styles.sectionSubtitle}>Takas için ürün seçin ({selectedListings.length} seçili)</Text>
          
          {myListings.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="albums-outline" size={48} color="#BDBDBD" />
              <Text style={styles.emptyStateText}>Aktif ilanınız bulunmuyor</Text>
              <TouchableOpacity 
                style={styles.createListingButton}
                onPress={() => navigation.navigate('CreateListing')}
              >
                <Text style={styles.createListingButtonText}>İlan Oluştur</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={myListings}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const isSelected = selectedListings.includes(item.id);
                return (
                  <TouchableOpacity
                    style={[styles.myItemCard, isSelected && styles.myItemCardSelected]}
                    onPress={() => toggleListingSelection(item.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.itemCheckbox}>
                      {isSelected && (
                        <Icon name="checkmark-circle" size={24} color="#4CAF50" />
                      )}
                      {!isSelected && (
                        <Icon name="ellipse-outline" size={24} color="#BDBDBD" />
                      )}
                    </View>
                    <Image
                      source={{ uri: item.images?.[0] || 'https://via.placeholder.com/100' }}
                      style={styles.itemImage}
                    />
                    <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
                    <Text style={styles.itemPrice}>₺{item.price?.toLocaleString('tr-TR')}</Text>
                  </TouchableOpacity>
                );
              }}
            />
          )}

          {selectedListings.length > 0 && (
            <View style={[styles.totalBadge, styles.myTotalBadge]}>
              <Text style={styles.totalBadgeText}>
                Seçilen Toplam: ₺{mySelectedTotal.toLocaleString('tr-TR')}
              </Text>
            </View>
          )}
        </View>

        {/* Cash Balancing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nakit Fark (Opsiyonel)</Text>
          <Text style={styles.sectionSubtitle}>Değer farkı için nakit ekleyin</Text>
          
          <View style={styles.cashDirectionButtons}>
            <TouchableOpacity
              style={[
                styles.cashDirectionButton,
                cashDirection === 'to_them' && styles.cashDirectionButtonActive,
              ]}
              onPress={() => setCashDirection('to_them')}
            >
              <Icon 
                name="arrow-forward" 
                size={16} 
                color={cashDirection === 'to_them' ? '#FFF' : '#757575'} 
              />
              <Text style={[
                styles.cashDirectionText,
                cashDirection === 'to_them' && styles.cashDirectionTextActive,
              ]}>
                Ben vereceğim
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.cashDirectionButton,
                cashDirection === 'to_me' && styles.cashDirectionButtonActive,
              ]}
              onPress={() => setCashDirection('to_me')}
            >
              <Icon 
                name="arrow-back" 
                size={16} 
                color={cashDirection === 'to_me' ? '#FFF' : '#757575'} 
              />
              <Text style={[
                styles.cashDirectionText,
                cashDirection === 'to_me' && styles.cashDirectionTextActive,
              ]}>
                Ben alacağım
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.cashInputContainer}>
            <Text style={styles.currencySymbol}>₺</Text>
            <TextInput
              style={styles.cashInput}
              placeholder="0"
              keyboardType="numeric"
              value={cashAmount}
              onChangeText={setCashAmount}
            />
          </View>
        </View>

        {/* Value Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Onların değeri:</Text>
            <Text style={styles.summaryValue}>₺{theirTotal.toLocaleString('tr-TR')}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Sizin değeriniz:</Text>
            <Text style={styles.summaryValue}>₺{mySelectedTotal.toLocaleString('tr-TR')}</Text>
          </View>
          {cashAmountNum > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Nakit ({cashDirection === 'to_them' ? '+' : '-'}):
              </Text>
              <Text style={[
                styles.summaryValue,
                { color: cashDirection === 'to_them' ? '#F44336' : '#4CAF50' }
              ]}>
                {cashDirection === 'to_them' ? '+' : '-'}₺{cashAmountNum.toLocaleString('tr-TR')}
              </Text>
            </View>
          )}
          <View style={[styles.summaryRow, styles.summaryTotalRow]}>
            <Text style={styles.summaryTotalLabel}>Fark:</Text>
            <Text style={[
              styles.summaryTotalValue,
              { color: valueDifference >= 0 ? '#4CAF50' : '#F44336' }
            ]}>
              {valueDifference >= 0 ? '+' : ''}₺{valueDifference.toLocaleString('tr-TR')}
            </Text>
          </View>
        </View>

        {/* Message */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mesaj (Opsiyonel)</Text>
          <TextInput
            style={styles.messageInput}
            placeholder="Teklifinizle ilgili bir not ekleyin..."
            multiline
            numberOfLines={3}
            value={message}
            onChangeText={setMessage}
          />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.submitContainer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            (selectedListings.length === 0 || isSubmitting) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmitCounterOffer}
          disabled={selectedListings.length === 0 || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Icon name="paper-plane" size={20} color="#FFF" />
              <Text style={styles.submitButtonText}>Karşı Teklif Gönder</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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
    backgroundColor: '#FAFAFA',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#757575',
  },
  headerCard: {
    backgroundColor: '#FFF',
    margin: 16,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212121',
    marginTop: 12,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#757575',
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#757575',
    marginBottom: 12,
  },
  theirItemCard: {
    width: 130,
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginRight: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  myItemCard: {
    width: 130,
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginRight: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    position: 'relative',
  },
  myItemCardSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#F1F8E9',
  },
  itemCheckbox: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    backgroundColor: '#FFF',
    borderRadius: 12,
  },
  itemImage: {
    width: '100%',
    height: 90,
    backgroundColor: '#F5F5F5',
  },
  itemTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#212121',
    padding: 8,
    paddingBottom: 4,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E53935',
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  totalBadge: {
    backgroundColor: '#ECEFF1',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  myTotalBadge: {
    backgroundColor: '#E8F5E9',
  },
  totalBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#455A64',
  },
  emptyState: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#757575',
    marginTop: 12,
    marginBottom: 16,
  },
  createListingButton: {
    backgroundColor: '#E53935',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  createListingButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  cashDirectionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  cashDirectionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  cashDirectionButtonActive: {
    backgroundColor: '#E53935',
    borderColor: '#E53935',
  },
  cashDirectionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#757575',
  },
  cashDirectionTextActive: {
    color: '#FFF',
  },
  cashInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '600',
    color: '#757575',
    marginRight: 8,
  },
  cashInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: '#212121',
    paddingVertical: 16,
  },
  summaryCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#757575',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
  },
  summaryTotalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    marginBottom: 0,
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  summaryTotalValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  messageInput: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#212121',
    textAlignVertical: 'top',
    minHeight: 80,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  submitContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  submitButton: {
    backgroundColor: '#E53935',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default CounterOfferScreen;
