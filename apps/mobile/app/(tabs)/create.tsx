import { View, ScrollView, Image } from 'react-native';
import { Text, TextInput, Button, SegmentedButtons, Switch, useTheme, Snackbar, IconButton } from 'react-native-paper';
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { api } from '../../src/services/api';
import { useAuthStore } from '../../src/stores/authStore';

const listingSchema = z.object({
  title: z.string().min(5, 'Başlık en az 5 karakter olmalı').max(100),
  description: z.string().max(500).optional(),
  price: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, 'Geçerli fiyat girin'),
  brand: z.string().min(1, 'Marka seçin'),
  scale: z.string().min(1, 'Ölçek seçin'),
  condition: z.string().min(1, 'Durum seçin'),
  category: z.string().optional(),
  year: z.string().optional(),
  tradeAvailable: z.boolean(),
});

type ListingForm = z.infer<typeof listingSchema>;

const BRANDS = ['Hot Wheels', 'Matchbox', 'Majorette', 'Tomica', 'Minichamps', 'AutoArt', 'Diğer'];
const SCALES = ['1:18', '1:24', '1:43', '1:64', '1:87', 'Diğer'];
const CONDITIONS = ['Yeni', 'Mükemmel', 'İyi', 'Orta', 'Koleksiyonluk'];
const CATEGORIES = ['Vintage', 'Spor', 'Muscle', 'Kamyon', 'F1', 'Custom', 'Diğer'];

