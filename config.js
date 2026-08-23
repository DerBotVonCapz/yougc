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
export const VERIFIED_PRICE = 6.99;  // badge + highlighted photo + 3 posts a day, per month
export const PIN_PRICE = 10;         // 24h on top of the marketplace. profile pin and post pin are sold separately
export const AGENT_PRICE = 4.99;     // personal creator/brand agent, per month
// kept as aliases so nothing breaks anywhere that still imports the old names
export const FEATURED_PRICE = PIN_PRICE;
export const SPOTLIGHT_PRICE = PIN_PRICE;

// stripe payment links: paste the link per perk once created, card button appears automatically on the pay page
export const PAY_LINKS = {
  verified:    'https://buy.stripe.com/8x26ozctn0yH1Ku8Uh77O04',
  pin_profile: 'https://buy.stripe.com/00w5kv64Z2GP1Ku7Qd77O01',
  pin_post:    'https://buy.stripe.com/00weV5bpj95d60K8Uh77O03',
  agent:       'https://buy.stripe.com/3cIfZ92SNchp3SCdax77O02',
  studio:      ''
};
