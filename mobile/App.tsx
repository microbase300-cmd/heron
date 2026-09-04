import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar 
} from 'react-native';

export default function App() {
  const [balance, setBalance] = useState(14500.00);
  const [activeTab, setActiveTab] = useState('overview');
  const [secondsLeft, setSecondsLeft] = useState(52 * 3600 + 14 * 60 + 22);

  // Live countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#060807" />
      
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>H</Text>
          </View>
          <View>
            <Text style={styles.brandTitle}>HERON ASSETS</Text>
            <Text style={styles.brandSubtitle}>INSTITUTIONAL LIQUID</Text>
          </View>
        </View>
        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>VERIFIED</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* NAV Card */}
        <View style={styles.navCard}>
          <Text style={styles.cardEyebrow}>NET ASSET VALUE (USD)</Text>
          <Text style={styles.navAmount}>${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
          
          <View style={styles.deltaRow}>
            <View style={styles.deltaPill}>
              <Text style={styles.deltaText}>+15.5% 24H ACCRUED</Text>
            </View>
            <Text style={styles.subTokens}>≈ 0.2119 BTC • 4.095 ETH</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.8}>
              <Text style={styles.primaryBtnText}>+ Deposit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} activeOpacity={0.8}>
              <Text style={styles.secondaryBtnText}>Withdraw ↗</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Active Mandate Countdown */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>ACTIVE SMART ESCROW</Text>
            <Text style={styles.sectionLink}>1 ACTIVE</Text>
          </View>

          <View style={styles.mandateCard}>
            <View style={styles.mandateTop}>
              <Text style={styles.mandateName}>Premium Plan</Text>
              <Text style={styles.mandateRate}>72h • 15.5%</Text>
            </View>

            <View style={styles.statGrid}>
              <View>
                <Text style={styles.statLabel}>ALLOCATED</Text>
                <Text style={styles.statValue}>$8,000.00</Text>
              </View>
              <View>
                <Text style={styles.statLabel}>EST. PAYOUT</Text>
                <Text style={[styles.statValue, { color: '#28d17c' }]}>$9,240.00</Text>
              </View>
            </View>

            {/* Countdown Bar */}
            <View style={styles.timerBox}>
              <Text style={styles.timerLabel}>DISBURSEMENT COUNTDOWN</Text>
              <Text style={styles.timerText}>{formatTime(secondsLeft)}</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '38%' }]} />
              </View>
            </View>
          </View>
        </View>

        {/* 4 Investment Tiers */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>INVESTMENT PLANS</Text>
            <Text style={styles.sectionLink}>GUARANTEED</Text>
          </View>

          {[
            { name: 'Amateur Plan', hours: '24h', rate: '4.5%', range: '$100 – $1,999', ref: '8% Ref' },
            { name: 'Standard Plan', hours: '48h', rate: '9.5%', range: '$2,000 – $5,999', ref: '16% Ref' },
            { name: 'Premium Plan (VIP)', hours: '72h', rate: '15.5%', range: '$6,000 – $10,999', ref: '24% Ref', featured: true },
            { name: 'Retirement Plan', hours: '96h', rate: '22.5%', range: '$11,000 – Uncapped', ref: '30% Ref' }
          ].map((plan, i) => (
            <TouchableOpacity 
              key={i} 
              style={[styles.planCard, plan.featured && styles.planCardFeatured]}
              activeOpacity={0.85}
            >
              <View style={styles.planHeader}>
                <Text style={[styles.planTitle, plan.featured && { color: '#d6a84f' }]}>{plan.name}</Text>
                <Text style={styles.planBadge}>{plan.hours} Cycle</Text>
              </View>
              
              <View style={styles.planRow}>
                <Text style={styles.planRate}>{plan.rate}</Text>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.planRange}>{plan.range}</Text>
                  <Text style={styles.planRef}>{plan.ref}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Bottom Nav Bar */}
      <View style={styles.bottomNav}>
        {['Overview', 'Mandates', 'Deploy', 'Referrals'].map((tab, idx) => (
          <TouchableOpacity 
            key={idx} 
            onPress={() => setActiveTab(tab.toLowerCase())}
            style={styles.navItem}
          >
            <Text style={[
              styles.navItemText, 
              activeTab === tab.toLowerCase() && styles.navItemActive
            ]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#060807',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(214, 168, 79, 0.15)',
    borderWidth: 1,
    borderColor: '#d6a84f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#d6a84f',
    fontWeight: 'bold',
    fontSize: 16,
  },
  brandTitle: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  brandSubtitle: {
    color: '#d6a84f',
    fontSize: 9,
    fontFamily: 'monospace',
    letterSpacing: 1.2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(40, 209, 124, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(40, 209, 124, 0.3)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#28d17c',
  },
  statusText: {
    color: '#28d17c',
    fontSize: 9,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 16,
  },
  navCard: {
    backgroundColor: 'rgba(214, 168, 79, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(214, 168, 79, 0.3)',
    borderRadius: 20,
    padding: 20,
    marginTop: 16,
  },
  cardEyebrow: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 10,
    fontFamily: 'monospace',
    letterSpacing: 1.2,
  },
  navAmount: {
    color: '#ffffff',
    fontSize: 34,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  deltaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  deltaPill: {
    backgroundColor: 'rgba(40, 209, 124, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(40, 209, 124, 0.3)',
  },
  deltaText: {
    color: '#28d17c',
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  subTokens: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 10,
    fontFamily: 'monospace',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: '#d6a84f',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#060807',
    fontWeight: 'bold',
    fontSize: 12,
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 12,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 11,
    fontFamily: 'monospace',
    letterSpacing: 1.2,
  },
  sectionLink: {
    color: '#d6a84f',
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  mandateCard: {
    backgroundColor: 'rgba(18, 24, 21, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(214, 168, 79, 0.3)',
    borderRadius: 16,
    padding: 16,
  },
  mandateTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mandateName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mandateRate: {
    color: '#d6a84f',
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  statGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 12,
    borderRadius: 10,
    marginVertical: 6,
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 9,
    fontFamily: 'monospace',
  },
  statValue: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 2,
  },
  timerBox: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  timerLabel: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 9,
    fontFamily: 'monospace',
  },
  timerText: {
    color: '#d6a84f',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginVertical: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#d6a84f',
  },
  planCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  planCardFeatured: {
    backgroundColor: 'rgba(214, 168, 79, 0.06)',
    borderColor: 'rgba(214, 168, 79, 0.4)',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  planTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  planBadge: {
    color: '#d6a84f',
    fontSize: 10,
    fontFamily: 'monospace',
  },
  planRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  planRate: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  planRange: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  planRef: {
    color: '#d6a84f',
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: '#070908',
  },
  navItem: {
    paddingVertical: 4,
  },
  navItemText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  navItemActive: {
    color: '#d6a84f',
  },
});