export default function CreateScreen() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const [images, setImages] = useState<string[]>([]);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  const { control, handleSubmit, formState: { errors }, setValue, watch } = useForm<ListingForm>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: '',
      description: '',
      price: '',
      brand: '',
      scale: '',
      condition: '',
      category: '',
      year: '',
      tradeAvailable: false,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ListingForm) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
      images.forEach((uri, index) => {
        formData.append('images', {
          uri,
          type: 'image/jpeg',
          name: `image_${index}.jpg`,
        } as any);
      });
      return api.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setSnackbar({ visible: true, message: 'İlan başarıyla oluşturuldu!' });
      setTimeout(() => router.push('/'), 1500);
    },
    onError: () => {
      setSnackbar({ visible: true, message: 'İlan oluşturulamadı' });
    },
  });

  const pickImage = async () => {
    if (images.length >= 5) {
      setSnackbar({ visible: true, message: 'En fazla 5 fotoğraf ekleyebilirsiniz' });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 5 - images.length,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newImages = result.assets.map(asset => asset.uri);
      setImages([...images, ...newImages].slice(0, 5));
    }
  };

  const takePhoto = async () => {
    if (images.length >= 5) return;

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0].uri].slice(0, 5));
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const onSubmit = (data: ListingForm) => {
    if (images.length === 0) {
      setSnackbar({ visible: true, message: 'En az bir fotoğraf ekleyin' });
      return;
    }
    createMutation.mutate(data);
  };

  if (!isAuthenticated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
        <Text variant="titleLarge" style={{ marginBottom: 16 }}>Giriş Yapın</Text>
        <Text variant="bodyMedium" style={{ textAlign: 'center', marginBottom: 24, color: theme.colors.outline }}>
          İlan vermek için giriş yapmanız gerekiyor
        </Text>
        <Button mode="contained" onPress={() => router.push('/(auth)/login')}>
          Giriş Yap
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ padding: 16 }}>
        {/* Images */}
        <Text variant="titleMedium" style={{ marginBottom: 8 }}>Fotoğraflar *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          {images.map((uri, index) => (
            <View key={index} style={{ marginRight: 12, position: 'relative' }}>
              <Image source={{ uri }} style={{ width: 100, height: 100, borderRadius: 8 }} />
              <IconButton
                icon="close-circle"
                size={20}
                style={{ position: 'absolute', top: -8, right: -8, backgroundColor: '#fff' }}
                onPress={() => removeImage(index)}
              />
            </View>
          ))}
          {images.length < 5 && (
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Button mode="outlined" onPress={pickImage} icon="image">
                Galeri
              </Button>
              <Button mode="outlined" onPress={takePhoto} icon="camera">
                Kamera
              </Button>
            </View>
          )}
        </ScrollView>
        <Text variant="bodySmall" style={{ color: theme.colors.outline, marginBottom: 16 }}>
          {images.length}/5 fotoğraf
        </Text>

        {/* Title */}
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, value } }) => (
            <TextInput
              label="Başlık *"
              value={value}
              onChangeText={onChange}
              error={!!errors.title}
              style={{ marginBottom: 8 }}
            />
          )}
        />
        {errors.title && <Text variant="bodySmall" style={{ color: theme.colors.error, marginBottom: 8 }}>{errors.title.message}</Text>}

        {/* Description */}
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, value } }) => (
            <TextInput
              label="Açıklama"
              value={value}
              onChangeText={onChange}
              multiline
              numberOfLines={3}
              style={{ marginBottom: 16 }}
            />
          )}
        />

        {/* Price */}
        <Controller
          control={control}
          name="price"
          render={({ field: { onChange, value } }) => (
            <TextInput
              label="Fiyat (₺) *"
              value={value}
              onChangeText={onChange}
              keyboardType="numeric"
              error={!!errors.price}
              style={{ marginBottom: 8 }}
            />
          )}
        />
        {errors.price && <Text variant="bodySmall" style={{ color: theme.colors.error, marginBottom: 8 }}>{errors.price.message}</Text>}

        {/* Brand */}
        <Text variant="titleSmall" style={{ marginBottom: 8 }}>Marka *</Text>
        <SegmentedButtons
          value={watch('brand')}
          onValueChange={(v) => setValue('brand', v)}
          buttons={BRANDS.slice(0, 4).map(b => ({ value: b, label: b }))}
          style={{ marginBottom: 8 }}
          density="small"
        />
        <SegmentedButtons
          value={watch('brand')}
          onValueChange={(v) => setValue('brand', v)}
          buttons={BRANDS.slice(4).map(b => ({ value: b, label: b }))}
          style={{ marginBottom: 16 }}
          density="small"
        />

        {/* Scale */}
        <Text variant="titleSmall" style={{ marginBottom: 8 }}>Ölçek *</Text>
        <SegmentedButtons
          value={watch('scale')}
          onValueChange={(v) => setValue('scale', v)}
          buttons={SCALES.map(s => ({ value: s, label: s }))}
          style={{ marginBottom: 16 }}
          density="small"
        />

        {/* Condition */}
        <Text variant="titleSmall" style={{ marginBottom: 8 }}>Durum *</Text>
        <SegmentedButtons
          value={watch('condition')}
          onValueChange={(v) => setValue('condition', v)}
          buttons={CONDITIONS.slice(0, 3).map(c => ({ value: c, label: c }))}
          style={{ marginBottom: 8 }}
          density="small"
        />
        <SegmentedButtons
          value={watch('condition')}
          onValueChange={(v) => setValue('condition', v)}
          buttons={CONDITIONS.slice(3).map(c => ({ value: c, label: c }))}
          style={{ marginBottom: 16 }}
          density="small"
        />

        {/* Trade Available */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <View>
            <Text variant="titleSmall">Takas Kabul</Text>
            <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
              Takas tekliflerine açık mısınız?
            </Text>
          </View>
          <Controller
            control={control}
            name="tradeAvailable"
            render={({ field: { onChange, value } }) => (
              <Switch value={value} onValueChange={onChange} />
            )}
          />
        </View>

        {/* Submit */}
        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          loading={createMutation.isPending}
          disabled={createMutation.isPending}
          style={{ marginBottom: 32 }}
        >
          İlanı Yayınla
        </Button>
      </View>

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
        duration={3000}
      >
        {snackbar.message}
      </Snackbar>
    </ScrollView>
  );
}
