import { View, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, useTheme } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import { api } from '../../src/services/api';
import { useAuthStore } from '../../src/stores/authStore';

const loginSchema = z.object({
  email: z.string().email('Geçerli email girin'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalı'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const theme = useTheme();
  const { login } = useAuthStore();

  const { control, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginForm) => api.post('/auth/login', data),
    onSuccess: async (response) => {
      await login(response.data.accessToken, response.data.user);
      router.replace('/');
    },
  });

  const onSubmit = (data: LoginForm) => {
    loginMutation.mutate(data);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
        <Text variant="displaySmall" style={{ textAlign: 'center', marginBottom: 8, color: theme.colors.primary }}>
          Tarodan
        </Text>
        <Text variant="bodyLarge" style={{ textAlign: 'center', marginBottom: 32, color: theme.colors.outline }}>
          Diecast Model Araba Pazaryeri
        </Text>

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <TextInput
              label="E-posta"
              value={value}
              onChangeText={onChange}
              keyboardType="email-address"
              autoCapitalize="none"
              error={!!errors.email}
              style={{ marginBottom: 8 }}
            />
          )}
        />
        {errors.email && (
          <Text variant="bodySmall" style={{ color: theme.colors.error, marginBottom: 8 }}>
            {errors.email.message}
          </Text>
        )}

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <TextInput
              label="Şifre"
              value={value}
              onChangeText={onChange}
              secureTextEntry
              error={!!errors.password}
              style={{ marginBottom: 8 }}
            />
          )}
        />
        {errors.password && (
          <Text variant="bodySmall" style={{ color: theme.colors.error, marginBottom: 16 }}>
            {errors.password.message}
          </Text>
        )}

        {loginMutation.isError && (
          <Text variant="bodySmall" style={{ color: theme.colors.error, marginBottom: 16, textAlign: 'center' }}>
            Giriş başarısız. Bilgilerinizi kontrol edin.
          </Text>
        )}

        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          loading={loginMutation.isPending}
          disabled={loginMutation.isPending}
          style={{ marginBottom: 16 }}
        >
          Giriş Yap
        </Button>

        <Button mode="text" onPress={() => router.push('/(auth)/forgot-password')}>
          Şifremi Unuttum
        </Button>

        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 24 }}>
          <Text variant="bodyMedium">Hesabınız yok mu? </Text>
          <Button mode="text" compact onPress={() => router.push('/(auth)/register')}>
            Kayıt Ol
          </Button>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
