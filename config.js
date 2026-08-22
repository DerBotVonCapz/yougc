// YOUgc project connection (publishable key only; NEVER put the secret key here)
export const SUPABASE_URL = 'https://oemezcziuqefzhtsnotm.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_sXia33UR_g43dCp59RsAKA_1FBKOlL_';

// flip this to true when we announce MARKETPLACE IS LIVE
export const LAUNCHED = false;

// paid extras. PAY_URL: your PayPal.me or Stripe payment link (e.g. 'https://paypal.me/yougc')
// people pay there with their @username as reference, you activate in Supabase
export const PAY_URL = '';
// direct wallet addresses shown on pay.html, e.g. { 'USDC (SOL)': 'abc...', 'ETH': '0x...' }
export const CRYPTO_ADDR = {
  'SOL': '6ixCsYathgPeH7MZBHxpjzg2wGWKBr86qohWbFYw7T3H',
  'ETH': '0x741587BbA8F5C50118b0D40D04cE4Bb72cBacB24',
  'BTC': 'bc1q4ksum7x504umv8jdcpypeayvrs0rcuz9z9q7uq'
};
export const FEATURED_PRICE = 25;    // pin one post on top, 24h
export const VERIFIED_PRICE = 3.99;  // verified pack: badge + pro look + 3 posts/day
export const SPOTLIGHT_PRICE = 10;   // spotlight profile card on top, 2 days
