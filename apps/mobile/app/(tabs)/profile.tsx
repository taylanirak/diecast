import { View, ScrollView } from 'react-native';
import { Text, Avatar, Button, List, Divider, useTheme, Card } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { api } from '../../src/services/api';
import { useAuthStore } from '../../src/stores/authStore';

export default function ProfileScreen() {
  const theme = useTheme();
  const { isAuthenticated, user, logout } = useAuthStore();

  const { data: stats } = useQuery({
    queryKey: ['user-stats'],
    queryFn: () => api.get('/users/me/stats').then(res => res.data),
    enabled: isAuthenticated,
  });

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  if (!isAuthenticated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
        <Avatar.Icon size={80} icon="account" style={{ backgroundColor: theme.colors.primary, marginBottom: 24 }} />
        <Text variant="titleLarge" style={{ marginBottom: 8 }}>Hoş Geldiniz</Text>
        <Text variant="bodyMedium" style={{ textAlign: 'center', marginBottom: 24, color: theme.colors.outline }}>
          Giriş yaparak tüm özelliklere erişebilirsiniz
        </Text>
        <Button mode="contained" onPress={() => router.push('/(auth)/login')} style={{ marginBottom: 12, width: '100%' }}>
          Giriş Yap
        </Button>
        <Button mode="outlined" onPress={() => router.push('/(auth)/register')} style={{ width: '100%' }}>
          Kayıt Ol
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Profile Header */}
      <View style={{ alignItems: 'center', padding: 24, backgroundColor: theme.colors.primary }}>
        <Avatar.Text 
          size={80} 
          label={user?.displayName?.substring(0, 2).toUpperCase() || 'U'} 
          style={{ marginBottom: 12 }}
        />
        <Text variant="titleLarge" style={{ color: '#fff' }}>{user?.displayName}</Text>
        <Text variant="bodyMedium" style={{ color: 'rgba(255,255,255,0.85)' }}>{user?.email}</Text>
        {user?.membershipTier && (
          <View style={{ marginTop: 8, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 }}>
            <Text variant="bodySmall" style={{ color: '#fff' }}>{user.membershipTier} Üye</Text>
          </View>
        )}
      </View>

      {/* Stats */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', padding: 16 }}>
        <Card style={{ flex: 1, marginRight: 8, alignItems: 'center', padding: 12 }}>
          <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>{stats?.listings || 0}</Text>
          <Text variant="bodySmall">İlan</Text>
        </Card>
        <Card style={{ flex: 1, marginHorizontal: 4, alignItems: 'center', padding: 12 }}>
          <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>{stats?.trades || 0}</Text>
          <Text variant="bodySmall">Takas</Text>
        </Card>
        <Card style={{ flex: 1, marginLeft: 8, alignItems: 'center', padding: 12 }}>
          <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>{stats?.rating || '-'}</Text>
          <Text variant="bodySmall">Puan</Text>
        </Card>
      </View>

      {/* Menu */}
      <List.Section>
        <List.Subheader>Hesabım</List.Subheader>
        <List.Item
          title="İlanlarım"
          left={props => <List.Icon {...props} icon="tag" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => router.push('/settings/my-listings')}
        />
        <List.Item
          title="Siparişlerim"
          left={props => <List.Icon {...props} icon="package" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => router.push('/settings/orders')}
        />
        <List.Item
          title="Mesajlarım"
          left={props => <List.Icon {...props} icon="message" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => router.push('/messages')}
        />
        <List.Item
          title="Favorilerim"
          left={props => <List.Icon {...props} icon="heart" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => router.push('/settings/wishlist')}
        />
        <List.Item
          title="Koleksiyonlarım"
          left={props => <List.Icon {...props} icon="folder" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => router.push('/settings/collections')}
        />
        <Divider />
        
        <List.Subheader>Ayarlar</List.Subheader>
        <List.Item
          title="Profil Düzenle"
          left={props => <List.Icon {...props} icon="account-edit" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => router.push('/settings/edit-profile')}
        />
        <List.Item
          title="Adreslerim"
          left={props => <List.Icon {...props} icon="map-marker" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => router.push('/settings/addresses')}
        />
        <List.Item
          title="Üyelik"
          left={props => <List.Icon {...props} icon="crown" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => router.push('/settings/membership')}
        />
        <List.Item
          title="Bildirimler"
          left={props => <List.Icon {...props} icon="bell" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => router.push('/settings/notifications')}
        />
        <Divider />
        
        <List.Subheader>Destek</List.Subheader>
        <List.Item
          title="Yardım & SSS"
          left={props => <List.Icon {...props} icon="help-circle" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => router.push('/settings/help')}
        />
        <List.Item
          title="Destek Talebi"
          left={props => <List.Icon {...props} icon="headset" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => router.push('/settings/support')}
        />
      </List.Section>

      {/* Logout */}
      <View style={{ padding: 16 }}>
        <Button mode="outlined" onPress={handleLogout} icon="logout" textColor={theme.colors.error}>
          Çıkış Yap
        </Button>
      </View>
    </ScrollView>
  );
}
