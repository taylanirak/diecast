/**
 * Trade Detail Screen
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTradesStore, TradeStatus } from '../../stores/tradesStore';
import { useAuthStore } from '../../stores/authStore';

const STATUS_LABELS: Record<TradeStatus, string> = {
  pending: 'Onay Bekliyor',
  accepted: 'Kabul Edildi',
  rejected: 'Reddedildi',
  initiator_shipped: 'Kargo Gönderildi (Siz)',
  receiver_shipped: 'Kargo Gönderildi (Karşı)',
  initiator_delivered: 'Teslim Edildi (Size)',
  receiver_delivered: 'Teslim Edildi (Karşıya)',
  confirmed: 'Tamamlandı',
  cancelled: 'İptal Edildi',
};

const TradeDetailScreen = ({ route, navigation }: any) => {
  const { id } = route.params;
  const [showShipModal, setShowShipModal] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [shippingProvider, setShippingProvider] = useState('');
  
  const { 
    currentTrade: trade, 
    fetchTrade, 
    acceptTrade, 
    rejectTrade, 
    shipTrade,
    confirmReceipt,
    isLoading 
  } = useTradesStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchTrade(id);
  }, [id]);

  const isInitiator = trade?.initiator?.id === user?.id;
  const otherUser = isInitiator ? trade?.receiver : trade?.initiator;
  const myListings = isInitiator ? trade?.initiator_listings : trade?.receiver_listings;
  const theirListings = isInitiator ? trade?.receiver_listings : trade?.initiator_listings;

  const handleAccept = () => {
    Alert.alert(
      'Takas Kabul',
      'Bu takas teklifini kabul etmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Kabul Et', 
          onPress: async () => {
            try {
              await acceptTrade(id);
              Alert.alert('Başarılı', 'Takas kabul edildi');
            } catch (e) {
              Alert.alert('Hata', 'Takas kabul edilemedi');
            }
          }
        },
      ]
    );
  };

  const handleReject = () => {
    Alert.alert(
      'Takas Reddet',
      'Bu takas teklifini reddetmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Reddet', 
          style: 'destructive',
          onPress: async () => {
            try {
              await rejectTrade(id);
              Alert.alert('Başarılı', 'Takas reddedildi');
            } catch (e) {
              Alert.alert('Hata', 'Takas reddedilemedi');
            }
          }
        },
      ]
    );
  };

  const handleShip = async () => {
    if (!trackingNumber.trim() || !shippingProvider.trim()) {
      Alert.alert('Hata', 'Kargo takip numarası ve firma gerekli');
      return;
    }

    try {
      await shipTrade(id, trackingNumber, shippingProvider);
      setShowShipModal(false);
      Alert.alert('Başarılı', 'Kargo bilgisi gönderildi');
    } catch (e) {
      Alert.alert('Hata', 'Kargo bilgisi gönderilemedi');
    }
  };

  const handleConfirm = () => {
    Alert.alert(
      'Teslim Alındı Onayla',
      'Ürünleri teslim aldığınızı onaylıyor musunuz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Onayla', 
          onPress: async () => {
            try {
              await confirmReceipt(id);
              Alert.alert('Başarılı', 'Teslim alındı onaylandı');
            } catch (e) {
              Alert.alert('Hata', 'Onaylama başarısız');
            }
          }
        },
      ]
    );
  };

  if (isLoading || !trade) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E53935" />
      </View>
    );
  }

  const canAcceptReject = trade.status === 'pending' && !isInitiator;
  const canShip = trade.status === 'accepted';
  const canConfirm = ['initiator_shipped', 'receiver_shipped'].includes(trade.status);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusIconContainer}>
            <Icon 
              name={trade.status === 'confirmed' ? 'checkmark-circle' : 'swap-horizontal'} 
              size={32} 
              color="#FFF" 
            />
          </View>
          <Text style={styles.statusTitle}>{STATUS_LABELS[trade.status]}</Text>
          {trade.countdown_expires_at && (
            <Text style={styles.countdownText}>
              Kalan süre: {new Date(trade.countdown_expires_at).toLocaleString('tr-TR')}
            </Text>
          )}
        </View>

        {/* Trade Parties */}
        <View style={styles.partiesCard}>
          <View style={styles.partyInfo}>
            <View style={styles.partyAvatar}>
              <Icon name="person" size={20} color="#757575" />
            </View>
            <Text style={styles.partyName}>{trade.initiator.username}</Text>
            <Text style={styles.partyLabel}>Teklif Veren</Text>
          </View>

          <View style={styles.partySwapIcon}>
            <Icon name="swap-horizontal" size={24} color="#E53935" />
          </View>

          <View style={styles.partyInfo}>
            <View style={styles.partyAvatar}>
              <Icon name="person" size={20} color="#757575" />
            </View>
            <Text style={styles.partyName}>{trade.receiver.username}</Text>
            <Text style={styles.partyLabel}>Teklif Alan</Text>
          </View>
        </View>

        {/* My Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Benim Tekliflerim</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {myListings?.map((item: any) => (
              <View key={item.id} style={styles.itemCard}>
                <Image
                  source={{ uri: item.images?.[0] || 'https://via.placeholder.com/100' }}
                  style={styles.itemImage}
                />
                <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.itemPrice}>₺{item.price?.toLocaleString('tr-TR')}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Their Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{otherUser?.username}'ın Teklifleri</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {theirListings?.map((item: any) => (
              <View key={item.id} style={styles.itemCard}>
                <Image
                  source={{ uri: item.images?.[0] || 'https://via.placeholder.com/100' }}
                  style={styles.itemImage}
                />
                <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.itemPrice}>₺{item.price?.toLocaleString('tr-TR')}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Cash Amount */}
        {trade.cash_amount > 0 && (
          <View style={styles.cashCard}>
            <Icon name="cash" size={24} color="#4CAF50" />
            <View style={styles.cashInfo}>
              <Text style={styles.cashLabel}>Nakit Fark</Text>
              <Text style={styles.cashAmount}>+₺{trade.cash_amount.toLocaleString('tr-TR')}</Text>
            </View>
            <Text style={styles.cashDirection}>
              {trade.cash_direction === 'initiator_to_receiver' 
                ? `${trade.initiator.username} → ${trade.receiver.username}`
                : `${trade.receiver.username} → ${trade.initiator.username}`
              }
            </Text>
          </View>
        )}

        {/* Tracking Info */}
        {(trade.initiator_tracking || trade.receiver_tracking) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Kargo Bilgileri</Text>
            {trade.initiator_tracking && (
              <View style={styles.trackingCard}>
                <Text style={styles.trackingLabel}>{trade.initiator.username}</Text>
                <Text style={styles.trackingNumber}>{trade.initiator_tracking}</Text>
              </View>
            )}
            {trade.receiver_tracking && (
              <View style={styles.trackingCard}>
                <Text style={styles.trackingLabel}>{trade.receiver.username}</Text>
                <Text style={styles.trackingNumber}>{trade.receiver_tracking}</Text>
              </View>
            )}
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionBar}>
        {canAcceptReject && (
          <>
            <TouchableOpacity 
              style={styles.rejectButton}
              onPress={handleReject}
            >
              <Icon name="close" size={22} color="#F44336" />
              <Text style={styles.rejectButtonText}>Reddet</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.counterOfferButton}
              onPress={() => navigation.navigate('CounterOffer', { tradeId: id })}
            >
              <Icon name="swap-horizontal" size={22} color="#FF9800" />
              <Text style={styles.counterOfferButtonText}>Karşı Teklif</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.acceptButton}
              onPress={handleAccept}
            >
              <Icon name="checkmark" size={22} color="#FFF" />
              <Text style={styles.acceptButtonText}>Kabul Et</Text>
            </TouchableOpacity>
          </>
        )}
        
        {canShip && (
          <TouchableOpacity 
            style={styles.shipButton}
            onPress={() => setShowShipModal(true)}
          >
            <Icon name="cube" size={22} color="#FFF" />
            <Text style={styles.shipButtonText}>Kargo Gönder</Text>
          </TouchableOpacity>
        )}

        {canConfirm && (
          <TouchableOpacity 
            style={styles.confirmButton}
            onPress={handleConfirm}
          >
            <Icon name="checkmark-circle" size={22} color="#FFF" />
            <Text style={styles.confirmButtonText}>Teslim Aldım</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Ship Modal */}
      <Modal
        visible={showShipModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowShipModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Kargo Bilgisi</Text>
            <TouchableOpacity onPress={() => setShowShipModal(false)}>
              <Icon name="close" size={24} color="#212121" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Kargo Firması</Text>
              <View style={styles.providerOptions}>
                {['Yurtiçi Kargo', 'Aras Kargo'].map((provider) => (
                  <TouchableOpacity
                    key={provider}
                    style={[
                      styles.providerChip,
                      shippingProvider === provider && styles.providerChipActive
                    ]}
                    onPress={() => setShippingProvider(provider)}
                  >
                    <Text style={[
                      styles.providerChipText,
                      shippingProvider === provider && styles.providerChipTextActive
                    ]}>
                      {provider}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Takip Numarası</Text>
              <TextInput
                style={styles.input}
                placeholder="Kargo takip numarası"
                value={trackingNumber}
                onChangeText={setTrackingNumber}
              />
            </View>
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.modalSubmitButton}
              onPress={handleShip}
            >
              <Text style={styles.modalSubmitText}>Gönder</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  statusCard: {
    backgroundColor: '#E53935',
    margin: 16,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  statusIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  countdownText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
  },
  partiesCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  partyInfo: {
    flex: 1,
    alignItems: 'center',
  },
  partyAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  partyName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
  },
  partyLabel: {
    fontSize: 11,
    color: '#757575',
    marginTop: 2,
  },
  partySwapIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF3F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 12,
  },
  itemCard: {
    width: 140,
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
  itemImage: {
    width: '100%',
    height: 100,
    backgroundColor: '#F5F5F5',
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#212121',
    padding: 8,
    paddingBottom: 0,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E53935',
    padding: 8,
    paddingTop: 4,
  },
  cashCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cashInfo: {
    flex: 1,
    marginLeft: 12,
  },
  cashLabel: {
    fontSize: 12,
    color: '#757575',
  },
  cashAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4CAF50',
  },
  cashDirection: {
    fontSize: 12,
    color: '#4CAF50',
  },
  trackingCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  trackingLabel: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 4,
  },
  trackingNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    gap: 12,
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#F44336',
    borderRadius: 12,
    paddingVertical: 14,
  },
  rejectButtonText: {
    color: '#F44336',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  counterOfferButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#FF9800',
    borderRadius: 12,
    paddingVertical: 14,
  },
  counterOfferButtonText: {
    color: '#FF9800',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  acceptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 14,
  },
  acceptButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  shipButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    borderRadius: 12,
    paddingVertical: 14,
  },
  shipButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  confirmButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 14,
  },
  confirmButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
  },
  modalBody: {
    padding: 16,
  },
  field: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
  },
  providerOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  providerChip: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  providerChipActive: {
    backgroundColor: '#E53935',
    borderColor: '#E53935',
  },
  providerChipText: {
    fontSize: 14,
    color: '#757575',
    fontWeight: '500',
  },
  providerChipTextActive: {
    color: '#FFF',
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#212121',
  },
  modalFooter: {
    padding: 16,
    marginTop: 'auto',
  },
  modalSubmitButton: {
    backgroundColor: '#E53935',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalSubmitText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default TradeDetailScreen;


