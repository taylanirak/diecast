/**
 * Messages Screen
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import api from '../../services/api';

const MessagesScreen = ({ navigation }: any) => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const response = await api.getMessages();
      // Group messages by conversation
      const grouped = groupByConversation(response.messages);
      setConversations(grouped);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const groupByConversation = (messages: any[]) => {
    const conversations: Record<string, any> = {};
    
    messages.forEach((msg) => {
      const otherId = msg.sender_id === msg.current_user_id ? msg.receiver_id : msg.sender_id;
      const key = `${otherId}`;
      
      if (!conversations[key] || new Date(msg.created_at) > new Date(conversations[key].last_message_at)) {
        conversations[key] = {
          user_id: otherId,
          username: msg.sender_id === msg.current_user_id ? msg.receiver_username : msg.sender_username,
          last_message: msg.content,
          last_message_at: msg.created_at,
          unread_count: msg.unread_count || 0,
          listing_id: msg.listing_id,
          listing_title: msg.listing_title,
        };
      }
    });
    
    return Object.values(conversations).sort(
      (a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Dün';
    } else if (days < 7) {
      return date.toLocaleDateString('tr-TR', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
    }
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => navigation.navigate('Chat', {
        userId: item.user_id,
        username: item.username,
        listingId: item.listing_id,
      })}
    >
      <View style={styles.avatarContainer}>
        <Icon name="person" size={24} color="#757575" />
      </View>
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.username}>{item.username}</Text>
          <Text style={styles.time}>{formatTime(item.last_message_at)}</Text>
        </View>
        {item.listing_title && (
          <Text style={styles.listingTitle} numberOfLines={1}>
            {item.listing_title}
          </Text>
        )}
        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.last_message}
        </Text>
      </View>
      {item.unread_count > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadCount}>{item.unread_count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E53935" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={conversations}
        renderItem={renderItem}
        keyExtractor={(item) => item.user_id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="chatbubbles-outline" size={64} color="#BDBDBD" />
            <Text style={styles.emptyTitle}>Henüz mesajınız yok</Text>
            <Text style={styles.emptyText}>
              İlanlara göz atın ve satıcılarla iletişime geçin
            </Text>
          </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    flexGrow: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  avatarContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  time: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  listingTitle: {
    fontSize: 12,
    color: '#E53935',
    marginBottom: 2,
  },
  lastMessage: {
    fontSize: 14,
    color: '#757575',
  },
  unreadBadge: {
    backgroundColor: '#E53935',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginLeft: 8,
  },
  unreadCount: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
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
});

export default MessagesScreen;


