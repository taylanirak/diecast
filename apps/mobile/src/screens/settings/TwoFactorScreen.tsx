/**
 * Two-Factor Authentication Setup Screen
 * 
 * Requirement: 2FA (TOTP) support (PROJECT.md)
 * Allows users to enable/disable TOTP-based two-factor authentication
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
  Clipboard,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import api from '../../services/api';

interface TwoFactorStatus {
  isEnabled: boolean;
  backupCodesCount?: number;
}

interface SetupResponse {
  qrCodeUrl: string;
  secret: string;
  backupCodes: string[];
}

const TwoFactorScreen = ({ navigation }: any) => {
  const [status, setStatus] = useState<TwoFactorStatus>({ isEnabled: false });
  const [isLoading, setIsLoading] = useState(true);
  const [setupData, setSetupData] = useState<SetupResponse | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');

  useEffect(() => {
    fetchTwoFactorStatus();
  }, []);

  const fetchTwoFactorStatus = async () => {
    try {
      const response = await api.get('/auth/2fa/status');
      setStatus(response.data);
    } catch (err) {
      console.error('Failed to fetch 2FA status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitiate2FA = async () => {
    setIsLoading(true);
    
    try {
      const response = await api.post('/auth/2fa/setup');
      setSetupData(response.data);
    } catch (err: any) {
      Alert.alert('Hata', err.response?.data?.message || '2FA kurulumu başlatılamadı');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndEnable = async () => {
    if (verificationCode.length !== 6) {
      Alert.alert('Hata', 'Lütfen 6 haneli kodu girin');
      return;
    }

    setIsVerifying(true);

    try {
      const response = await api.post('/auth/2fa/verify', {
        token: verificationCode,
      });

      setBackupCodes(response.data.backupCodes || setupData?.backupCodes || []);
      setShowBackupCodes(true);
      setStatus({ isEnabled: true, backupCodesCount: 10 });
      setSetupData(null);
      setVerificationCode('');
    } catch (err: any) {
      Alert.alert('Hata', err.response?.data?.message || 'Doğrulama başarısız');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!disablePassword) {
      Alert.alert('Hata', 'Şifrenizi girin');
      return;
    }

    setIsLoading(true);

    try {
      await api.post('/auth/2fa/disable', {
        password: disablePassword,
      });

      setStatus({ isEnabled: false });
      setShowDisableModal(false);
      setDisablePassword('');
      Alert.alert('Başarılı', '2FA devre dışı bırakıldı');
    } catch (err: any) {
      Alert.alert('Hata', err.response?.data?.message || '2FA devre dışı bırakılamadı');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateBackupCodes = async () => {
    setIsLoading(true);

    try {
      const response = await api.post('/auth/2fa/backup-codes/regenerate');
      setBackupCodes(response.data.backupCodes);
      setShowBackupCodes(true);
    } catch (err: any) {
      Alert.alert('Hata', err.response?.data?.message || 'Yedek kodlar oluşturulamadı');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    Clipboard.setString(text);
    Alert.alert('Kopyalandı', 'Kod panoya kopyalandı');
  };

  if (isLoading && !setupData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E53935" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={[styles.statusIcon, status.isEnabled && styles.statusIconActive]}>
            <Icon 
              name="shield-checkmark" 
              size={32} 
              color={status.isEnabled ? '#4CAF50' : '#9E9E9E'} 
            />
          </View>
          <View style={styles.statusInfo}>
            <Text style={styles.statusTitle}>İki Faktörlü Doğrulama</Text>
            <Text style={styles.statusSubtitle}>
              {status.isEnabled 
                ? 'Hesabınız 2FA ile korunuyor' 
                : 'Hesabınızı daha güvenli hale getirin'}
            </Text>
          </View>
          <View style={[styles.statusBadge, status.isEnabled && styles.statusBadgeActive]}>
            <Text style={[styles.statusBadgeText, status.isEnabled && styles.statusBadgeTextActive]}>
              {status.isEnabled ? 'Aktif' : 'Pasif'}
            </Text>
          </View>
        </View>

        {/* Setup Section (when not enabled) */}
        {!status.isEnabled && !setupData && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2FA'yı Etkinleştir</Text>
            <Text style={styles.sectionDescription}>
              İki faktörlü kimlik doğrulama, hesabınıza giriş yaparken şifrenizin yanı sıra 
              telefonunuzdaki bir uygulama tarafından oluşturulan bir kod girmenizi gerektirir.
            </Text>

            <View style={styles.requirementCard}>
              <Text style={styles.requirementTitle}>Gereksinimler:</Text>
              <View style={styles.requirementItem}>
                <Icon name="checkmark-circle" size={16} color="#2196F3" />
                <Text style={styles.requirementText}>Google Authenticator veya benzer TOTP uygulaması</Text>
              </View>
              <View style={styles.requirementItem}>
                <Icon name="checkmark-circle" size={16} color="#2196F3" />
                <Text style={styles.requirementText}>Akıllı telefon (iOS veya Android)</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={handleInitiate2FA}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Icon name="qr-code" size={20} color="#FFF" />
                  <Text style={styles.primaryButtonText}>2FA Kurulumunu Başlat</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Setup Flow (QR Code) */}
        {setupData && (
          <View style={styles.section}>
            <View style={styles.stepHeader}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.stepTitle}>QR Kodu Tarayın</Text>
            </View>
            <Text style={styles.stepDescription}>
              Google Authenticator veya benzer bir uygulama ile aşağıdaki QR kodunu tarayın.
            </Text>

            <View style={styles.qrContainer}>
              {setupData.qrCodeUrl ? (
                <Image
                  source={{ uri: setupData.qrCodeUrl }}
                  style={styles.qrCode}
                />
              ) : (
                <View style={styles.qrPlaceholder}>
                  <Icon name="qr-code" size={64} color="#BDBDBD" />
                </View>
              )}
            </View>

            <Text style={styles.manualText}>QR kodu tarayamıyorsanız:</Text>
            <View style={styles.secretContainer}>
              <Text style={styles.secretCode}>{setupData.secret}</Text>
              <TouchableOpacity 
                style={styles.copyButton}
                onPress={() => copyToClipboard(setupData.secret)}
              >
                <Icon name="copy" size={20} color="#E53935" />
              </TouchableOpacity>
            </View>

            <View style={[styles.stepHeader, { marginTop: 24 }]}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepTitle}>Doğrulama Kodunu Girin</Text>
            </View>
            <Text style={styles.stepDescription}>
              Uygulamanızda görünen 6 haneli kodu girin.
            </Text>

            <TextInput
              style={styles.codeInput}
              value={verificationCode}
              onChangeText={(text) => setVerificationCode(text.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              keyboardType="number-pad"
              maxLength={6}
            />

            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={() => {
                  setSetupData(null);
                  setVerificationCode('');
                }}
              >
                <Text style={styles.secondaryButtonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.primaryButton, 
                  styles.flexButton,
                  verificationCode.length !== 6 && styles.disabledButton
                ]}
                onPress={handleVerifyAndEnable}
                disabled={isVerifying || verificationCode.length !== 6}
              >
                {isVerifying ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.primaryButtonText}>Doğrula</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Enabled State Options */}
        {status.isEnabled && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Yedek Kodlar</Text>
              <Text style={styles.sectionDescription}>
                Telefonunuza erişiminizi kaybederseniz yedek kodları kullanarak giriş yapabilirsiniz.
              </Text>
              <TouchableOpacity 
                style={styles.secondaryButtonFull}
                onPress={handleRegenerateBackupCodes}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#757575" />
                ) : (
                  <>
                    <Icon name="key" size={20} color="#757575" />
                    <Text style={styles.secondaryButtonFullText}>Yeni Yedek Kodlar Oluştur</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>2FA'yı Devre Dışı Bırak</Text>
              <Text style={[styles.sectionDescription, { color: '#F44336' }]}>
                ⚠️ 2FA'yı devre dışı bırakmak hesabınızın güvenliğini azaltır.
              </Text>
              <TouchableOpacity 
                style={styles.dangerButton}
                onPress={() => setShowDisableModal(true)}
              >
                <Icon name="shield-off" size={20} color="#F44336" />
                <Text style={styles.dangerButtonText}>2FA'yı Devre Dışı Bırak</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Info Section */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>2FA Neden Önemli?</Text>
          <View style={styles.infoItem}>
            <Icon name="checkmark-circle" size={16} color="#4CAF50" />
            <Text style={styles.infoText}>Şifreniz çalınsa bile hesabınız güvende kalır</Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="checkmark-circle" size={16} color="#4CAF50" />
            <Text style={styles.infoText}>Phishing saldırılarına karşı ek koruma sağlar</Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="checkmark-circle" size={16} color="#4CAF50" />
            <Text style={styles.infoText}>Hesap erişiminde ek bir doğrulama katmanı ekler</Text>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Backup Codes Modal */}
      <Modal
        visible={showBackupCodes}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowBackupCodes(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={styles.modalSuccessIcon}>
              <Icon name="checkmark-circle" size={48} color="#4CAF50" />
            </View>
            <Text style={styles.modalTitle}>2FA Etkinleştirildi!</Text>
            <Text style={styles.modalSubtitle}>
              Aşağıdaki yedek kodları güvenli bir yere kaydedin.
            </Text>
          </View>

          <View style={styles.warningBox}>
            <Icon name="warning" size={20} color="#FF9800" />
            <Text style={styles.warningText}>
              Bu kodlar sadece bir kez gösterilecek. Telefonunuza erişiminizi kaybederseniz bu kodlara ihtiyacınız olacak.
            </Text>
          </View>

          <View style={styles.codesGrid}>
            {backupCodes.map((code, index) => (
              <View key={index} style={styles.codeBox}>
                <Text style={styles.codeBoxText}>{code}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity 
            style={styles.copyAllButton}
            onPress={() => copyToClipboard(backupCodes.join('\n'))}
          >
            <Icon name="copy" size={20} color="#757575" />
            <Text style={styles.copyAllButtonText}>Tüm Kodları Kopyala</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.modalPrimaryButton}
            onPress={() => {
              setShowBackupCodes(false);
              setBackupCodes([]);
            }}
          >
            <Text style={styles.modalPrimaryButtonText}>Tamam, Kaydettim</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Disable 2FA Modal */}
      <Modal
        visible={showDisableModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowDisableModal(false)}
      >
        <View style={styles.disableModalOverlay}>
          <View style={styles.disableModalContent}>
            <Text style={styles.disableModalTitle}>2FA'yı Devre Dışı Bırak</Text>
            <Text style={styles.disableModalText}>
              Bu işlem geri alınamaz. Devam etmek için şifrenizi girin.
            </Text>
            <TextInput
              style={styles.passwordInput}
              placeholder="Şifrenizi girin"
              secureTextEntry
              value={disablePassword}
              onChangeText={setDisablePassword}
            />
            <View style={styles.disableModalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setShowDisableModal(false);
                  setDisablePassword('');
                }}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.confirmDisableButton}
                onPress={handleDisable2FA}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.confirmDisableButtonText}>Devre Dışı Bırak</Text>
                )}
              </TouchableOpacity>
            </View>
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
    backgroundColor: '#FAFAFA',
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    margin: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statusIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusIconActive: {
    backgroundColor: '#E8F5E9',
  },
  statusInfo: {
    flex: 1,
    marginLeft: 12,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  statusSubtitle: {
    fontSize: 13,
    color: '#757575',
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusBadgeActive: {
    backgroundColor: '#E8F5E9',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#757575',
  },
  statusBadgeTextActive: {
    color: '#4CAF50',
  },
  section: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#757575',
    lineHeight: 20,
    marginBottom: 16,
  },
  requirementCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  requirementTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1565C0',
    marginBottom: 8,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  requirementText: {
    fontSize: 13,
    color: '#1565C0',
    marginLeft: 8,
  },
  primaryButton: {
    backgroundColor: '#E53935',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E53935',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  stepNumberText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#212121',
  },
  stepDescription: {
    fontSize: 13,
    color: '#757575',
    marginBottom: 16,
    marginLeft: 32,
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  qrCode: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  manualText: {
    fontSize: 13,
    color: '#757575',
    marginBottom: 8,
  },
  secretContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  secretCode: {
    flex: 1,
    fontFamily: 'monospace',
    fontSize: 14,
    color: '#212121',
  },
  copyButton: {
    padding: 4,
  },
  codeInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 8,
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#757575',
    fontSize: 16,
    fontWeight: '600',
  },
  flexButton: {
    flex: 1,
  },
  disabledButton: {
    backgroundColor: '#BDBDBD',
  },
  secondaryButtonFull: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryButtonFullText: {
    color: '#757575',
    fontSize: 16,
    fontWeight: '600',
  },
  dangerButton: {
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dangerButtonText: {
    color: '#F44336',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#F5F5F5',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#757575',
    marginLeft: 8,
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 24,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalSuccessIcon: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#E65100',
    marginLeft: 8,
  },
  codesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  codeBox: {
    width: '48%',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  codeBoxText: {
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
  },
  copyAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 16,
    gap: 8,
  },
  copyAllButtonText: {
    color: '#757575',
    fontSize: 14,
    fontWeight: '500',
  },
  modalPrimaryButton: {
    backgroundColor: '#E53935',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 'auto',
  },
  modalPrimaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disableModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  disableModalContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
  },
  disableModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
  },
  disableModalText: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 16,
  },
  passwordInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 16,
  },
  disableModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#757575',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmDisableButton: {
    flex: 1,
    backgroundColor: '#F44336',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmDisableButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TwoFactorScreen;
