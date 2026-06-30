// ROOST Payment Configuration
// Payment methods and fee structure

const paymentConfig = {
  methods: [
    {
      id: 'telebirr',
      name: 'TeleBirr',
      type: 'mobile_money',
      icon: '📱',
      instructions: 'Send to: 0911XXXXXXX',
    },
    {
      id: 'cbe_birr',
      name: 'CBE Birr',
      type: 'mobile_money',
      icon: '🏦',
      instructions: 'Send to: 0911XXXXXXX',
    },
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      type: 'bank',
      icon: '🏛️',
      instructions: 'CBE Account: 1000XXXXXXXX',
    },
    {
      id: 'chapa',
      name: 'Chapa (Card)',
      type: 'gateway',
      icon: '💳',
      instructions: 'Pay securely online',
    },
    {
      id: 'manual',
      name: 'Other / Upload Screenshot',
      type: 'manual',
      icon: '📸',
      instructions: 'Upload payment proof',
    },
  ],

  fees: {
    hostCommission: 10, // 10%
    guestServiceFee: 12, // 12%
    minimumServiceFee: 100, // ETB
    maximumServiceFee: 5000, // ETB
  },

  payoutSchedule: '24 hours after check-in',

  currency: {
    code: 'ETB',
    symbol: 'ብር',
    locale: 'am-ET',
  },
};

export default paymentConfig;
