/**
 * My Collections Screen
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
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import api from '../../services/api';

const MyCollectionsScreen = ({ navigation }: any) => {
  const [collections, setCollections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDesc, setNewCollectionDesc] = useState('');

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      const response = await api.getCollections();
      setCollections(response.collections);
    } catch (error) {
      console.error('Failed to load collections:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCollections();
    setRefreshing(false);
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) {
      Alert.alert('Hata', 'Koleksiyon adı gerekli');
      return;
    }

    try {
      await api.createCollection({
        name: newCollectionName,
        description: newCollectionDesc,
        is_public: true,
      });
      setShowCreateModal(false);
      setNewCollectionName('');
      setNewCollectionDesc('');
      loadCollections();
    } catch (error) {
      Alert.alert('Hata', 'Koleksiyon oluşturulamadı');
    }
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.collectionCard}
      onPress={() => navigation.navigate('CollectionDetail', { id: item.id })}
    >
      <View style={styles.collectionImages}>
        {item.preview_images?.slice(0, 4).map((img: string, i: number) => (
          <Image
            key={i}
            source={{ uri: img || 'https://via.placeholder.com/60' }}
            style={styles.previewImage}
          />
        ))}
        {!item.preview_images?.length && (
          <View style={styles.emptyPreview}>
            <Icon name="albums-outline" size={32} color="#BDBDBD" />
          </View>
        )}
      </View>
      <View style={styles.collectionInfo}>
        <Text style={styles.collectionName}>{item.name}</Text>
        <Text style={styles.collectionCount}>{item.item_count || 0} model</Text>
        {item.is_public && (
          <View style={styles.publicBadge}>
            <Icon name="globe-outline" size={12} color="#757575" />
            <Text style={styles.publicText}>Herkese Açık</Text>
          </View>
        )}
      </View>
      <Icon name="chevron-forward" size={20} color="#BDBDBD" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => setShowCreateModal(true)}
      >
        <Icon name="add" size={20} color="#FFF" />
        <Text style={styles.createButtonText}>Yeni Koleksiyon</Text>
      </TouchableOpacity>

      <FlatList
        data={collections}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Icon name="albums-outline" size={64} color="#BDBDBD" />
              <Text style={styles.emptyTitle}>Henüz koleksiyonunuz yok</Text>
              <Text style={styles.emptyText}>
                Modellerinizi düzenlemek için koleksiyon oluşturun
              </Text>
            </View>
          ) : null
        }
      />

      {/* Create Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Yeni Koleksiyon</Text>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <Icon name="close" size={24} color="#212121" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Koleksiyon Adı</Text>
              <TextInput
                style={styles.input}
                placeholder="Örn: Hot Wheels 2024"
                value={newCollectionName}
                onChangeText={setNewCollectionName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Açıklama (Opsiyonel)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Koleksiyon hakkında..."
                value={newCollectionDesc}
                onChangeText={setNewCollectionDesc}
                multiline
              />
            </View>
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleCreateCollection}
            >
              <Text style={styles.submitButtonText}>Oluştur</Text>
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
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E53935',
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 12,
  },
  createButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  listContainer: {
    padding: 16,
  },
  collectionCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  collectionImages: {
    width: 80,
    height: 80,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  previewImage: {
    width: 39,
    height: 39,
    backgroundColor: '#F5F5F5',
  },
  emptyPreview: {
    width: 80,
    height: 80,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  collectionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  collectionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  collectionCount: {
    fontSize: 14,
    color: '#757575',
    marginTop: 4,
  },
  publicBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  publicText: {
    fontSize: 12,
    color: '#757575',
    marginLeft: 4,
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
    textAlign: 'center',
    paddingHorizontal: 32,
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
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#424242',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#212121',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalFooter: {
    padding: 16,
    marginTop: 'auto',
  },
  submitButton: {
    backgroundColor: '#E53935',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default MyCollectionsScreen;


