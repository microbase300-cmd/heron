import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  Dimensions,
  Clipboard,
  Platform,
  RefreshControl,
  Animated,
  Easing
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { mobileApi } from './src/services/api';
import {
  User,
  WalletSummary,
  Transaction,
  DepositAddressConfig,
  NotificationMessage,
  ReferralData,
  MarketTicker,
  Investment,
  PlanConfig,
  PlanId
} from './src/types';

const { width, height } = Dimensions.get('window');

type NavTab = 'overview' | 'mandates' | 'liquidity' | 'referrals' | 'ledger';

// ============================================================================
// LUXURY OPENING SPLASH ANIMATION (HERON CAPITAL)
// ============================================================================
function OpeningSplashScreen({ onFinish }: { onFinish: () => void }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.75)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const titleYAnim = useRef(new Animated.Value(25)).current;
  const tagAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const exitAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Continuous subtle pulsing light on the central shield
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: 1300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Sequence: Fade & Scale in Crest -> Slide up Title -> Reveal Security & Progress -> Fade Out
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.parallel([
        Animated.timing(titleAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(titleYAnim, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(() => {
        Animated.timing(tagAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();

        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 1600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }).start(() => {
          setTimeout(() => {
            Animated.timing(exitAnim, {
              toValue: 0,
              duration: 450,
              useNativeDriver: true,
            }).start(onFinish);
          }, 350);
        });
      });
    });
  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View style={[styles.splashContainer, { opacity: exitAnim }]}>
      <ExpoStatusBar style="light" />
      <Animated.View
        style={[
          styles.splashGlowBg,
          {
            transform: [{ scale: pulseAnim }],
            opacity: fadeAnim,
          },
        ]}
      />

      <Animated.View
        style={[
          styles.splashCenterContent,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Heraldic Shield Monogram */}
        <Animated.View style={[styles.splashEmblemWrapper, { transform: [{ scale: pulseAnim }] }]}>
          <View style={styles.splashEmblemOuter}>
            <View style={styles.splashEmblemInner}>
              <Text style={styles.splashEmblemIcon}>🦅</Text>
            </View>
          </View>
          <View style={styles.splashShieldBadge}>
            <Text style={styles.splashShieldBadgeText}>H</Text>
          </View>
        </Animated.View>

        {/* Brand Typography */}
        <Animated.View
          style={{
            opacity: titleAnim,
            transform: [{ translateY: titleYAnim }],
            alignItems: 'center',
            marginTop: 26,
          }}
        >
          <Text style={styles.splashBrandName}>HERON CAPITAL</Text>
          <View style={styles.splashGoldLine} />
          <Text style={styles.splashTagline}>INSTITUTIONAL DIGITAL ASSET TRUSTEES</Text>
        </Animated.View>

        {/* Security & Progress Indicator */}
        <Animated.View style={{ opacity: tagAnim, alignItems: 'center', marginTop: 38, width: '100%' }}>
          <View style={styles.splashSecurityPill}>
            <View style={styles.splashPulseDot} />
            <Text style={styles.splashSecurityText}>256-BIT QUANTUM ENCRYPTION ACTIVE</Text>
          </View>

          <View style={styles.splashProgressBarTrack}>
            <Animated.View style={[styles.splashProgressBarFill, { width: progressWidth }]} />
          </View>
          <Text style={styles.splashLoadingText}>CONNECTING TO INSTITUTIONAL LEDGER...</Text>
        </Animated.View>
      </Animated.View>

      {/* Skip Button */}
      <TouchableOpacity style={styles.splashSkipBtn} onPress={onFinish} activeOpacity={0.7}>
        <Text style={styles.splashSkipText}>ENTER PORTAL →</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function App() {
  // Splash Screen state
  const [splashVisible, setSplashVisible] = useState(true);

  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authOtp, setAuthOtp] = useState('');
  const [authReferral, setAuthReferral] = useState('');
  const [regStep, setRegStep] = useState<1 | 2>(1);
  const [devOtpCode, setDevOtpCode] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Backend Health & Endpoint config modal
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [customApiUrl, setCustomApiUrl] = useState(mobileApi.getBaseUrl());

  // App Navigation & Modals
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  // Operational Data
  const [walletSummary, setWalletSummary] = useState<WalletSummary | null>(null);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [plans, setPlans] = useState<PlanConfig[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [tickers, setTickers] = useState<MarketTicker[]>([]);
  const [depositAddresses, setDepositAddresses] = useState<DepositAddressConfig[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Notification popup & message box states
  const [priorityPopUpNotif, setPriorityPopUpNotif] = useState<NotificationMessage | null>(null);
  const [selectedDetailNotif, setSelectedDetailNotif] = useState<NotificationMessage | null>(null);
  const seenMobilePopupsRef = useRef<Set<string>>(new Set());

  // Modal form states
  const [depositAsset, setDepositAsset] = useState('USDT (TRC-20)');
  const [depositAmount, setDepositAmount] = useState('');
  const [depositTxHash, setDepositTxHash] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAsset, setWithdrawAsset] = useState('USDT (TRC-20)');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawOtp, setWithdrawOtp] = useState('');
  const [withdrawStep, setWithdrawStep] = useState<1 | 2>(1);
  const [withdrawDevOtp, setWithdrawDevOtp] = useState<string | null>(null);

  const [selectedPlanId, setSelectedPlanId] = useState<PlanId>('standard');
  const [investAmount, setInvestAmount] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  // Countdown timer ticker for active timelocks
  const [, setTimerTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTimerTick(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadAllData = async () => {
    if (!mobileApi.getToken()) return;
    try {
      setRefreshing(true);
      const [
        summaryRes,
        invRes,
        plansRes,
        txsRes,
        notifRes,
        refRes,
        tickerRes,
        addrRes
      ] = await Promise.allSettled([
        mobileApi.getWalletSummary(),
        mobileApi.getMyInvestments(),
        mobileApi.getPlans(),
        mobileApi.getTransactions(),
        mobileApi.getNotifications(),
        mobileApi.getReferrals(),
        mobileApi.getMarketTickers(),
        mobileApi.getDepositAddresses()
      ]);

      if (summaryRes.status === 'fulfilled') setWalletSummary(summaryRes.value);
      if (invRes.status === 'fulfilled') setInvestments(invRes.value.investments || []);
      if (plansRes.status === 'fulfilled') setPlans(plansRes.value.plans || []);
      if (txsRes.status === 'fulfilled') setTransactions(txsRes.value.transactions || []);
      if (notifRes.status === 'fulfilled') {
        const notifList = notifRes.value.notifications || [];
        setNotifications(notifList);
        setUnreadCount(notifRes.value.unreadCount || 0);

        const urgent = notifList.find(
          (n: NotificationMessage) =>
            !n.isRead &&
            (n.type === 'alert' || n.type === 'success' || n.type === 'warning') &&
            !seenMobilePopupsRef.current.has(n.id)
        );
        if (urgent && !priorityPopUpNotif) {
          seenMobilePopupsRef.current.add(urgent.id);
          setPriorityPopUpNotif(urgent);
        }
      }
      if (refRes.status === 'fulfilled') setReferralData(refRes.value);
      if (tickerRes.status === 'fulfilled') setTickers(tickerRes.value || []);
      if (addrRes.status === 'fulfilled') setDepositAddresses(addrRes.value.addresses || []);
    } catch (err) {
      console.warn('Mobile sync notice:', err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadAllData();
      const interval = setInterval(loadAllData, 20000); // 20s auto-refresh
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  // Auth Handlers
  const handleLogin = async () => {
    if (!authEmail.trim() || !authPassword.trim()) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }
    setAuthLoading(true);
    try {
      const res = await mobileApi.login(authEmail.trim(), authPassword.trim());
      setCurrentUser(res.user);
      Alert.alert('Success', `Welcome back, ${res.user.name}`);
    } catch (err: any) {
      Alert.alert('Authentication Failed', err.message || 'Invalid email or password.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRequestRegOtp = async () => {
    if (!authName.trim() || !authEmail.trim() || !authPassword.trim()) {
      Alert.alert('Missing Details', 'Name, email, and password (min 6 chars) are required.');
      return;
    }
    setAuthLoading(true);
    try {
      const res = await mobileApi.sendRegistrationOtp(authEmail.trim());
      if (res.devOtp) {
        setDevOtpCode(res.devOtp);
        setAuthOtp(res.devOtp);
      }
      setRegStep(2);
      Alert.alert('Security OTP Sent', `A 6-digit security code was dispatched to ${authEmail}.`);
    } catch (err: any) {
      Alert.alert('Registration Notice', err.message || 'Failed to dispatch verification OTP.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleCompleteRegister = async () => {
    if (!authOtp.trim() || authOtp.trim().length !== 6) {
      Alert.alert('Verification Code', 'Please enter the 6-digit verification OTP.');
      return;
    }
    setAuthLoading(true);
    try {
      const res = await mobileApi.register({
        name: authName.trim(),
        email: authEmail.trim(),
        password: authPassword.trim(),
        otpCode: authOtp.trim(),
        referralCode: authReferral.trim() || undefined
      });
      setCurrentUser(res.user);
      Alert.alert('Account Verified', 'Your portfolio has been created with $0.00 initial balance. Deposit liquidity to start earning yield.');
    } catch (err: any) {
      Alert.alert('Registration Error', err.message || 'Failed to register account.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await mobileApi.logout();
    setCurrentUser(null);
    setWalletSummary(null);
    setInvestments([]);
    setTransactions([]);
  };

  // Deposit Submit
  const handleDepositSubmit = async () => {
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid deposit amount.');
      return;
    }
    if (!depositTxHash.trim()) {
      Alert.alert('Missing Hash', 'Please provide your blockchain transaction hash.');
      return;
    }
    setModalLoading(true);
    try {
      await mobileApi.submitDeposit(amt, depositAsset, depositTxHash.trim(), depositAsset);
      Alert.alert('Deposit Receipt Submitted', 'Your inbound deposit is now pending confirmation by the Executive Settlement Desk. Funds will be credited once verified.');
      setShowDepositModal(false);
      setDepositAmount('');
      setDepositTxHash('');
      loadAllData();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to submit deposit receipt.');
    } finally {
      setModalLoading(false);
    }
  };

  // Withdrawal Handlers
  const handleRequestWithdrawOtp = async () => {
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid withdrawal amount.');
      return;
    }
    if (!withdrawAddress.trim()) {
      Alert.alert('Missing Address', 'Please enter your recipient wallet address.');
      return;
    }
    const avail = walletSummary?.availableBalance ?? 0;
    if (amt > avail) {
      Alert.alert('Insufficient Balance', `Your available balance is $${avail.toFixed(2)}.`);
      return;
    }
    setModalLoading(true);
    try {
      const res = await mobileApi.requestWithdrawalOtp(amt, withdrawAsset);
      if (res.devOtp) {
        setWithdrawDevOtp(res.devOtp);
        setWithdrawOtp(res.devOtp);
      }
      setWithdrawStep(2);
      Alert.alert('OTP Dispatched', 'A 6-digit security authorization code was sent to your registered email.');
    } catch (err: any) {
      Alert.alert('Withdrawal Notice', err.message || 'Failed to request withdrawal OTP.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleCompleteWithdrawal = async () => {
    if (!withdrawOtp.trim() || withdrawOtp.trim().length !== 6) {
      Alert.alert('Invalid Code', 'Please enter the 6-digit authorization code.');
      return;
    }
    setModalLoading(true);
    try {
      await mobileApi.submitWithdrawal(parseFloat(withdrawAmount), withdrawAsset, withdrawAddress.trim(), withdrawOtp.trim());
      Alert.alert('Disbursement Submitted', 'Your withdrawal has been placed into pending escrow awaiting Executive Treasury approval.');
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      setWithdrawAddress('');
      setWithdrawOtp('');
      setWithdrawStep(1);
      loadAllData();
    } catch (err: any) {
      Alert.alert('Withdrawal Error', err.message || 'Failed to authorize withdrawal.');
    } finally {
      setModalLoading(false);
    }
  };

  // Deploy Capital
  const handleCreateInvestment = async () => {
    const amt = parseFloat(investAmount);
    if (isNaN(amt) || amt <= 0) {
      Alert.alert('Invalid Amount', 'Please enter an allocation amount.');
      return;
    }
    const avail = walletSummary?.availableBalance ?? 0;
    if (amt > avail) {
      Alert.alert('Insufficient Balance', `Available: $${avail.toFixed(2)}. Please deposit additional liquidity.`);
      return;
    }
    setModalLoading(true);
    try {
      await mobileApi.createInvestment(selectedPlanId, amt);
      Alert.alert('Mandate Deployed', 'Your timelocked smart contract has started. Programmatic yield will accrue in real time.');
      setShowInvestModal(false);
      setInvestAmount('');
      loadAllData();
    } catch (err: any) {
      Alert.alert('Investment Error', err.message || 'Failed to deploy mandate.');
    } finally {
      setModalLoading(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    Clipboard.setString(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const formatCountdown = (expiresAt: string) => {
    const diff = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = diff % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Periodic health check to show live status badge
  useEffect(() => {
    let mounted = true;
    const checkApi = async () => {
      const res = await mobileApi.checkHealth();
      if (mounted) setBackendOnline(res.online);
    };
    checkApi();
    const poll = setInterval(checkApi, 5000);
    return () => {
      mounted = false;
      clearInterval(poll);
    };
  }, [customApiUrl]);

  // --------------------------------------------------------------------------
  // RENDER: Opening Splash Screen
  // --------------------------------------------------------------------------
  if (splashVisible) {
    return <OpeningSplashScreen onFinish={() => setSplashVisible(false)} />;
  }

  // --------------------------------------------------------------------------
  // RENDER: Unauthenticated (Login & 2-Step OTP Register)
  // --------------------------------------------------------------------------
  if (!currentUser) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <ExpoStatusBar style="light" />
        <ScrollView contentContainerStyle={styles.authScroll}>
          <View style={styles.authBox}>
            {/* Logo */}
            <View style={styles.logoBadgeBig}>
              <Text style={styles.logoTextBig}>H</Text>
            </View>
            <Text style={styles.authBrandTitle}>HERON DIGITAL CAPITAL</Text>
            <Text style={styles.authBrandSub}>INSTITUTIONAL CRYPTO WEALTH</Text>

            {/* Live Connection Status Pill */}
            <TouchableOpacity
              style={[
                styles.connStatusPill,
                backendOnline === true ? styles.connStatusOnline : backendOnline === false ? styles.connStatusOffline : styles.connStatusPending
              ]}
              onPress={() => setShowConfigModal(true)}
              activeOpacity={0.8}
            >
              <View style={[
                styles.connDot,
                backendOnline === true ? styles.connDotOnline : backendOnline === false ? styles.connDotOffline : styles.connDotPending
              ]} />
              <Text style={styles.connStatusText}>
                {backendOnline === true
                  ? `Live API: ${mobileApi.getBaseUrl().replace(/^https?:\/\//, '')}`
                  : backendOnline === false
                  ? `Cannot Reach API (Tap to Configure)`
                  : `Connecting to ${mobileApi.getBaseUrl().replace(/^https?:\/\//, '')}...`}
              </Text>
            </TouchableOpacity>

            {/* Toggle Login / Register */}
            <View style={styles.authToggleRow}>
              <TouchableOpacity
                style={[styles.authToggleBtn, authMode === 'login' && styles.authToggleBtnActive]}
                onPress={() => setAuthMode('login')}
              >
                <Text style={[styles.authToggleText, authMode === 'login' && styles.authToggleTextActive]}>
                  Sign In
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.authToggleBtn, authMode === 'register' && styles.authToggleBtnActive]}
                onPress={() => {
                  setAuthMode('register');
                  setRegStep(1);
                }}
              >
                <Text style={[styles.authToggleText, authMode === 'register' && styles.authToggleTextActive]}>
                  Register (OTP)
                </Text>
              </TouchableOpacity>
            </View>

            {authMode === 'login' ? (
              /* LOGIN FORM */
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>Investor Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="investor@example.com"
                  placeholderTextColor="#666"
                  value={authEmail}
                  onChangeText={setAuthEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <Text style={styles.fieldLabel}>Master Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••••••"
                  placeholderTextColor="#666"
                  secureTextEntry
                  value={authPassword}
                  onChangeText={setAuthPassword}
                />

                <TouchableOpacity
                  style={styles.goldBtn}
                  onPress={handleLogin}
                  disabled={authLoading}
                  activeOpacity={0.8}
                >
                  {authLoading ? (
                    <ActivityIndicator color="#070908" />
                  ) : (
                    <Text style={styles.goldBtnText}>Access Portfolio</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              /* 2-STEP OTP REGISTRATION FORM */
              <View style={styles.formGroup}>
                {regStep === 1 ? (
                  <>
                    <Text style={styles.fieldLabel}>Full Legal Name</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Alexander Vance"
                      placeholderTextColor="#666"
                      value={authName}
                      onChangeText={setAuthName}
                    />

                    <Text style={styles.fieldLabel}>Work / Personal Email</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="investor@domain.com"
                      placeholderTextColor="#666"
                      value={authEmail}
                      onChangeText={setAuthEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />

                    <Text style={styles.fieldLabel}>Account Password</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Min 6 characters"
                      placeholderTextColor="#666"
                      secureTextEntry
                      value={authPassword}
                      onChangeText={setAuthPassword}
                    />

                    <Text style={styles.fieldLabel}>Referral Code (Optional)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. REF-ABC123"
                      placeholderTextColor="#666"
                      value={authReferral}
                      onChangeText={setAuthReferral}
                      autoCapitalize="characters"
                    />

                    <TouchableOpacity
                      style={styles.goldBtn}
                      onPress={handleRequestRegOtp}
                      disabled={authLoading}
                      activeOpacity={0.8}
                    >
                      {authLoading ? (
                        <ActivityIndicator color="#070908" />
                      ) : (
                        <Text style={styles.goldBtnText}>Request Verification OTP →</Text>
                      )}
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <View style={styles.otpNoticeBox}>
                      <Text style={styles.otpNoticeTitle}>✉️ Security Verification Code</Text>
                      <Text style={styles.otpNoticeSub}>
                        Enter the 6-digit confirmation code dispatched to {authEmail}.
                      </Text>
                      {devOtpCode && (
                        <View style={styles.devOtpBadge}>
                          <Text style={styles.devOtpText}>🛡️ Passcode: {devOtpCode}</Text>
                        </View>
                      )}
                    </View>

                    <Text style={styles.fieldLabel}>6-Digit OTP Code</Text>
                    <TextInput
                      style={[styles.input, styles.otpInput]}
                      placeholder="000000"
                      placeholderTextColor="#666"
                      keyboardType="number-pad"
                      maxLength={6}
                      value={authOtp}
                      onChangeText={setAuthOtp}
                    />

                    <TouchableOpacity
                      style={styles.goldBtn}
                      onPress={handleCompleteRegister}
                      disabled={authLoading}
                      activeOpacity={0.8}
                    >
                      {authLoading ? (
                        <ActivityIndicator color="#070908" />
                      ) : (
                        <Text style={styles.goldBtnText}>Complete & Verify Account</Text>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.backBtn}
                      onPress={() => setRegStep(1)}
                    >
                      <Text style={styles.backBtnText}>← Back to Details</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}

            {/* API Endpoint Config Link */}
            <TouchableOpacity
              style={styles.endpointLink}
              onPress={() => setShowConfigModal(true)}
            >
              <Text style={styles.endpointText}>⚙️ Server API: {mobileApi.getBaseUrl()}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Server Endpoint Config Modal */}
        <Modal visible={showConfigModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Backend Server Configuration</Text>
              <Text style={styles.modalSubtitle}>
                Select a quick preset or enter your PC's Wi-Fi LAN IP (e.g. http://192.168.43.149:5000/api):
              </Text>

              {/* Quick Presets */}
              <View style={styles.presetContainer}>
                <TouchableOpacity
                  style={styles.presetBtn}
                  onPress={() => setCustomApiUrl('http://192.168.43.149:5000/api')}
                >
                  <Text style={styles.presetBtnText}>📱 Wi-Fi IP (192.168.43.149:5000)</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.presetBtn}
                  onPress={() => setCustomApiUrl('http://10.0.2.2:5000/api')}
                >
                  <Text style={styles.presetBtnText}>🤖 Android Studio AVD (10.0.2.2:5000)</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.presetBtn}
                  onPress={() => setCustomApiUrl('http://localhost:5000/api')}
                >
                  <Text style={styles.presetBtnText}>🌐 Web / Simulator (localhost:5000)</Text>
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.input}
                value={customApiUrl}
                onChangeText={setCustomApiUrl}
                placeholder="http://192.168.43.149:5000/api"
                placeholderTextColor="#666"
                autoCapitalize="none"
              />

              <View style={styles.modalBtnRow}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setShowConfigModal(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalGoldBtn}
                  onPress={async () => {
                    mobileApi.setBaseUrl(customApiUrl);
                    setShowConfigModal(false);
                    const health = await mobileApi.checkHealth();
                    setBackendOnline(health.online);
                    Alert.alert(
                      health.online ? 'Connected!' : 'Saved (Endpoint Offline)',
                      health.online
                        ? `Successfully connected to ${customApiUrl}`
                        : `Saved ${customApiUrl}, but could not reach server. Verify backend is running on your PC.`
                    );
                  }}
                >
                  <Text style={styles.modalGoldText}>Save Endpoint</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  // --------------------------------------------------------------------------
  // RENDER: Authenticated Main Dashboard
  // --------------------------------------------------------------------------
  const activeMandates = investments.filter(i => i.status === 'active');
  const availableBal = walletSummary?.availableBalance ?? currentUser.balance ?? 0;
  const portfolioNav = walletSummary?.totalPortfolioValue ?? (availableBal + (walletSummary?.lockedInInvestments ?? 0));

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ExpoStatusBar style="light" />

      {/* Top Mobile Header */}
      <View style={styles.appHeader}>
        <View style={styles.brandRow}>
          <View style={styles.logoBadgeSmall}>
            <Text style={styles.logoTextSmall}>H</Text>
          </View>
          <View>
            <Text style={styles.headerBrandTitle}>HERON ASSETS</Text>
            <Text style={styles.headerBrandSub}>INSTITUTIONAL LIQUIDITY</Text>
          </View>
        </View>

        <View style={styles.headerRightControls}>
          {/* Notification Bell with Unread Badge */}
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => setShowNotificationModal(true)}
          >
            <Text style={styles.headerIconText}>🔔</Text>
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* User Avatar / Logout */}
          <TouchableOpacity style={styles.avatarBtn} onPress={handleLogout}>
            <Text style={styles.avatarText}>{currentUser.name.charAt(0).toUpperCase()}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Live Market Tickers Ribbon */}
      <View style={styles.tickersBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tickersScroll}>
          {tickers.map((t, idx) => (
            <View key={idx} style={styles.tickerPill}>
              <Text style={styles.tickerSymbol}>{t.symbol}</Text>
              <Text style={styles.tickerPrice}>${t.price >= 1 ? t.price.toLocaleString('en-US', { minimumFractionDigits: 2 }) : t.price.toFixed(4)}</Text>
              <Text style={[styles.tickerChange, { color: t.change24h >= 0 ? '#28d17c' : '#ff5252' }]}>
                {t.change24h >= 0 ? '+' : ''}{t.change24h.toFixed(2)}%
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Main Tab Views */}
      <ScrollView
        style={styles.mainScroll}
        contentContainerStyle={styles.mainScrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadAllData} tintColor="#d4af37" />}
      >
        {activeTab === 'overview' && (
          /* TAB 1: OVERVIEW */
          <View style={styles.tabContent}>
            {/* Primary NAV Card */}
            <View style={styles.navCard}>
              <Text style={styles.cardEyebrow}>TOTAL PORTFOLIO NET ASSET VALUE</Text>
              <Text style={styles.navAmount}>${portfolioNav.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
              
              <View style={styles.navSubRow}>
                <Text style={styles.navSubLabel}>Available Liquidity: </Text>
                <Text style={styles.navSubValue}>${availableBal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.primaryActionBtn}
                  onPress={() => setShowDepositModal(true)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.primaryActionText}>+ Add Liquidity</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryActionBtn}
                  onPress={() => {
                    setWithdrawStep(1);
                    setShowWithdrawModal(true);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.secondaryActionText}>Withdraw ↗</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Quick Mandate Deploy Card */}
            <View style={styles.deployCard}>
              <View style={styles.deployLeft}>
                <Text style={styles.deployTitle}>Institutional Yield Mandates</Text>
                <Text style={styles.deploySub}>Earn 4.5% - 22.5% fixed programmatic return</Text>
              </View>
              <TouchableOpacity
                style={styles.deployBtn}
                onPress={() => setShowInvestModal(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.deployBtnText}>Deploy Capital</Text>
              </TouchableOpacity>
            </View>

            {/* Active Mandates Live Timelocks */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeading}>ACTIVE TIMELOCK CONTRACTS ({activeMandates.length})</Text>
              <TouchableOpacity onPress={() => setActiveTab('mandates')}>
                <Text style={styles.sectionLinkText}>View All →</Text>
              </TouchableOpacity>
            </View>

            {activeMandates.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>No active investment mandates deployed.</Text>
                <TouchableOpacity onPress={() => setShowInvestModal(true)}>
                  <Text style={styles.emptyLink}>Deploy Capital to Start Earning →</Text>
                </TouchableOpacity>
              </View>
            ) : (
              activeMandates.map((inv) => (
                <View key={inv.id} style={styles.mandateCard}>
                  <View style={styles.mandateHeader}>
                    <Text style={styles.mandateName}>{inv.planName}</Text>
                    <View style={styles.countdownBadge}>
                      <Text style={styles.countdownText}>⏱ {formatCountdown(inv.expiresAt)}</Text>
                    </View>
                  </View>

                  <View style={styles.mandateGrid}>
                    <View>
                      <Text style={styles.mandateLabel}>LOCKED PRINCIPAL</Text>
                      <Text style={styles.mandateVal}>${inv.amount.toLocaleString()}</Text>
                    </View>
                    <View>
                      <Text style={styles.mandateLabel}>ESTIMATED PAYOUT</Text>
                      <Text style={[styles.mandateVal, { color: '#28d17c' }]}>${inv.totalPayout.toLocaleString()}</Text>
                    </View>
                  </View>

                  {/* Progress bar */}
                  <View style={styles.progressBarBg}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${Math.min(100, Math.max(5, inv.progressPercent || 20))}%` }
                      ]}
                    />
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'mandates' && (
          /* TAB 2: MANDATES */
          <View style={styles.tabContent}>
            <View style={styles.mandatesHeaderBox}>
              <Text style={styles.pageTitle}>Institutional Mandates</Text>
              <Text style={styles.pageSub}>Deterministic smart escrow contracts with automated yield releases.</Text>
              <TouchableOpacity
                style={styles.goldBtnFull}
                onPress={() => setShowInvestModal(true)}
              >
                <Text style={styles.goldBtnText}>+ Deploy New Mandate</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionHeading}>ALL INVESTMENT CONTRACTS ({investments.length})</Text>
            {investments.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>No investments found.</Text>
              </View>
            ) : (
              investments.map((inv) => (
                <View key={inv.id} style={styles.mandateCard}>
                  <View style={styles.mandateHeader}>
                    <Text style={styles.mandateName}>{inv.planName}</Text>
                    <View style={[styles.statusPill, inv.status === 'completed' && styles.statusCompleted]}>
                      <Text style={styles.statusPillText}>{inv.status.toUpperCase()}</Text>
                    </View>
                  </View>

                  <View style={styles.mandateGrid}>
                    <View>
                      <Text style={styles.mandateLabel}>PRINCIPAL</Text>
                      <Text style={styles.mandateVal}>${inv.amount.toLocaleString()}</Text>
                    </View>
                    <View>
                      <Text style={styles.mandateLabel}>TOTAL PAYOUT</Text>
                      <Text style={[styles.mandateVal, { color: '#28d17c' }]}>${inv.totalPayout.toLocaleString()}</Text>
                    </View>
                  </View>
                  <Text style={styles.timeInfo}>
                    Started: {new Date(inv.startedAt).toLocaleDateString()} • Expires: {new Date(inv.expiresAt).toLocaleDateString()}
                  </Text>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'liquidity' && (
          /* TAB 3: LIQUIDITY (DEPOSIT & WITHDRAW TERMINAL) */
          <View style={styles.tabContent}>
            <Text style={styles.pageTitle}>Multi-Asset Liquidity Hub</Text>
            <Text style={styles.pageSub}>Inbound treasury addresses & automated disbursement pipeline.</Text>

            <View style={styles.actionCardGrid}>
              <TouchableOpacity
                style={styles.liquidityCard}
                onPress={() => setShowDepositModal(true)}
              >
                <Text style={styles.liqIcon}>📥</Text>
                <Text style={styles.liqTitle}>Inbound Deposit</Text>
                <Text style={styles.liqSub}>Add BTC, ETH, USDT (TRC-20/ERC-20), or SOL</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.liquidityCard}
                onPress={() => {
                  setWithdrawStep(1);
                  setShowWithdrawModal(true);
                }}
              >
                <Text style={styles.liqIcon}>📤</Text>
                <Text style={styles.liqTitle}>Outbound Withdrawal</Text>
                <Text style={styles.liqSub}>2FA OTP verified direct-to-wallet disbursement</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionHeading}>ACTIVE RECEIVING ADDRESSES</Text>
            {depositAddresses.map((addr) => (
              <View key={addr.key} style={styles.addressCard}>
                <View style={styles.addressTop}>
                  <Text style={styles.networkName}>{addr.network}</Text>
                  <Text style={styles.assetBadge}>{addr.asset}</Text>
                </View>
                <Text style={styles.addressString} numberOfLines={1}>{addr.address}</Text>
                <TouchableOpacity
                  style={styles.copyBtn}
                  onPress={() => copyToClipboard(addr.address, addr.key)}
                >
                  <Text style={styles.copyBtnText}>
                    {copiedKey === addr.key ? '✓ Copied Address' : 'Copy Address'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'referrals' && (
          /* TAB 4: REFERRALS */
          <View style={styles.tabContent}>
            <Text style={styles.pageTitle}>Partner Affiliate Program</Text>
            <Text style={styles.pageSub}>Earn up to 30% instant programmatic commission on downline allocations.</Text>

            <View style={styles.referralCard}>
              <Text style={styles.cardEyebrow}>YOUR PARTNER REFERRAL CODE</Text>
              <Text style={styles.referralCodeText}>{referralData?.referralCode || currentUser.referralCode}</Text>

              <TouchableOpacity
                style={styles.goldBtnFull}
                onPress={() => copyToClipboard(referralData?.referralCode || currentUser.referralCode, 'ref')}
              >
                <Text style={styles.goldBtnText}>
                  {copiedKey === 'ref' ? '✓ Referral Code Copied' : 'Copy Referral Code'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.refStatsGrid}>
              <View style={styles.refStatBox}>
                <Text style={styles.statLabel}>TOTAL REFERRED</Text>
                <Text style={styles.statValue}>{referralData?.totalReferrals || 0} Investors</Text>
              </View>
              <View style={styles.refStatBox}>
                <Text style={styles.statLabel}>COMMISSIONS EARNED</Text>
                <Text style={[styles.statValue, { color: '#d4af37' }]}>
                  ${(referralData?.totalCommissionEarned || 0).toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'ledger' && (
          /* TAB 5: LEDGER */
          <View style={styles.tabContent}>
            <Text style={styles.pageTitle}>Cryptographic Audit Ledger</Text>
            <Text style={styles.pageSub}>Immutable on-chain records, settlement receipts, and payout proofs.</Text>

            {transactions.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>No ledger records found.</Text>
              </View>
            ) : (
              transactions.map((tx) => (
                <View key={tx.id} style={styles.txCard}>
                  <View style={styles.txHeader}>
                    <Text style={styles.txType}>{tx.type.replace('_', ' ').toUpperCase()} • {tx.asset}</Text>
                    <Text style={[styles.txAmount, { color: tx.type === 'deposit' || tx.type === 'yield_payout' ? '#28d17c' : '#ffffff' }]}>
                      {tx.type === 'deposit' || tx.type === 'yield_payout' ? '+' : ''}${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </Text>
                  </View>
                  <Text style={styles.txNote}>{tx.note || tx.id}</Text>
                  <View style={styles.txFooter}>
                    <Text style={styles.txStatus}>{tx.status.toUpperCase()}</Text>
                    <Text style={styles.txDate}>{new Date(tx.createdAt).toLocaleDateString()}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        {[
          { id: 'overview', label: 'Portfolio', icon: '📊' },
          { id: 'mandates', label: 'Mandates', icon: '⚡' },
          { id: 'liquidity', label: 'Liquidity', icon: '💳' },
          { id: 'referrals', label: 'Affiliate', icon: '👥' },
          { id: 'ledger', label: 'Ledger', icon: '📜' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={styles.navItem}
            onPress={() => setActiveTab(tab.id as NavTab)}
          >
            <Text style={styles.navIcon}>{tab.icon}</Text>
            <Text style={[styles.navLabel, activeTab === tab.id && styles.navLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ========================================================================= */}
      {/* MODAL 1: DEPOSIT MODAL */}
      {/* ========================================================================= */}
      <Modal visible={showDepositModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.modalTitle}>Inbound Multi-Asset Deposit</Text>
              <TouchableOpacity onPress={() => setShowDepositModal(false)}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.sheetBody}>
              <Text style={styles.fieldLabel}>Select Network Asset</Text>
              <View style={styles.assetPillRow}>
                {['USDT (TRC-20)', 'USDT (ERC-20)', 'BTC', 'ETH', 'SOL'].map((asset) => (
                  <TouchableOpacity
                    key={asset}
                    style={[styles.assetPill, depositAsset === asset && styles.assetPillActive]}
                    onPress={() => setDepositAsset(asset)}
                  >
                    <Text style={[styles.assetPillText, depositAsset === asset && styles.assetPillTextActive]}>
                      {asset}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.fieldLabel}>Deposit Amount ($ USD Equivalent)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 5000"
                placeholderTextColor="#666"
                keyboardType="numeric"
                value={depositAmount}
                onChangeText={setDepositAmount}
              />

              <Text style={styles.fieldLabel}>Blockchain Transaction Hash (TXID)</Text>
              <TextInput
                style={styles.input}
                placeholder="Paste transaction hash / receipt..."
                placeholderTextColor="#666"
                value={depositTxHash}
                onChangeText={setDepositTxHash}
              />

              <TouchableOpacity
                style={styles.goldBtnFull}
                onPress={handleDepositSubmit}
                disabled={modalLoading}
              >
                {modalLoading ? <ActivityIndicator color="#070908" /> : <Text style={styles.goldBtnText}>Submit Deposit Receipt</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 2: 2-STEP OTP WITHDRAWAL MODAL */}
      {/* ========================================================================= */}
      <Modal visible={showWithdrawModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.modalTitle}>Capital Disbursement (2FA)</Text>
              <TouchableOpacity onPress={() => setShowWithdrawModal(false)}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.sheetBody}>
              {withdrawStep === 1 ? (
                <>
                  <Text style={styles.fieldLabel}>Withdrawal Amount ($ USD)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={`Max: $${availableBal.toFixed(2)}`}
                    placeholderTextColor="#666"
                    keyboardType="numeric"
                    value={withdrawAmount}
                    onChangeText={setWithdrawAmount}
                  />

                  <Text style={styles.fieldLabel}>Destination Network</Text>
                  <View style={styles.assetPillRow}>
                    {['USDT (TRC-20)', 'USDT (ERC-20)', 'BTC', 'ETH', 'SOL'].map((asset) => (
                      <TouchableOpacity
                        key={asset}
                        style={[styles.assetPill, withdrawAsset === asset && styles.assetPillActive]}
                        onPress={() => setWithdrawAsset(asset)}
                      >
                        <Text style={[styles.assetPillText, withdrawAsset === asset && styles.assetPillTextActive]}>
                          {asset}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.fieldLabel}>Destination Wallet Address</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter recipient address..."
                    placeholderTextColor="#666"
                    value={withdrawAddress}
                    onChangeText={setWithdrawAddress}
                  />

                  <TouchableOpacity
                    style={styles.goldBtnFull}
                    onPress={handleRequestWithdrawOtp}
                    disabled={modalLoading}
                  >
                    {modalLoading ? <ActivityIndicator color="#070908" /> : <Text style={styles.goldBtnText}>Verify & Request 2FA OTP →</Text>}
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <View style={styles.otpNotice}>
                    <Text style={styles.otpNoticeTitle}>Authorize Capital Release</Text>
                    <Text style={styles.otpNoticeBody}>
                      Enter the 6-digit code sent to {currentUser.email}
                    </Text>
                    {withdrawDevOtp && (
                      <TouchableOpacity
                        style={styles.devPill}
                        onPress={() => setWithdrawOtp(withdrawDevOtp)}
                      >
                        <Text style={styles.devPillText}>🛡️ Passcode: {withdrawDevOtp} (Tap to autofill)</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <Text style={styles.fieldLabel}>6-Digit Security OTP</Text>
                  <TextInput
                    style={[styles.input, styles.otpInput]}
                    placeholder="000000"
                    placeholderTextColor="#666"
                    keyboardType="number-pad"
                    maxLength={6}
                    value={withdrawOtp}
                    onChangeText={setWithdrawOtp}
                  />

                  <TouchableOpacity
                    style={styles.goldBtnFull}
                    onPress={handleCompleteWithdrawal}
                    disabled={modalLoading}
                  >
                    {modalLoading ? <ActivityIndicator color="#070908" /> : <Text style={styles.goldBtnText}>Authorize Disbursement</Text>}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => setWithdrawStep(1)}
                  >
                    <Text style={styles.backBtnText}>← Back to Amount</Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 3: DEPLOY CAPITAL MODAL */}
      {/* ========================================================================= */}
      <Modal visible={showInvestModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.modalTitle}>Deploy Capital Mandate</Text>
              <TouchableOpacity onPress={() => setShowInvestModal(false)}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.sheetBody}>
              <Text style={styles.fieldLabel}>Select Mandate Tier</Text>
              {plans.map((plan) => (
                <TouchableOpacity
                  key={plan.id}
                  style={[styles.planCard, selectedPlanId === plan.id && styles.planCardActive]}
                  onPress={() => setSelectedPlanId(plan.id)}
                >
                  <View style={styles.planCardTop}>
                    <Text style={styles.planCardName}>{plan.name}</Text>
                    <Text style={styles.planCardBadge}>{plan.badge}</Text>
                  </View>
                  <Text style={styles.planCardLimits}>
                    Min: ${(typeof plan.min === 'number' ? plan.min : 100).toLocaleString()} • Max: {(plan.max === null || plan.max === undefined || plan.max === Infinity || plan.max >= 99999999) ? 'Uncapped' : `$${Number(plan.max).toLocaleString()}`}
                  </Text>
                </TouchableOpacity>
              ))}

              <Text style={styles.fieldLabel}>Allocation Amount ($ USD)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 8000"
                placeholderTextColor="#666"
                keyboardType="numeric"
                value={investAmount}
                onChangeText={setInvestAmount}
              />

              <TouchableOpacity
                style={styles.goldBtnFull}
                onPress={handleCreateInvestment}
                disabled={modalLoading}
              >
                {modalLoading ? <ActivityIndicator color="#070908" /> : <Text style={styles.goldBtnText}>Deploy Capital Contract</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 4: NOTIFICATIONS CENTER DRAWER */}
      {/* ========================================================================= */}
      <Modal visible={showNotificationModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.modalTitle}>Notifications ({notifications.length})</Text>
              <TouchableOpacity onPress={() => setShowNotificationModal(false)}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.sheetBody}>
              {notifications.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyText}>All caught up! No notifications.</Text>
                </View>
              ) : (
                notifications.map((n) => (
                  <TouchableOpacity
                    key={n.id}
                    style={[styles.notifCard, !n.isRead && styles.notifCardUnread]}
                    activeOpacity={0.7}
                    onPress={() => {
                      setSelectedDetailNotif(n);
                      if (!n.isRead) {
                        mobileApi.markNotificationRead(n.id);
                        setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, isRead: true } : item));
                        setUnreadCount(c => Math.max(0, c - 1));
                      }
                    }}
                  >
                    <View style={styles.notifTop}>
                      <Text style={styles.notifTitle}>{n.title}</Text>
                      <View style={[
                        styles.notifTypeBadge,
                        n.type === 'alert' && { backgroundColor: 'rgba(245,158,11,0.2)', borderColor: 'rgba(245,158,11,0.4)' },
                        n.type === 'success' && { backgroundColor: 'rgba(40,209,124,0.2)', borderColor: 'rgba(40,209,124,0.4)' }
                      ]}>
                        <Text style={[
                          styles.notifType,
                          n.type === 'alert' && { color: '#f59e0b' },
                          n.type === 'success' && { color: '#28d17c' }
                        ]}>{n.type.toUpperCase()}</Text>
                      </View>
                    </View>
                    <Text style={styles.notifMsg} numberOfLines={2}>{n.message}</Text>
                    <View style={styles.notifFooterRow}>
                      <Text style={styles.notifMeta}>
                        {n.sender || 'Executive Desk'} • {new Date(n.createdAt).toLocaleDateString()}
                      </Text>
                      <Text style={styles.notifTapOpen}>Tap to View Message →</Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 5: PRIORITY ALERT & SUCCESS POP-UP MODAL */}
      {/* ========================================================================= */}
      <Modal visible={!!priorityPopUpNotif} transparent animationType="fade">
        <View style={styles.modalOverlayCenter}>
          <View style={[
            styles.priorityPopUpCard,
            priorityPopUpNotif?.type === 'alert' && { borderColor: '#f59e0b' },
            priorityPopUpNotif?.type === 'success' && { borderColor: '#28d17c' }
          ]}>
            <View style={styles.priorityPopUpHeader}>
              <View style={[
                styles.priorityIconCircle,
                priorityPopUpNotif?.type === 'alert' && { backgroundColor: 'rgba(245,158,11,0.2)', borderColor: '#f59e0b' },
                priorityPopUpNotif?.type === 'success' && { backgroundColor: 'rgba(40,209,124,0.2)', borderColor: '#28d17c' }
              ]}>
                <Text style={styles.priorityIconText}>
                  {priorityPopUpNotif?.type === 'alert' ? '⚠️' : '🛡️'}
                </Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.priorityBrandTag}>HERON CAPITAL DISPATCH</Text>
                <Text style={styles.priorityPopUpTitle}>
                  {priorityPopUpNotif?.type === 'alert' ? 'Security & Settlement Alert' : 'Operational Confirmation'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setPriorityPopUpNotif(null)}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.priorityContentBox}>
              <Text style={styles.priorityHeadline}>{priorityPopUpNotif?.title}</Text>
              <Text style={styles.priorityBody}>{priorityPopUpNotif?.message}</Text>
            </View>

            <View style={styles.priorityMetaRow}>
              <Text style={styles.prioritySender}>
                From: <Text style={{ color: '#d4af37' }}>{priorityPopUpNotif?.sender || 'Chief Risk Officer'}</Text>
              </Text>
              <Text style={styles.priorityTime}>
                {priorityPopUpNotif ? new Date(priorityPopUpNotif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.goldBtnFull}
              onPress={() => {
                if (priorityPopUpNotif) {
                  mobileApi.markNotificationRead(priorityPopUpNotif.id);
                  setNotifications(prev => prev.map(item => item.id === priorityPopUpNotif.id ? { ...item, isRead: true } : item));
                  setUnreadCount(c => Math.max(0, c - 1));
                  setPriorityPopUpNotif(null);
                }
              }}
            >
              <Text style={styles.goldBtnText}>Acknowledge & Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 6: DEDICATED MESSAGE BOX MODAL (FOR ALL CLICKED NOTIFICATIONS) */}
      {/* ========================================================================= */}
      <Modal visible={!!selectedDetailNotif} transparent animationType="fade">
        <View style={styles.modalOverlayCenter}>
          <View style={styles.msgBoxCard}>
            <View style={styles.msgBoxHeader}>
              <View style={styles.msgBoxIconBadge}>
                <Text style={{ fontSize: 18 }}>✉️</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.msgBoxSubtitle}>OFFICIAL DISPATCH • {selectedDetailNotif?.type?.toUpperCase()}</Text>
                <Text style={styles.msgBoxMainTitle}>Executive Communication Box</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedDetailNotif(null)}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.msgBoxBodyScroll}>
              <View style={styles.msgBoxInnerContent}>
                <Text style={styles.msgDetailHeadline}>{selectedDetailNotif?.title}</Text>
                <Text style={styles.msgDetailText}>{selectedDetailNotif?.message}</Text>
              </View>

              <View style={styles.msgDetailMetaGrid}>
                <View style={styles.msgMetaItem}>
                  <Text style={styles.msgMetaLabel}>DISPATCHED BY</Text>
                  <Text style={styles.msgMetaValue}>{selectedDetailNotif?.sender || 'Chief Risk Officer'}</Text>
                </View>
                <View style={styles.msgMetaItem}>
                  <Text style={styles.msgMetaLabel}>TIME / DATE</Text>
                  <Text style={styles.msgMetaValue}>
                    {selectedDetailNotif ? new Date(selectedDetailNotif.createdAt).toLocaleString() : ''}
                  </Text>
                </View>
                <View style={styles.msgMetaItem}>
                  <Text style={styles.msgMetaLabel}>CATEGORY</Text>
                  <Text style={[styles.msgMetaValue, { color: '#d4af37' }]}>{selectedDetailNotif?.type?.toUpperCase()}</Text>
                </View>
                <View style={styles.msgMetaItem}>
                  <Text style={styles.msgMetaLabel}>STATUS</Text>
                  <Text style={[styles.msgMetaValue, { color: '#28d17c' }]}>Verified & Logged</Text>
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.goldBtnFull}
              onPress={() => setSelectedDetailNotif(null)}
            >
              <Text style={styles.goldBtnText}>Close Message Box</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#070908',
  },
  authScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  authBox: {
    backgroundColor: '#0f1412',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  logoBadgeBig: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: 'rgba(212,175,55,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 12,
  },
  logoTextBig: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#d4af37',
  },
  authBrandTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: 1,
  },
  authBrandSub: {
    fontSize: 10,
    color: '#d4af37',
    textAlign: 'center',
    letterSpacing: 2,
    marginTop: 2,
    marginBottom: 20,
  },
  authToggleRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
  },
  authToggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  authToggleBtnActive: {
    backgroundColor: 'rgba(212,175,55,0.2)',
  },
  authToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
  },
  authToggleTextActive: {
    color: '#d4af37',
    fontWeight: 'bold',
  },
  formGroup: {
    marginBottom: 10,
  },
  fieldLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 14,
  },
  otpInput: {
    fontSize: 22,
    textAlign: 'center',
    letterSpacing: 8,
    fontWeight: 'bold',
    color: '#d4af37',
  },
  goldBtn: {
    backgroundColor: '#d4af37',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  goldBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#070908',
  },
  otpNotice: {
    backgroundColor: 'rgba(212,175,55,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.25)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  otpNoticeBox: {
    backgroundColor: 'rgba(212,175,55,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.3)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  otpNoticeTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#d4af37',
    marginBottom: 4,
  },
  otpNoticeSub: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 14,
  },
  otpNoticeBody: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
  },
  devOtpBadge: {
    marginTop: 8,
    backgroundColor: '#070908',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d4af37',
    alignSelf: 'flex-start',
  },
  devOtpText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#28d17c',
    letterSpacing: 1,
  },
  devPill: {
    marginTop: 8,
    backgroundColor: 'rgba(212,175,55,0.2)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  devPillText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#d4af37',
  },
  backBtn: {
    marginTop: 12,
    alignItems: 'center',
  },
  backBtnText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  endpointLink: {
    marginTop: 16,
    alignItems: 'center',
  },
  endpointText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
  },
  // Main App Styles
  appHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    backgroundColor: '#070908',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadgeSmall: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(212,175,55,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoTextSmall: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#d4af37',
  },
  headerBrandTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  headerBrandSub: {
    fontSize: 8,
    color: '#d4af37',
    letterSpacing: 1.5,
  },
  headerRightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconBtn: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    position: 'relative',
  },
  headerIconText: {
    fontSize: 16,
  },
  unreadBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#ff5252',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  unreadBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  avatarBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(212,175,55,0.2)',
    borderWidth: 1,
    borderColor: '#d4af37',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#d4af37',
  },
  tickersBar: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  tickersScroll: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  tickerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tickerSymbol: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  tickerPrice: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
  },
  tickerChange: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  mainScroll: {
    flex: 1,
  },
  mainScrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  tabContent: {
    gap: 16,
  },
  navCard: {
    backgroundColor: '#0f1412',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.3)',
  },
  cardEyebrow: {
    fontSize: 10,
    color: '#d4af37',
    letterSpacing: 1,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  navAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  navSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  navSubLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  navSubValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#28d17c',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryActionBtn: {
    flex: 1,
    backgroundColor: '#d4af37',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryActionText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#070908',
  },
  secondaryActionBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryActionText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  deployCard: {
    backgroundColor: 'rgba(212,175,55,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.2)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deployLeft: {
    flex: 1,
    paddingRight: 10,
  },
  deployTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  deploySub: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  deployBtn: {
    backgroundColor: '#d4af37',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  deployBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#070908',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 0.5,
  },
  sectionLinkText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#d4af37',
  },
  mandateCard: {
    backgroundColor: '#0f1412',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  mandateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mandateName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  countdownBadge: {
    backgroundColor: 'rgba(212,175,55,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  countdownText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#d4af37',
  },
  mandateGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  mandateLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.4)',
    marginBottom: 2,
  },
  mandateVal: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  progressBarBg: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#28d17c',
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  pageSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
    marginBottom: 10,
  },
  mandatesHeaderBox: {
    backgroundColor: '#0f1412',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  goldBtnFull: {
    backgroundColor: '#d4af37',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  emptyCard: {
    backgroundColor: '#0f1412',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  emptyText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  emptyLink: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#d4af37',
    marginTop: 8,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(212,175,55,0.2)',
  },
  statusCompleted: {
    backgroundColor: 'rgba(40,209,124,0.2)',
  },
  statusPillText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  timeInfo: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 8,
  },
  actionCardGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  liquidityCard: {
    flex: 1,
    backgroundColor: '#0f1412',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  liqIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  liqTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  liqSub: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
  },
  addressCard: {
    backgroundColor: '#0f1412',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  addressTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  networkName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  assetBadge: {
    fontSize: 10,
    color: '#d4af37',
    fontWeight: 'bold',
  },
  addressString: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 10,
  },
  copyBtn: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  copyBtnText: {
    fontSize: 11,
    color: '#d4af37',
    fontWeight: '600',
  },
  referralCard: {
    backgroundColor: '#0f1412',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.3)',
    alignItems: 'center',
  },
  referralCodeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 2,
    marginVertical: 6,
  },
  refStatsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  refStatBox: {
    flex: 1,
    backgroundColor: '#0f1412',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  statLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  txCard: {
    backgroundColor: '#0f1412',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  txHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  txType: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  txAmount: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  txNote: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 8,
  },
  txFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.04)',
    paddingTop: 6,
  },
  txStatus: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#d4af37',
  },
  txDate: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.4)',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#070908',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 6,
    paddingBottom: Platform.OS === 'ios' ? 20 : 6,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  navIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  navLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
  },
  navLabelActive: {
    color: '#d4af37',
    fontWeight: 'bold',
  },
  // Modal Overlays
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalOverlayCenter: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#0f1412',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalSheet: {
    backgroundColor: '#0f1412',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    marginBottom: 14,
  },
  sheetBody: {
    maxHeight: 450,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  modalSubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    marginVertical: 10,
    lineHeight: 16,
  },
  closeBtnText: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.5)',
    padding: 4,
  },
  assetPillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  assetPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  assetPillActive: {
    backgroundColor: 'rgba(212,175,55,0.2)',
    borderColor: '#d4af37',
  },
  assetPillText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: 'bold',
  },
  assetPillTextActive: {
    color: '#d4af37',
  },
  planCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 8,
  },
  planCardActive: {
    borderColor: '#d4af37',
    backgroundColor: 'rgba(212,175,55,0.08)',
  },
  planCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planCardName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  planCardBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#d4af37',
  },
  planCardLimits: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 4,
  },
  notifCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginBottom: 8,
  },
  notifCardUnread: {
    borderLeftWidth: 3,
    borderLeftColor: '#d4af37',
    backgroundColor: 'rgba(212,175,55,0.05)',
  },
  notifTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
  },
  notifType: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#d4af37',
    marginLeft: 6,
  },
  notifMsg: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 15,
    marginBottom: 6,
  },
  notifMeta: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.4)',
  },
  notifTypeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.3)',
    backgroundColor: 'rgba(212,175,55,0.1)',
  },
  notifFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  notifTapOpen: {
    fontSize: 9,
    fontWeight: '700',
    color: '#d4af37',
  },
  // Modal 5: Priority Pop-Up Modal
  priorityPopUpCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#0c1210',
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#d4af37',
    padding: 22,
    alignSelf: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.95,
    shadowRadius: 28,
    elevation: 25,
  },
  priorityPopUpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  priorityIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(212,175,55,0.15)',
    borderWidth: 1,
    borderColor: '#d4af37',
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityIconText: {
    fontSize: 22,
  },
  priorityBrandTag: {
    fontSize: 9,
    fontWeight: '900',
    color: '#d4af37',
    letterSpacing: 1.5,
  },
  priorityPopUpTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 2,
  },
  priorityContentBox: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 16,
    marginVertical: 14,
  },
  priorityHeadline: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 6,
  },
  priorityBody: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 18,
  },
  priorityMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 2,
  },
  prioritySender: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
  },
  priorityTime: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
    fontVariant: ['tabular-nums'],
  },
  // Modal 6: Message Box Modal
  msgBoxCard: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '82%',
    backgroundColor: '#0c1210',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(212,175,55,0.5)',
    padding: 22,
    alignSelf: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.95,
    shadowRadius: 28,
    elevation: 25,
  },
  msgBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  msgBoxIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(212,175,55,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  msgBoxSubtitle: {
    fontSize: 8,
    fontWeight: '800',
    color: '#d4af37',
    letterSpacing: 1.2,
  },
  msgBoxMainTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 2,
  },
  msgBoxBodyScroll: {
    marginVertical: 12,
  },
  msgBoxInnerContent: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 14,
    marginBottom: 12,
  },
  msgDetailHeadline: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  msgDetailText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 18,
  },
  msgDetailMetaGrid: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    padding: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  msgMetaItem: {
    width: '48%',
    marginBottom: 4,
  },
  msgMetaLabel: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  msgMetaValue: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 12,
    color: '#ffffff',
  },
  modalGoldBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#d4af37',
    alignItems: 'center',
  },
  modalGoldText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#070908',
  },
  // --- Opening Splash Screen Styles ---
  splashContainer: {
    flex: 1,
    backgroundColor: '#070908',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  splashGlowBg: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(212,175,55,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.12)',
  },
  splashCenterContent: {
    alignItems: 'center',
    width: '100%',
  },
  splashEmblemWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashEmblemOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(212,175,55,0.15)',
    borderWidth: 2,
    borderColor: '#d4af37',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#d4af37',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 15,
  },
  splashEmblemInner: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: '#0f1412',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  splashEmblemIcon: {
    fontSize: 36,
  },
  splashShieldBadge: {
    position: 'absolute',
    bottom: -6,
    backgroundColor: '#d4af37',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#070908',
  },
  splashShieldBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#070908',
    letterSpacing: 1,
  },
  splashBrandName: {
    fontSize: 26,
    fontWeight: '900',
    color: '#d4af37',
    letterSpacing: 4,
    textAlign: 'center',
  },
  splashGoldLine: {
    width: 48,
    height: 2,
    backgroundColor: 'rgba(212,175,55,0.5)',
    marginVertical: 10,
    borderRadius: 1,
  },
  splashTagline: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8e9b97',
    letterSpacing: 2,
    textAlign: 'center',
  },
  splashSecurityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(40,209,124,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(40,209,124,0.3)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 20,
  },
  splashPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#28d17c',
    marginRight: 8,
  },
  splashSecurityText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#28d17c',
    letterSpacing: 1.2,
  },
  splashProgressBarTrack: {
    width: '70%',
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 10,
  },
  splashProgressBarFill: {
    height: '100%',
    backgroundColor: '#d4af37',
    borderRadius: 2,
  },
  splashLoadingText: {
    fontSize: 9,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1.5,
  },
  splashSkipBtn: {
    position: 'absolute',
    bottom: 40,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  splashSkipText: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1.5,
  },
  // --- Live Connection Pill Styles ---
  connStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 10,
    marginBottom: 4,
  },
  connStatusOnline: {
    backgroundColor: 'rgba(40,209,124,0.08)',
    borderColor: 'rgba(40,209,124,0.3)',
  },
  connStatusOffline: {
    backgroundColor: 'rgba(255,77,77,0.08)',
    borderColor: 'rgba(255,77,77,0.3)',
  },
  connStatusPending: {
    backgroundColor: 'rgba(212,175,55,0.08)',
    borderColor: 'rgba(212,175,55,0.3)',
  },
  connDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  connDotOnline: {
    backgroundColor: '#28d17c',
  },
  connDotOffline: {
    backgroundColor: '#ff4d4d',
  },
  connDotPending: {
    backgroundColor: '#d4af37',
  },
  connStatusText: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 0.5,
  },
  // --- Preset Button Styles ---
  presetContainer: {
    gap: 8,
    marginBottom: 14,
  },
  presetBtn: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  presetBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#d4af37',
  },
});
