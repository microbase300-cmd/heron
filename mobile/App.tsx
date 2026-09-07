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
  Easing,
  Image
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

type NavTab = 'overview' | 'investments' | 'liquidity' | 'referrals' | 'ledger';

// ============================================================================
// LUXURY OPENING SPLASH ANIMATION (BINANCE PRO THEMED • HERON ASSETS)
// ============================================================================
const TITLE_CHARS = ['H', 'E', 'R', 'O', 'N', ' ', 'A', 'S', 'S', 'E', 'T', 'S'];

function OpeningSplashScreen({ onFinish }: { onFinish: () => void }) {
  const logoFadeAnim = useRef(new Animated.Value(0)).current;
  const logoScaleAnim = useRef(new Animated.Value(0.75)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const charAnims = useRef(TITLE_CHARS.map(() => new Animated.Value(0))).current;
  const tagAnim = useRef(new Animated.Value(0)).current;
  const goldLineAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const exitAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Continuous subtle breathing pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.04,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 1. Logo Entry in center of pure black background
    Animated.parallel([
      Animated.timing(logoFadeAnim, {
        toValue: 1,
        duration: 750,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(logoScaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // 2. Sequential Letter Animation for "HERON ASSETS"
      const letterTimings = charAnims.map((anim) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 380,
          easing: Easing.out(Easing.back(1.4)),
          useNativeDriver: true,
        })
      );

      Animated.stagger(55, letterTimings).start(() => {
        // 3. Reveal Welcome Subtitle, Line & Security Credentials
        Animated.parallel([
          Animated.timing(tagAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(goldLineAnim, {
            toValue: 1,
            duration: 650,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
          }),
        ]).start();

        // 4. Progress Simulation & Automatic Entry
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 1700,
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

  const goldLineWidth = goldLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '80%'],
  });

  return (
    <Animated.View style={[styles.splashContainer, { opacity: exitAnim }]}>
      <ExpoStatusBar style="light" />

      {/* Deep Obsidian Radial Backdrop */}
      <Animated.View
        style={[
          styles.splashGlowBg,
          {
            transform: [{ scale: pulseAnim }],
            opacity: logoFadeAnim,
          },
        ]}
      />

      <Animated.View style={styles.splashCenterContent}>
        {/* Top Protocol Badge */}
        <Animated.View style={{ opacity: logoFadeAnim, alignItems: 'center', marginBottom: 20 }}>
          <View style={styles.splashProtocolBadge}>
            <View style={styles.splashGreenPulseDot} />
            <Text style={styles.splashProtocolText}>BINANCE INSTITUTIONAL TRUSTEE</Text>
          </View>
        </Animated.View>

        {/* Central Logo - Seamlessly Blended on Pure Deep Black Background */}
        <Animated.View
          style={[
            styles.splashLogoWrapper,
            {
              opacity: logoFadeAnim,
              transform: [{ scale: logoScaleAnim }, { scale: pulseAnim }],
            },
          ]}
        >
          <Image
            source={require('./assets/heron_logo.jpg')}
            style={styles.splashLogoImage}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Letter-by-Letter Animated "HERON ASSETS" Typography */}
        <View style={styles.splashLetterRow}>
          {TITLE_CHARS.map((char, index) => {
            if (char === ' ') {
              return <View key={index} style={{ width: 10 }} />;
            }
            const anim = charAnims[index];
            const translateY = anim.interpolate({
              inputRange: [0, 1],
              outputRange: [18, 0],
            });
            const scale = anim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.6, 1],
            });
            const isGold = index >= 6;

            return (
              <Animated.Text
                key={index}
                style={[
                  styles.splashLetterText,
                  isGold && styles.splashLetterGold,
                  {
                    opacity: anim,
                    transform: [{ translateY }, { scale }],
                  },
                ]}
              >
                {char}
              </Animated.Text>
            );
          })}
        </View>

        {/* Expanding Golden Horizon Line */}
        <Animated.View style={[styles.splashGoldLineAnimated, { width: goldLineWidth }]} />

        {/* Professional Welcome Subtitle & Security Verification */}
        <Animated.View style={{ opacity: tagAnim, alignItems: 'center', width: '100%' }}>
          <Text style={styles.splashWelcomeHeading}>WELCOME TO HERON ASSETS</Text>
          <Text style={styles.splashWelcomeSub}>
            Deterministic Digital Asset Liquidity & Timelock Escrow
          </Text>

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

// ============================================================================
// LUXURY CUSTOM BINANCE PRO ALERT MODAL
// ============================================================================
interface CustomAlertState {
  visible: boolean;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  confirmText?: string;
  onConfirm?: () => void;
}

function CustomAlertModal({
  alert,
  onDismiss,
}: {
  alert: CustomAlertState;
  onDismiss: () => void;
}) {
  if (!alert.visible) return null;

  const isSuccess = alert.type === 'success';
  const isError = alert.type === 'error';
  const isWarning = alert.type === 'warning';

  return (
    <Modal visible={alert.visible} transparent animationType="fade">
      <View style={styles.modalOverlayCenter}>
        <View
          style={[
            styles.customAlertCard,
            isSuccess && styles.customAlertCardSuccess,
            isError && styles.customAlertCardError,
            isWarning && styles.customAlertCardWarning,
          ]}
        >
          {/* Glowing Circle Badge */}
          <View
            style={[
              styles.customAlertIconCircle,
              isSuccess && styles.customAlertIconCircleSuccess,
              isError && styles.customAlertIconCircleError,
              isWarning && styles.customAlertIconCircleWarning,
            ]}
          >
            <Text
              style={[
                styles.customAlertIconText,
                isSuccess && { color: '#0ECB81' },
                isError && { color: '#F6465D' },
                isWarning && { color: '#F0B90B' },
                !isSuccess && !isError && !isWarning && { color: '#F0B90B' },
              ]}
            >
              {isSuccess ? '✓' : isError ? '✕' : isWarning ? '⚠️' : '🛡️'}
            </Text>
          </View>

          {/* Security & Protocol Subtitle */}
          <Text style={styles.customAlertBrandTag}>HERON CAPITAL PROTOCOL</Text>

          {/* Dialog Title */}
          <Text style={styles.customAlertTitle}>{alert.title}</Text>

          {/* Dialog Message */}
          <Text style={styles.customAlertMessage}>{alert.message}</Text>

          {/* Primary Action Button */}
          <TouchableOpacity
            style={[
              styles.customAlertBtn,
              isError && styles.customAlertBtnError,
            ]}
            onPress={onDismiss}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.customAlertBtnText,
                isError && styles.customAlertBtnTextError,
              ]}
            >
              {alert.confirmText || 'Acknowledge'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
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

  // Custom Alert Modal State
  const [customAlert, setCustomAlert] = useState<CustomAlertState>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    confirmText: 'Acknowledge',
  });

  const showCustomAlert = (
    title: string,
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    onConfirm?: () => void,
    confirmText: string = 'Acknowledge'
  ) => {
    setCustomAlert({
      visible: true,
      title,
      message,
      type,
      confirmText,
      onConfirm,
    });
  };

  const hideCustomAlert = () => {
    const cb = customAlert.onConfirm;
    setCustomAlert(prev => ({ ...prev, visible: false, onConfirm: undefined }));
    if (cb) cb();
  };

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

  // Investments tab filter
  const [investmentFilter, setInvestmentFilter] = useState<'all' | 'active' | 'matured' | 'completed' | 'cancelled'>('all');

  // Ledger tab filter
  const [ledgerFilter, setLedgerFilter] = useState<'all' | 'deposit' | 'withdrawal' | 'yield_payout' | 'referral_bonus'>('all');

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

  // Helper to dynamically match deposit asset to active receiving addresses
  const getSelectedDepositWallet = () => {
    const isTron = depositAsset.includes('TRC-20') || depositAsset.includes('Tron');
    const isEth = depositAsset.includes('ERC-20') || depositAsset.includes('ETH');
    const isBtc = depositAsset === 'BTC' || depositAsset.includes('Bitcoin');
    const isSol = depositAsset === 'SOL' || depositAsset.includes('Solana');

    const mappedKey =
      isTron ? 'USDT_TRC20' :
      depositAsset.includes('USDT') && isEth ? 'USDT_ERC20' :
      isBtc ? 'BTC' :
      depositAsset === 'ETH' ? 'ETH' :
      isSol ? 'SOL' : 'USDT_TRC20';

    const found = depositAddresses.find((a) => {
      if (a.key === mappedKey) return true;
      if (isTron && (a.key.includes('TRC') || a.network.toLowerCase().includes('tron') || a.network.toLowerCase().includes('trc'))) return true;
      if (depositAsset.includes('USDT') && isEth && (a.key.includes('ERC') || a.network.toLowerCase().includes('erc'))) return true;
      if (isBtc && (a.asset === 'BTC' || a.key === 'BTC')) return true;
      if (depositAsset === 'ETH' && (a.asset === 'ETH' || a.key === 'ETH')) return true;
      if (isSol && (a.asset === 'SOL' || a.key === 'SOL')) return true;
      return false;
    });

    if (found) return found;

    // Guaranteed fallback configs
    const fallbackMap: Record<string, DepositAddressConfig> = {
      USDT_TRC20: { key: 'USDT_TRC20', asset: 'USDT', network: 'Tron (TRC-20)', address: 'TX9d8b7a6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a', isActive: true, updatedAt: '' },
      USDT_ERC20: { key: 'USDT_ERC20', asset: 'USDT', network: 'Ethereum (ERC-20)', address: '0x882194f8a7e6d5c4b3a201948572615049382710', isActive: true, updatedAt: '' },
      BTC: { key: 'BTC', asset: 'BTC', network: 'Bitcoin Native SegWit', address: 'bc1q9d8a7f6e5c4b3a201948572615049382710082', isActive: true, updatedAt: '' },
      ETH: { key: 'ETH', asset: 'ETH', network: 'Ethereum Mainnet', address: '0x882194f8a7e6d5c4b3a201948572615049382710', isActive: true, updatedAt: '' },
      SOL: { key: 'SOL', asset: 'SOL', network: 'Solana SPL', address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU', isActive: true, updatedAt: '' },
    };
    return fallbackMap[mappedKey] || fallbackMap.USDT_TRC20;
  };

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
      showCustomAlert('Missing Credentials', 'Please enter both your investor email and master password.', 'warning');
      return;
    }
    setAuthLoading(true);
    try {
      const res = await mobileApi.login(authEmail.trim(), authPassword.trim());
      setCurrentUser(res.user);
      showCustomAlert('Login Successful', `Welcome back, ${res.user.name}. Your institutional portfolio is authenticated.`, 'success');
    } catch (err: any) {
      showCustomAlert('Authentication Failed', err.message || 'Invalid email or password. Please verify your credentials.', 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRequestRegOtp = async () => {
    if (!authName.trim() || !authEmail.trim() || !authPassword.trim()) {
      showCustomAlert('Missing Details', 'Full name, email, and password (min 6 chars) are required.', 'warning');
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
      showCustomAlert('Security OTP Dispatched', `A 6-digit security verification code was dispatched to ${authEmail}.`, 'success');
    } catch (err: any) {
      showCustomAlert('Registration Notice', err.message || 'Failed to dispatch verification OTP.', 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleCompleteRegister = async () => {
    if (!authOtp.trim() || authOtp.trim().length !== 6) {
      showCustomAlert('Verification Code', 'Please enter the 6-digit verification OTP.', 'warning');
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
      showCustomAlert('Account Verified', 'Your portfolio has been created with $0.00 initial balance. Deposit liquidity to start earning yield.', 'success');
    } catch (err: any) {
      showCustomAlert('Registration Error', err.message || 'Failed to register account.', 'error');
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
      showCustomAlert('Invalid Amount', 'Please enter a valid deposit amount.', 'warning');
      return;
    }
    if (!depositTxHash.trim()) {
      showCustomAlert('Missing TX Hash', 'Please provide your blockchain transaction hash.', 'warning');
      return;
    }
    setModalLoading(true);
    try {
      await mobileApi.submitDeposit(amt, depositAsset, depositTxHash.trim(), depositAsset);
      showCustomAlert('Deposit Receipt Submitted', 'Your inbound deposit is now pending confirmation by the Executive Settlement Desk. Funds will be credited once verified.', 'success');
      setShowDepositModal(false);
      setDepositAmount('');
      setDepositTxHash('');
      loadAllData();
    } catch (err: any) {
      showCustomAlert('Deposit Error', err.message || 'Failed to submit deposit receipt.', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  // Withdrawal Handlers
  const handleRequestWithdrawOtp = async () => {
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0) {
      showCustomAlert('Invalid Amount', 'Please enter a valid withdrawal amount.', 'warning');
      return;
    }
    if (!withdrawAddress.trim()) {
      showCustomAlert('Missing Address', 'Please enter your recipient wallet address.', 'warning');
      return;
    }
    const avail = walletSummary?.availableBalance ?? 0;
    if (amt > avail) {
      showCustomAlert('Insufficient Balance', `Your available balance is $${avail.toFixed(2)}.`, 'error');
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
      showCustomAlert('OTP Dispatched', 'A 6-digit security authorization code was sent to your registered email.', 'info');
    } catch (err: any) {
      showCustomAlert('Withdrawal Notice', err.message || 'Failed to request withdrawal OTP.', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  const handleCompleteWithdrawal = async () => {
    if (!withdrawOtp.trim() || withdrawOtp.trim().length !== 6) {
      showCustomAlert('Invalid Code', 'Please enter the 6-digit authorization code.', 'warning');
      return;
    }
    setModalLoading(true);
    try {
      await mobileApi.submitWithdrawal(parseFloat(withdrawAmount), withdrawAsset, withdrawAddress.trim(), withdrawOtp.trim());
      showCustomAlert('Disbursement Submitted', 'Your withdrawal has been placed into pending escrow awaiting Executive Treasury approval.', 'success');
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      setWithdrawAddress('');
      setWithdrawOtp('');
      setWithdrawStep(1);
      loadAllData();
    } catch (err: any) {
      showCustomAlert('Withdrawal Error', err.message || 'Failed to authorize withdrawal.', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  // Deploy Capital
  const handleCreateInvestment = async () => {
    const amt = parseFloat(investAmount);
    if (isNaN(amt) || amt <= 0) {
      showCustomAlert('Invalid Amount', 'Please enter an allocation amount.', 'warning');
      return;
    }
    const avail = walletSummary?.availableBalance ?? 0;
    if (amt > avail) {
      showCustomAlert('Insufficient Balance', `Available: $${avail.toFixed(2)}. Please deposit additional liquidity.`, 'error');
      return;
    }
    setModalLoading(true);
    try {
      await mobileApi.createInvestment(selectedPlanId, amt);
      showCustomAlert('Investment Deployed', 'Your timelocked smart contract has started. Programmatic yield will accrue in real time.', 'success');
      setShowInvestModal(false);
      setInvestAmount('');
      loadAllData();
    } catch (err: any) {
      showCustomAlert('Investment Error', err.message || 'Failed to deploy investment.', 'error');
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
              <Image source={require('./assets/heron_logo.jpg')} style={styles.logoImageBig} resizeMode="cover" />
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
                    <ActivityIndicator color="#181A20" />
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
                        <ActivityIndicator color="#181A20" />
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
                        <ActivityIndicator color="#181A20" />
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
                    showCustomAlert(
                      health.online ? 'Connected!' : 'Saved (Endpoint Offline)',
                      health.online
                        ? `Successfully connected to ${customApiUrl}`
                        : `Saved ${customApiUrl}, but could not reach server. Verify backend is running on your PC.`,
                      health.online ? 'success' : 'warning'
                    );
                  }}
                >
                  <Text style={styles.modalGoldText}>Save Endpoint</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Custom Luxury Alert Modal */}
        <CustomAlertModal alert={customAlert} onDismiss={hideCustomAlert} />
      </SafeAreaView>
    );
  }

  // --------------------------------------------------------------------------
  // RENDER: Authenticated Main Dashboard
  // --------------------------------------------------------------------------
  const activeInvestments = investments.filter(i => i.status === 'active');
  const availableBal = walletSummary?.availableBalance ?? currentUser.balance ?? 0;
  const portfolioNav = walletSummary?.totalPortfolioValue ?? (availableBal + (walletSummary?.lockedInInvestments ?? 0));

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ExpoStatusBar style="light" />

      {/* Top Mobile Header */}
      <View style={styles.appHeader}>
        <View style={styles.brandRow}>
          <View style={styles.logoBadgeSmall}>
            <Image source={require('./assets/heron_logo.jpg')} style={styles.logoImageSmall} resizeMode="cover" />
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
              <Text style={[styles.tickerChange, { color: t.change24h >= 0 ? '#0ECB81' : '#F6465D' }]}>
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadAllData} tintColor="#F0B90B" />}
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

            {/* Quick Investment Deploy Card */}
            <View style={styles.deployCard}>
              <View style={styles.deployLeft}>
                <Text style={styles.deployTitle}>Institutional Yield Investments</Text>
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

            {/* Active Investments Live Timelocks */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeading}>ACTIVE TIMELOCK CONTRACTS ({activeInvestments.length})</Text>
              <TouchableOpacity onPress={() => setActiveTab('investments')}>
                <Text style={styles.sectionLinkText}>View All →</Text>
              </TouchableOpacity>
            </View>

            {activeInvestments.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>No active investments deployed.</Text>
                <TouchableOpacity onPress={() => setShowInvestModal(true)}>
                  <Text style={styles.emptyLink}>Deploy Capital to Start Earning →</Text>
                </TouchableOpacity>
              </View>
            ) : (
              activeInvestments.map((inv) => {
                const elapsedProgress = Math.min(100, Math.max(5, inv.progressPercent || 20));
                const accrued = (inv.amount * inv.rate * (elapsedProgress / 100));
                return (
                  <View key={inv.id} style={styles.investmentCard}>
                    <View style={styles.investmentHeader}>
                      <Text style={styles.investmentName}>{inv.planName}</Text>
                      <View style={styles.countdownBadge}>
                        <Text style={styles.countdownText}>⏱ {formatCountdown(inv.expiresAt)}</Text>
                      </View>
                    </View>

                    <View style={styles.investmentGrid}>
                      <View>
                        <Text style={styles.investmentLabel}>LOCKED PRINCIPAL</Text>
                        <Text style={styles.investmentVal}>${inv.amount.toLocaleString()}</Text>
                      </View>
                      <View>
                        <Text style={styles.investmentLabel}>CURRENT ACCRUED</Text>
                        <Text style={[styles.investmentVal, { color: '#F0B90B' }]}>+${accrued.toFixed(2)}</Text>
                      </View>
                      <View>
                        <Text style={styles.investmentLabel}>TOTAL PAYOUT</Text>
                        <Text style={[styles.investmentVal, { color: '#0ECB81' }]}>${inv.totalPayout.toLocaleString()}</Text>
                      </View>
                    </View>

                    {/* Progress bar */}
                    <View style={styles.progressBarBg}>
                      <View
                        style={[
                          styles.progressBarFill,
                          { width: `${elapsedProgress}%` }
                        ]}
                      />
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

        {activeTab === 'investments' && (
          /* TAB 2: INVESTMENTS */
          <View style={styles.tabContent}>
            <View style={styles.investmentsHeaderBox}>
              <Text style={styles.pageTitle}>Institutional Investments</Text>
              <Text style={styles.pageSub}>Deterministic smart escrow contracts with automated yield releases.</Text>
              
              {/* Top Quick Stats */}
              <View style={styles.investQuickStatsRow}>
                <View style={styles.investQuickStat}>
                  <Text style={styles.investQuickLabel}>ACTIVE</Text>
                  <Text style={styles.investQuickVal}>{investments.filter(i => i.status === 'active').length}</Text>
                </View>
                <View style={styles.investQuickStat}>
                  <Text style={styles.investQuickLabel}>MATURED</Text>
                  <Text style={[styles.investQuickVal, { color: '#F0B90B' }]}>{investments.filter(i => i.status === 'matured').length}</Text>
                </View>
                <View style={styles.investQuickStat}>
                  <Text style={styles.investQuickLabel}>SETTLED</Text>
                  <Text style={[styles.investQuickVal, { color: '#0ECB81' }]}>{investments.filter(i => i.status === 'completed').length}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.goldBtnFull}
                onPress={() => setShowInvestModal(true)}
              >
                <Text style={styles.goldBtnText}>+ Deploy New Investment</Text>
              </TouchableOpacity>
            </View>

            {/* Filter Chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChipScroll}>
              {[
                { id: 'all', label: `All (${investments.length})` },
                { id: 'active', label: `Active (${investments.filter(i => i.status === 'active').length})` },
                { id: 'matured', label: `Matured (${investments.filter(i => i.status === 'matured').length})` },
                { id: 'completed', label: `Settled (${investments.filter(i => i.status === 'completed').length})` },
                ...(investments.some(i => i.status === 'cancelled')
                  ? [{ id: 'cancelled', label: `Cancelled (${investments.filter(i => i.status === 'cancelled').length})` }]
                  : []),
              ].map((chip) => (
                <TouchableOpacity
                  key={chip.id}
                  style={[styles.filterChip, investmentFilter === chip.id && styles.filterChipActive]}
                  onPress={() => setInvestmentFilter(chip.id as any)}
                >
                  <Text style={[styles.filterChipText, investmentFilter === chip.id && styles.filterChipTextActive]}>
                    {chip.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.sectionHeading}>
              {investmentFilter.toUpperCase()} CONTRACTS ({
                investments.filter(i => investmentFilter === 'all' || i.status === investmentFilter).length
              })
            </Text>

            {(() => {
              const list = investments.filter(i => investmentFilter === 'all' || i.status === investmentFilter);
              if (list.length === 0) {
                return (
                  <View style={styles.emptyCard}>
                    <Text style={styles.emptyText}>No {investmentFilter === 'all' ? '' : investmentFilter} investment contracts found.</Text>
                  </View>
                );
              }
              return list.map((inv) => {
                const elapsedProgress = Math.min(100, Math.max(5, inv.progressPercent || 20));
                const accrued = (inv.amount * inv.rate * (elapsedProgress / 100));

                return (
                  <View key={inv.id} style={[
                    styles.investmentCard,
                    inv.status === 'matured' && styles.investmentCardMatured,
                    inv.status === 'cancelled' && styles.investmentCardCancelled,
                  ]}>
                    <View style={styles.investmentHeader}>
                      <Text style={styles.investmentName}>{inv.planName}</Text>
                      <View style={[
                        styles.statusPill,
                        inv.status === 'completed' && styles.statusCompleted,
                        inv.status === 'matured' && styles.statusMatured,
                        inv.status === 'cancelled' && styles.statusCancelled,
                      ]}>
                        <Text style={[
                          styles.statusPillText,
                          inv.status === 'matured' && { color: '#F0B90B' },
                          inv.status === 'cancelled' && { color: '#F6465D' },
                          inv.status === 'completed' && { color: '#0ECB81' },
                        ]}>
                          {inv.status === 'matured' ? 'MATURED (QUEUED)' : inv.status.toUpperCase()}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.investmentGrid}>
                      <View>
                        <Text style={styles.investmentLabel}>PRINCIPAL</Text>
                        <Text style={styles.investmentVal}>${inv.amount.toLocaleString()}</Text>
                      </View>
                      <View>
                        <Text style={styles.investmentLabel}>RETURN RATE</Text>
                        <Text style={[styles.investmentVal, { color: '#F0B90B' }]}>+{(inv.rate * 100).toFixed(1)}%</Text>
                      </View>
                      <View>
                        <Text style={styles.investmentLabel}>TOTAL PAYOUT</Text>
                        <Text style={[styles.investmentVal, { color: '#0ECB81' }]}>${inv.totalPayout.toLocaleString()}</Text>
                      </View>
                    </View>

                    {/* Matured Notice Box */}
                    {inv.status === 'matured' && (
                      <View style={styles.maturedNoticeCard}>
                        <Text style={styles.maturedNoticeTitle}>✨ 100% Maturity Completed</Text>
                        <Text style={styles.maturedNoticeText}>
                          Principal & programmatic yield are queued for executive disbursement to your available balance.
                        </Text>
                      </View>
                    )}

                    {/* Cancelled Notice Box */}
                    {inv.status === 'cancelled' && (
                      <View style={styles.cancellationNoticeCard}>
                        <Text style={styles.cancellationNoticeTitle}>⚠️ Contract Terminated by Compliance:</Text>
                        <Text style={styles.cancellationNoticeReason}>
                          "{inv.cancellationReason || 'Protocol terms & conditions violation'}"
                        </Text>
                      </View>
                    )}

                    {/* Active Timelock Countdown, Yield Velocity & Progress */}
                    {inv.status === 'active' && (
                      <View style={styles.activeCountdownBox}>
                        <View style={styles.activeCountdownRow}>
                          <Text style={styles.activeCountdownLabel}>⏱ Time to Maturity:</Text>
                          <Text style={styles.activeCountdownVal}>{formatCountdown(inv.expiresAt)}</Text>
                        </View>
                        
                        <View style={styles.activeVelocityRow}>
                          <Text style={styles.activeVelocityLabel}>Live Accrual Rate:</Text>
                          <Text style={styles.activeVelocityVal}>+${accrued.toFixed(2)} accrued (${(inv.expectedProfit / (inv.durationHours || 24)).toFixed(2)}/hr)</Text>
                        </View>

                        <View style={styles.progressBarBg}>
                          <View
                            style={[
                              styles.progressBarFill,
                              { width: `${elapsedProgress}%` }
                            ]}
                          />
                        </View>
                      </View>
                    )}

                    <Text style={styles.timeInfo}>
                      Started: {new Date(inv.startedAt).toLocaleDateString()} • Expires: {new Date(inv.expiresAt).toLocaleDateString()}
                    </Text>
                  </View>
                );
              });
            })()}
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

            {/* Referral Code & Link Card */}
            <View style={styles.referralCard}>
              <Text style={styles.cardEyebrow}>YOUR PARTNER REFERRAL CODE</Text>
              <Text style={styles.referralCodeText}>{referralData?.referralCode || currentUser.referralCode}</Text>

              <View style={styles.refButtonRow}>
                <TouchableOpacity
                  style={[styles.goldBtn, { flex: 1, marginTop: 4 }]}
                  onPress={() => copyToClipboard(referralData?.referralCode || currentUser.referralCode, 'ref_code')}
                >
                  <Text style={styles.goldBtnText}>
                    {copiedKey === 'ref_code' ? '✓ Code Copied' : '📋 Copy Code'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.secondaryActionBtn, { flex: 1, paddingVertical: 14 }]}
                  onPress={() => {
                    const link = referralData?.referralLink || `https://heroncapital.com/register?ref=${currentUser.referralCode}`;
                    copyToClipboard(link, 'ref_link');
                  }}
                >
                  <Text style={styles.secondaryActionText}>
                    {copiedKey === 'ref_link' ? '✓ Link Copied' : '🔗 Copy Link'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Referral Stats Grid */}
            <View style={styles.refStatsGrid}>
              <View style={styles.refStatBox}>
                <Text style={styles.statLabel}>TOTAL REFERRED</Text>
                <Text style={styles.statValue}>{referralData?.totalReferrals || 0} Investors</Text>
              </View>
              <View style={styles.refStatBox}>
                <Text style={styles.statLabel}>COMMISSIONS EARNED</Text>
                <Text style={[styles.statValue, { color: '#F0B90B' }]}>
                  ${(referralData?.totalCommissionEarned || 0).toLocaleString()}
                </Text>
              </View>
            </View>

            {/* 4-Tier Affiliate Commission Schedule Table */}
            <View style={styles.affiliateScheduleCard}>
              <Text style={styles.affiliateScheduleTitle}>4-TIER COMMISSION ARCHITECTURE</Text>
              <Text style={styles.affiliateScheduleSub}>Instant programmatic credits upon investor contract deployment.</Text>

              <View style={styles.tierScheduleList}>
                {[
                  { tier: 'Tier 1 • Amateur', rate: '8.0%', range: '$100 – $1,999', badge: 'Bronze' },
                  { tier: 'Tier 2 • Standard', rate: '16.0%', range: '$2,000 – $5,999', badge: 'Silver' },
                  { tier: 'Tier 3 • Premium VIP', rate: '24.0%', range: '$6,000 – $10,999', badge: 'Gold' },
                  { tier: 'Tier 4 • Retirement', rate: '30.0%', range: '$11,000+', badge: 'Diamond' },
                ].map((item, idx) => (
                  <View key={idx} style={styles.tierScheduleRow}>
                    <View>
                      <Text style={styles.tierScheduleName}>{item.tier}</Text>
                      <Text style={styles.tierScheduleRange}>{item.range}</Text>
                    </View>
                    <View style={styles.tierScheduleRateBadge}>
                      <Text style={styles.tierScheduleRateText}>{item.rate}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Downline Activity if available */}
            {referralData && referralData.downline && referralData.downline.length > 0 && (
              <View style={styles.downlineCard}>
                <Text style={styles.sectionHeading}>DIRECT DOWNLINE NETWORK ({referralData.downline.length})</Text>
                {referralData.downline.map((dl) => (
                  <View key={dl.id} style={styles.downlineItem}>
                    <View>
                      <Text style={styles.downlineName}>{dl.name}</Text>
                      <Text style={styles.downlineEmail}>{dl.email}</Text>
                    </View>
                    <Text style={styles.downlineDate}>{new Date(dl.joinedAt).toLocaleDateString()}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {activeTab === 'ledger' && (
          /* TAB 5: LEDGER */
          <View style={styles.tabContent}>
            <Text style={styles.pageTitle}>Cryptographic Audit Ledger</Text>
            <Text style={styles.pageSub}>Immutable on-chain records, settlement receipts, and payout proofs.</Text>

            {/* Ledger Filter Chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChipScroll}>
              {[
                { id: 'all', label: `All (${transactions.length})` },
                { id: 'deposit', label: `Deposits (${transactions.filter(t => t.type === 'deposit').length})` },
                { id: 'withdrawal', label: `Withdrawals (${transactions.filter(t => t.type === 'withdrawal').length})` },
                { id: 'yield_payout', label: `Yield (${transactions.filter(t => t.type === 'yield_payout').length})` },
                { id: 'referral_bonus', label: `Affiliate (${transactions.filter(t => t.type === 'referral_bonus').length})` },
              ].map((chip) => (
                <TouchableOpacity
                  key={chip.id}
                  style={[styles.filterChip, ledgerFilter === chip.id && styles.filterChipActive]}
                  onPress={() => setLedgerFilter(chip.id as any)}
                >
                  <Text style={[styles.filterChipText, ledgerFilter === chip.id && styles.filterChipTextActive]}>
                    {chip.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {(() => {
              const filteredTxs = transactions.filter(t => ledgerFilter === 'all' || t.type === ledgerFilter);
              if (filteredTxs.length === 0) {
                return (
                  <View style={styles.emptyCard}>
                    <Text style={styles.emptyText}>No ledger records found for this category.</Text>
                  </View>
                );
              }
              return filteredTxs.map((tx) => (
                <View key={tx.id} style={styles.txCard}>
                  <View style={styles.txHeader}>
                    <Text style={styles.txType}>{tx.type.replace('_', ' ').toUpperCase()} • {tx.asset}</Text>
                    <Text style={[styles.txAmount, { color: tx.type === 'deposit' || tx.type === 'yield_payout' || tx.type === 'referral_bonus' ? '#0ECB81' : '#ffffff' }]}>
                      {tx.type === 'deposit' || tx.type === 'yield_payout' || tx.type === 'referral_bonus' ? '+' : '-'}${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </Text>
                  </View>
                  <Text style={styles.txNote}>{tx.note || `Audit Ref: ${tx.id}`}</Text>
                  
                  {tx.txHash && (
                    <TouchableOpacity
                      style={styles.txHashRow}
                      onPress={() => copyToClipboard(tx.txHash, `tx_${tx.id}`)}
                    >
                      <Text style={styles.txHashText} numberOfLines={1}>TX: {tx.txHash}</Text>
                      <Text style={styles.txHashCopy}>{copiedKey === `tx_${tx.id}` ? '✓ Copied' : 'Copy'}</Text>
                    </TouchableOpacity>
                  )}

                  <View style={styles.txFooter}>
                    <Text style={[styles.txStatus, tx.status === 'completed' && { color: '#0ECB81' }]}>
                      {tx.status.toUpperCase()}
                    </Text>
                    <Text style={styles.txDate}>{new Date(tx.createdAt).toLocaleDateString()}</Text>
                  </View>
                </View>
              ));
            })()}
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        {[
          { id: 'overview', label: 'Portfolio', icon: '📊' },
          { id: 'investments', label: 'Investments', icon: '⚡' },
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

              {/* Dynamic Receiving Address Card */}
              {(() => {
                const currentWallet = getSelectedDepositWallet();
                const isCopied = copiedKey === 'deposit_modal_addr';
                return (
                  <View style={styles.depositAddressCard}>
                    <View style={styles.depositAddressTopRow}>
                      <View>
                        <Text style={styles.depositAddressLabel}>DESTINATION TREASURY WALLET</Text>
                        <Text style={styles.depositAddressNetwork}>{currentWallet.network}</Text>
                      </View>
                      <View style={styles.depositAssetBadge}>
                        <Text style={styles.depositAssetBadgeText}>{currentWallet.asset}</Text>
                      </View>
                    </View>

                    <View style={styles.depositAddressBox}>
                      <Text style={styles.depositAddressString} selectable={true}>
                        {currentWallet.address}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={[styles.depositCopyBtn, isCopied && styles.depositCopyBtnSuccess]}
                      onPress={() => copyToClipboard(currentWallet.address, 'deposit_modal_addr')}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.depositCopyBtnText, isCopied && styles.depositCopyBtnTextSuccess]}>
                        {isCopied ? '✓ Address Copied to Clipboard' : '📋 Copy Receiving Address'}
                      </Text>
                    </TouchableOpacity>

                    {currentWallet.memo && (
                      <View style={styles.depositMemoBox}>
                        <Text style={styles.depositMemoLabel}>ROUTING MEMO / TAG:</Text>
                        <Text style={styles.depositMemoValue}>{currentWallet.memo}</Text>
                      </View>
                    )}

                    <View style={styles.depositSecurityNotice}>
                      <Text style={styles.depositSecurityText}>
                        ⚠️ Send only <Text style={{ color: '#F0B90B', fontWeight: 'bold' }}>{currentWallet.asset}</Text> on <Text style={{ color: '#F0B90B', fontWeight: 'bold' }}>{currentWallet.network}</Text> to this receiving address.
                      </Text>
                    </View>
                  </View>
                );
              })()}

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
                {modalLoading ? <ActivityIndicator color="#181A20" /> : <Text style={styles.goldBtnText}>Submit Deposit Receipt</Text>}
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
                    placeholder={`Available: $${availableBal.toFixed(2)}`}
                    placeholderTextColor="#666"
                    keyboardType="numeric"
                    value={withdrawAmount}
                    onChangeText={setWithdrawAmount}
                  />

                  {/* Quick Percentage Presets */}
                  <View style={styles.withdrawPresetsRow}>
                    {[25, 50, 75, 100].map((pct) => (
                      <TouchableOpacity
                        key={pct}
                        style={styles.withdrawPresetBtn}
                        onPress={() => {
                          const amt = (availableBal * pct) / 100;
                          setWithdrawAmount(amt > 0 ? amt.toFixed(2) : '0');
                        }}
                      >
                        <Text style={styles.withdrawPresetText}>{pct === 100 ? 'MAX' : `${pct}%`}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Institutional Subsidy Notice */}
                  <View style={styles.subsidyNoticeBox}>
                    <Text style={styles.subsidyNoticeText}>
                      🛡️ <Text style={{ fontWeight: 'bold', color: '#0ECB81' }}>Zero Fee Protocol:</Text> 100% of blockchain network gas fees are covered by Heron Institutional Treasury.
                    </Text>
                  </View>

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
                    placeholder="Enter recipient wallet address..."
                    placeholderTextColor="#666"
                    value={withdrawAddress}
                    onChangeText={setWithdrawAddress}
                  />

                  <TouchableOpacity
                    style={styles.goldBtnFull}
                    onPress={handleRequestWithdrawOtp}
                    disabled={modalLoading}
                  >
                    {modalLoading ? <ActivityIndicator color="#181A20" /> : <Text style={styles.goldBtnText}>Verify & Request 2FA OTP →</Text>}
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <View style={styles.otpNotice}>
                    <Text style={styles.otpNoticeTitle}>Authorize Capital Release</Text>
                    <Text style={styles.otpNoticeBody}>
                      Enter the 6-digit authorization code dispatched to {currentUser.email}
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
                    {modalLoading ? <ActivityIndicator color="#181A20" /> : <Text style={styles.goldBtnText}>Authorize Disbursement</Text>}
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
              <Text style={styles.modalTitle}>Deploy Capital Investment</Text>
              <TouchableOpacity onPress={() => setShowInvestModal(false)}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.sheetBody}>
              <Text style={styles.fieldLabel}>Select Investment Tier</Text>
              {plans.map((plan) => (
                <TouchableOpacity
                  key={plan.id}
                  style={[styles.planCard, selectedPlanId === plan.id && styles.planCardActive]}
                  onPress={() => setSelectedPlanId(plan.id)}
                >
                  <View style={styles.planCardTop}>
                    <Text style={styles.planCardName}>{plan.name}</Text>
                    <View style={styles.planRateBadge}>
                      <Text style={styles.planRateText}>+{(plan.rate * 100).toFixed(1)}% ROI</Text>
                    </View>
                  </View>
                  <Text style={styles.planCardLimits}>
                    Min: ${(typeof plan.min === 'number' ? plan.min : 100).toLocaleString()} • Max: {(plan.max === null || plan.max === undefined || plan.max === Infinity || plan.max >= 99999999) ? 'Uncapped' : `$${Number(plan.max).toLocaleString()}`} • {plan.durationHours}h Lock
                  </Text>
                </TouchableOpacity>
              ))}

              <Text style={styles.fieldLabel}>Allocation Amount ($ USD)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 5000"
                placeholderTextColor="#666"
                keyboardType="numeric"
                value={investAmount}
                onChangeText={setInvestAmount}
              />

              {/* Quick Amount Presets */}
              <View style={styles.withdrawPresetsRow}>
                {['500', '2500', '7500', '15000'].map((preset) => (
                  <TouchableOpacity
                    key={preset}
                    style={styles.withdrawPresetBtn}
                    onPress={() => setInvestAmount(preset)}
                  >
                    <Text style={styles.withdrawPresetText}>${parseInt(preset).toLocaleString()}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={styles.withdrawPresetBtn}
                  onPress={() => setInvestAmount(availableBal.toFixed(0))}
                >
                  <Text style={styles.withdrawPresetText}>MAX</Text>
                </TouchableOpacity>
              </View>

              {/* Real-time Yield Calculation Breakdown */}
              {(() => {
                const currentPlan = plans.find(p => p.id === selectedPlanId) || plans[0];
                const amt = parseFloat(investAmount) || 0;
                const profit = currentPlan ? amt * currentPlan.rate : 0;
                const totalPayout = amt + profit;
                const isUnderMin = currentPlan && amt > 0 && amt < currentPlan.min;
                const isOverMax = currentPlan && amt > 0 && currentPlan.max !== Infinity && amt > currentPlan.max;

                return (
                  <View style={styles.yieldCalculatorCard}>
                    <Text style={styles.yieldCalcTitle}>PROMISSORY YIELD SIMULATION</Text>
                    
                    <View style={styles.yieldCalcRow}>
                      <Text style={styles.yieldCalcLabel}>Principal Capital:</Text>
                      <Text style={styles.yieldCalcVal}>${amt.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
                    </View>
                    <View style={styles.yieldCalcRow}>
                      <Text style={styles.yieldCalcLabel}>Programmatic Yield ({currentPlan ? `+${(currentPlan.rate * 100).toFixed(1)}%` : '0%'}):</Text>
                      <Text style={[styles.yieldCalcVal, { color: '#F0B90B' }]}>+${profit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
                    </View>
                    <View style={styles.yieldCalcRow}>
                      <Text style={styles.yieldCalcLabel}>Lock Duration:</Text>
                      <Text style={styles.yieldCalcVal}>{currentPlan?.durationHours || 24} Hours</Text>
                    </View>
                    
                    <View style={styles.yieldCalcDivider} />
                    
                    <View style={styles.yieldCalcRow}>
                      <Text style={styles.yieldCalcTotalLabel}>Total Expected Payout:</Text>
                      <Text style={styles.yieldCalcTotalVal}>${totalPayout.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
                    </View>

                    {isUnderMin && (
                      <View style={styles.tierWarningBox}>
                        <Text style={styles.tierWarningText}>
                          ⚠️ Minimum allocation for {currentPlan?.name} is ${currentPlan?.min.toLocaleString()}.
                        </Text>
                      </View>
                    )}

                    {isOverMax && (
                      <View style={styles.tierWarningBox}>
                        <Text style={styles.tierWarningText}>
                          ⚠️ Maximum allocation for {currentPlan?.name} is ${currentPlan?.max.toLocaleString()}.
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })()}

              <TouchableOpacity
                style={styles.goldBtnFull}
                onPress={handleCreateInvestment}
                disabled={modalLoading}
              >
                {modalLoading ? <ActivityIndicator color="#181A20" /> : <Text style={styles.goldBtnText}>Deploy Capital Contract</Text>}
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
                        n.type === 'alert' && { backgroundColor: 'rgba(240,185,11,0.2)', borderColor: 'rgba(240,185,11,0.4)' },
                        n.type === 'success' && { backgroundColor: 'rgba(14,203,129,0.2)', borderColor: 'rgba(14,203,129,0.4)' }
                      ]}>
                        <Text style={[
                          styles.notifType,
                          n.type === 'alert' && { color: '#F0B90B' },
                          n.type === 'success' && { color: '#0ECB81' }
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
            priorityPopUpNotif?.type === 'alert' && { borderColor: '#F0B90B' },
            priorityPopUpNotif?.type === 'success' && { borderColor: '#0ECB81' }
          ]}>
            <View style={styles.priorityPopUpHeader}>
              <View style={[
                styles.priorityIconCircle,
                priorityPopUpNotif?.type === 'alert' && { backgroundColor: 'rgba(240,185,11,0.2)', borderColor: '#F0B90B' },
                priorityPopUpNotif?.type === 'success' && { backgroundColor: 'rgba(14,203,129,0.2)', borderColor: '#0ECB81' }
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
                From: <Text style={{ color: '#F0B90B' }}>{priorityPopUpNotif?.sender || 'Chief Risk Officer'}</Text>
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
                  <Text style={[styles.msgMetaValue, { color: '#F0B90B' }]}>{selectedDetailNotif?.type?.toUpperCase()}</Text>
                </View>
                <View style={styles.msgMetaItem}>
                  <Text style={styles.msgMetaLabel}>STATUS</Text>
                  <Text style={[styles.msgMetaValue, { color: '#0ECB81' }]}>Verified & Logged</Text>
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

      {/* Custom Luxury Alert Modal */}
      <CustomAlertModal alert={customAlert} onDismiss={hideCustomAlert} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#181A20',
  },
  authScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  authBox: {
    backgroundColor: '#1E2329',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  logoBadgeBig: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#000000',
    borderWidth: 1.5,
    borderColor: 'rgba(240,185,11,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 14,
    overflow: 'hidden',
    shadowColor: '#F0B90B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 10,
  },
  logoImageBig: {
    width: 72,
    height: 72,
    borderRadius: 36,
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
    color: '#F0B90B',
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
    backgroundColor: 'rgba(240,185,11,0.2)',
  },
  authToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
  },
  authToggleTextActive: {
    color: '#F0B90B',
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
    color: '#F0B90B',
  },
  goldBtn: {
    backgroundColor: '#F0B90B',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  goldBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#181A20',
  },
  otpNotice: {
    backgroundColor: 'rgba(240,185,11,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(240,185,11,0.25)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  otpNoticeBox: {
    backgroundColor: 'rgba(240,185,11,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(240,185,11,0.3)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  otpNoticeTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#F0B90B',
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
    backgroundColor: '#181A20',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#F0B90B',
    alignSelf: 'flex-start',
  },
  devOtpText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0ECB81',
    letterSpacing: 1,
  },
  devPill: {
    marginTop: 8,
    backgroundColor: 'rgba(240,185,11,0.2)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  devPillText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#F0B90B',
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
    backgroundColor: '#181A20',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadgeSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: 'rgba(240,185,11,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImageSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  headerBrandTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  headerBrandSub: {
    fontSize: 8,
    color: '#F0B90B',
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
    backgroundColor: '#F6465D',
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
    backgroundColor: 'rgba(240,185,11,0.2)',
    borderWidth: 1,
    borderColor: '#F0B90B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#F0B90B',
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
    backgroundColor: '#1E2329',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(240,185,11,0.3)',
  },
  cardEyebrow: {
    fontSize: 10,
    color: '#F0B90B',
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
    color: '#0ECB81',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryActionBtn: {
    flex: 1,
    backgroundColor: '#F0B90B',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryActionText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#181A20',
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
    backgroundColor: 'rgba(240,185,11,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(240,185,11,0.2)',
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
    backgroundColor: '#F0B90B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  deployBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#181A20',
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
    color: '#F0B90B',
  },
  investmentCard: {
    backgroundColor: '#1E2329',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  investmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  investmentName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  countdownBadge: {
    backgroundColor: 'rgba(240,185,11,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  countdownText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#F0B90B',
  },
  investmentGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  investmentLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.4)',
    marginBottom: 2,
  },
  investmentVal: {
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
    backgroundColor: '#0ECB81',
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
  investmentsHeaderBox: {
    backgroundColor: '#1E2329',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  investQuickStatsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    marginBottom: 4,
  },
  investQuickStat: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
  },
  investQuickLabel: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  investQuickVal: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 2,
  },
  goldBtnFull: {
    backgroundColor: '#F0B90B',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  emptyCard: {
    backgroundColor: '#1E2329',
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
    color: '#F0B90B',
    marginTop: 8,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(240,185,11,0.2)',
  },
  statusCompleted: {
    backgroundColor: 'rgba(14,203,129,0.2)',
  },
  statusMatured: {
    backgroundColor: 'rgba(240,185,11,0.25)',
    borderWidth: 1,
    borderColor: '#F0B90B',
  },
  statusCancelled: {
    backgroundColor: 'rgba(246,70,93,0.25)',
    borderWidth: 1,
    borderColor: '#F6465D',
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
    backgroundColor: '#1E2329',
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
    backgroundColor: '#1E2329',
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
    color: '#F0B90B',
    fontWeight: 'bold',
  },
  addressString: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
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
    color: '#F0B90B',
    fontWeight: '600',
  },
  referralCard: {
    backgroundColor: '#1E2329',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(240,185,11,0.3)',
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
    backgroundColor: '#1E2329',
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
    backgroundColor: '#1E2329',
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
    color: '#F0B90B',
  },
  txDate: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.4)',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#181A20',
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
    color: '#F0B90B',
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
    backgroundColor: '#1E2329',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalSheet: {
    backgroundColor: '#1E2329',
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
    backgroundColor: 'rgba(240,185,11,0.2)',
    borderColor: '#F0B90B',
  },
  assetPillText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: 'bold',
  },
  assetPillTextActive: {
    color: '#F0B90B',
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
    borderColor: '#F0B90B',
    backgroundColor: 'rgba(240,185,11,0.08)',
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
    color: '#F0B90B',
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
    borderLeftColor: '#F0B90B',
    backgroundColor: 'rgba(240,185,11,0.05)',
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
    color: '#F0B90B',
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
    borderColor: 'rgba(240,185,11,0.3)',
    backgroundColor: 'rgba(240,185,11,0.1)',
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
    color: '#F0B90B',
  },
  // Modal 5: Priority Pop-Up Modal
  priorityPopUpCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#1E2329',
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#F0B90B',
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
    backgroundColor: 'rgba(240,185,11,0.15)',
    borderWidth: 1,
    borderColor: '#F0B90B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityIconText: {
    fontSize: 22,
  },
  priorityBrandTag: {
    fontSize: 9,
    fontWeight: '900',
    color: '#F0B90B',
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
    backgroundColor: '#1E2329',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(240,185,11,0.5)',
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
    backgroundColor: 'rgba(240,185,11,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(240,185,11,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  msgBoxSubtitle: {
    fontSize: 8,
    fontWeight: '800',
    color: '#F0B90B',
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
    backgroundColor: '#F0B90B',
    alignItems: 'center',
  },
  modalGoldText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#181A20',
  },
  // --- Opening Splash Screen Styles ---
  splashContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  splashGlowBg: {
    position: 'absolute',
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: 'rgba(240,185,11,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(240,185,11,0.08)',
  },
  splashCenterContent: {
    alignItems: 'center',
    width: '100%',
  },
  splashProtocolBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(240, 185, 11, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(240, 185, 11, 0.25)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  splashGreenPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0ECB81',
    marginRight: 7,
  },
  splashProtocolText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#F0B90B',
    letterSpacing: 1.5,
  },
  splashLogoWrapper: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F0B90B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 30,
    elevation: 20,
    overflow: 'hidden',
  },
  splashLogoImage: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: '#000000',
  },
  splashLetterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
    flexWrap: 'nowrap',
  },
  splashLetterText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'HelveticaNeue-Bold' : 'sans-serif-medium',
  },
  splashLetterGold: {
    color: '#F0B90B',
  },
  splashGoldLineAnimated: {
    height: 2,
    backgroundColor: '#F0B90B',
    marginVertical: 12,
    borderRadius: 1,
    shadowColor: '#F0B90B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  splashWelcomeHeading: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F0B90B',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  splashWelcomeSub: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(234, 236, 239, 0.7)',
    textAlign: 'center',
    letterSpacing: 0.4,
    marginBottom: 18,
    paddingHorizontal: 16,
  },
  splashSecurityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(14,203,129,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(14,203,129,0.3)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 16,
  },
  splashPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0ECB81',
    marginRight: 8,
  },
  splashSecurityText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0ECB81',
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
    backgroundColor: '#F0B90B',
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
    bottom: 36,
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
    backgroundColor: 'rgba(14,203,129,0.08)',
    borderColor: 'rgba(14,203,129,0.3)',
  },
  connStatusOffline: {
    backgroundColor: 'rgba(246,70,93,0.08)',
    borderColor: 'rgba(246,70,93,0.3)',
  },
  connStatusPending: {
    backgroundColor: 'rgba(240,185,11,0.08)',
    borderColor: 'rgba(240,185,11,0.3)',
  },
  connDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  connDotOnline: {
    backgroundColor: '#0ECB81',
  },
  connDotOffline: {
    backgroundColor: '#F6465D',
  },
  connDotPending: {
    backgroundColor: '#F0B90B',
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
    color: '#F0B90B',
  },
  // --- Investment Filter Chips ---
  filterChipScroll: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#F0B90B',
    borderColor: '#F0B90B',
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.6)',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  filterChipTextActive: {
    color: '#181A20',
  },
  // --- Enhanced Investment Card States ---
  investmentCardMatured: {
    borderColor: 'rgba(240,185,11,0.6)',
    backgroundColor: 'rgba(240,185,11,0.04)',
  },
  investmentCardCancelled: {
    borderColor: 'rgba(246,70,93,0.4)',
    backgroundColor: 'rgba(246,70,93,0.04)',
  },
  maturedNoticeCard: {
    backgroundColor: 'rgba(240,185,11,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(240,185,11,0.35)',
    borderRadius: 10,
    padding: 10,
    marginVertical: 8,
  },
  maturedNoticeTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#F0B90B',
    marginBottom: 2,
  },
  maturedNoticeText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 14,
  },
  cancellationNoticeCard: {
    backgroundColor: 'rgba(246,70,93,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(246,70,93,0.35)',
    borderRadius: 10,
    padding: 10,
    marginVertical: 8,
  },
  cancellationNoticeTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#F6465D',
    marginBottom: 2,
  },
  cancellationNoticeReason: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.85)',
    fontStyle: 'italic',
    lineHeight: 14,
  },
  activeCountdownBox: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 10,
    marginVertical: 8,
  },
  activeCountdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  activeCountdownLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  activeCountdownVal: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#F0B90B',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  activeVelocityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activeVelocityLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.4)',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  activeVelocityVal: {
    fontSize: 10,
    fontWeight: '600',
    color: '#0ECB81',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  // --- Dynamic Deposit Receiving Address Card Styles ---
  depositAddressCard: {
    backgroundColor: 'rgba(240,185,11,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(240,185,11,0.25)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  depositAddressTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  depositAddressLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: '#F0B90B',
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  depositAddressNetwork: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 2,
  },
  depositAssetBadge: {
    backgroundColor: 'rgba(240,185,11,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(240,185,11,0.4)',
  },
  depositAssetBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#F0B90B',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  depositAddressBox: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 12,
    marginBottom: 10,
  },
  depositAddressString: {
    fontSize: 11,
    color: '#ffffff',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 0.5,
    lineHeight: 16,
  },
  depositCopyBtn: {
    backgroundColor: '#F0B90B',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  depositCopyBtnSuccess: {
    backgroundColor: '#0ECB81',
  },
  depositCopyBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#181A20',
  },
  depositCopyBtnTextSuccess: {
    color: '#ffffff',
  },
  depositMemoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
    gap: 6,
  },
  depositMemoLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  depositMemoValue: {
    fontSize: 10,
    color: '#F0B90B',
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  depositSecurityNotice: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  depositSecurityText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.65)',
    lineHeight: 14,
  },
  // --- Affiliate & Referrals Enhanced Styles ---
  refButtonRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginTop: 8,
  },
  affiliateScheduleCard: {
    backgroundColor: '#1E2329',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  affiliateScheduleTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#F0B90B',
    letterSpacing: 1,
    marginBottom: 2,
  },
  affiliateScheduleSub: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 12,
  },
  tierScheduleList: {
    gap: 8,
  },
  tierScheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  tierScheduleName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  tierScheduleRange: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  tierScheduleRateBadge: {
    backgroundColor: 'rgba(240,185,11,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(240,185,11,0.3)',
  },
  tierScheduleRateText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#F0B90B',
  },
  downlineCard: {
    backgroundColor: '#1E2329',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  downlineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  downlineName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  downlineEmail: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 1,
  },
  downlineDate: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.4)',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  // --- Ledger TXID Styles ---
  txHashRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: 6,
    borderRadius: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  txHashText: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.6)',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    flex: 1,
    marginRight: 6,
  },
  txHashCopy: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#F0B90B',
  },
  // --- Withdrawal Presets & Subsidy Styles ---
  withdrawPresetsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  withdrawPresetBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: 'center',
  },
  withdrawPresetText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#F0B90B',
  },
  subsidyNoticeBox: {
    backgroundColor: 'rgba(14,203,129,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(14,203,129,0.25)',
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
  },
  subsidyNoticeText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 14,
  },
  // --- Investment Modal Yield Calculator Styles ---
  planRateBadge: {
    backgroundColor: 'rgba(240,185,11,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(240,185,11,0.3)',
  },
  planRateText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#F0B90B',
  },
  yieldCalculatorCard: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 12,
    marginBottom: 14,
  },
  yieldCalcTitle: {
    fontSize: 9,
    fontWeight: '900',
    color: '#F0B90B',
    letterSpacing: 1,
    marginBottom: 8,
  },
  yieldCalcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  yieldCalcLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
  },
  yieldCalcVal: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  yieldCalcDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginVertical: 6,
  },
  yieldCalcTotalLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  yieldCalcTotalVal: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0ECB81',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  tierWarningBox: {
    backgroundColor: 'rgba(246,70,93,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(246,70,93,0.3)',
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
  },
  tierWarningText: {
    fontSize: 10,
    color: '#F6465D',
  },
  // Custom Luxury Alert Popup Styles
  customAlertCard: {
    width: '90%',
    maxWidth: 360,
    backgroundColor: '#1E2329',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(240, 185, 11, 0.4)',
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.8,
    shadowRadius: 32,
    elevation: 25,
  },
  customAlertCardSuccess: {
    borderColor: 'rgba(14, 203, 129, 0.5)',
  },
  customAlertCardError: {
    borderColor: 'rgba(246, 70, 93, 0.5)',
  },
  customAlertCardWarning: {
    borderColor: 'rgba(240, 185, 11, 0.5)',
  },
  customAlertIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(240, 185, 11, 0.15)',
    borderWidth: 1.5,
    borderColor: '#F0B90B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  customAlertIconCircleSuccess: {
    backgroundColor: 'rgba(14, 203, 129, 0.15)',
    borderColor: '#0ECB81',
  },
  customAlertIconCircleError: {
    backgroundColor: 'rgba(246, 70, 93, 0.15)',
    borderColor: '#F6465D',
  },
  customAlertIconCircleWarning: {
    backgroundColor: 'rgba(240, 185, 11, 0.15)',
    borderColor: '#F0B90B',
  },
  customAlertIconText: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  customAlertBrandTag: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#F0B90B',
    letterSpacing: 2,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  customAlertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  customAlertMessage: {
    fontSize: 13,
    color: 'rgba(234, 236, 239, 0.85)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 22,
    paddingHorizontal: 6,
  },
  customAlertBtn: {
    width: '100%',
    backgroundColor: '#F0B90B',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F0B90B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  customAlertBtnError: {
    backgroundColor: '#F6465D',
    shadowColor: '#F6465D',
  },
  customAlertBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#181A20',
    letterSpacing: 0.5,
  },
  customAlertBtnTextError: {
    color: '#ffffff',
  },
});
