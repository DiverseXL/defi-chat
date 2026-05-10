export const DEFI_KNOWLEDGE = `
## METEORA POOL TYPES DEEP DIVE

### DLMM (Dynamic Liquidity Market Maker)
- Uses a bin-based system where liquidity is organized in discrete price bins
- Each bin has a fixed price — trades happen at exact bin prices
- Bin step determines spacing between bins (e.g. 1 = 0.01% price difference per bin)
- Smaller bin step = more precise liquidity = higher fees but more maintenance
- Active bin = the bin where current price sits — only this bin earns fees
- Capital efficiency up to 250x better than traditional AMMs
- Best for: experienced LPs who monitor positions actively
- Strategies: Spot (even), Curve (concentrated center), BidAsk (split sides)

### DAMM V2 (Dynamic AMM V2)
- Traditional AMM with dynamic fee adjustment based on market volatility
- Fees increase automatically during high volatility to protect LPs
- No bin management needed — fully passive
- Lower capital efficiency than DLMM but zero maintenance
- Best for: passive LPs who want set-and-forget liquidity

### Stable Pools
- Optimized curve for assets that should trade near the same price
- Examples: USDC/USDT, SOL/mSOL, USDC/USDC bridged variants
- Near-zero impermanent loss
- Lower APY but extremely consistent and safe
- Best for: conservative LPs or those parking idle stablecoins

---

## IMPERMANENT LOSS DEEP DIVE

### What is IL?
Impermanent loss is the difference between holding tokens vs providing liquidity.
If you deposit $1000 of SOL + $1000 USDC and SOL doubles in price:
- Holding: $2000 SOL + $1000 USDC = $3000
- LP position: ~$2828 (AMM rebalances automatically)
- IL: ~$172 loss vs just holding

### IL by Price Change
- 1.25x price change = 0.6% IL
- 1.5x price change = 2.0% IL
- 2x price change = 5.7% IL
- 3x price change = 13.4% IL
- 5x price change = 25.5% IL

### How to Minimize IL
1. Choose stablecoin pairs — near zero IL
2. Use tighter price ranges — less exposure to IL zone
3. Pick high volume pools — fees offset IL faster
4. Use BidAsk strategy in volatile markets
5. Rebalance when significantly out of range

---

## YIELD OPTIMIZATION STRATEGIES

### For Beginners
- Start with USDC/USDT stable pools — safe, consistent 5-15% APY
- Use Spot strategy — balanced and simple
- Wide price ranges — less monitoring needed
- Minimum 30 day holding period for fees to accumulate

### For Intermediate LPs
- SOL/USDC DLMM with medium bin step
- Curve strategy centered around current price
- Monitor every 2-3 days, rebalance when out of range
- Target pools with fee/TVL ratio > 0.1

### For Advanced LPs
- High volatility pairs (BONK/SOL, WIF/USDC)
- BidAsk strategy to capture fees on both sides
- Tight ranges for maximum capital efficiency
- Daily monitoring, frequent rebalancing
- Hedge directional exposure with perpetuals

---

## WHEN TO ZAP IN

Good conditions to enter a pool:
- Pool has been active for > 30 days (established, not a rug)
- Organic score > 70 (genuine trading activity)
- Fee/TVL ratio > 0.05 (fees are meaningful relative to pool size)
- 24h volume > $500k (enough trading to generate real fees)
- Token pair aligns with your market outlook
- Current price is near center of your intended range

Bad conditions to enter:
- Organic score < 50 (potential wash trading)
- Pool age < 7 days (too new, unproven)
- TVL dropped > 30% in 24h (LPs are leaving — why?)
- You don't understand the token pair
- Market is in extreme volatility event

---

## WHEN TO ZAP OUT

Exit signals:
- Position has been out of range for > 48 hours
- Pool volume dropped > 50% from your entry
- Token fundamentals have changed negatively
- You've hit your target APY/profit
- Better opportunity exists elsewhere
- Organic score dropped significantly (suspicious activity)

Never exit because of:
- Short-term price fluctuation (< 24h)
- Temporary IL (it's only realized when you exit)
- Small drawdowns in a healthy pool

---

## SOLANA DEFI ECOSYSTEM GUIDE

### Key Protocols
- **Meteora**: Best LP protocol on Solana — DLMM + DAMM, highest capital efficiency
- **Jupiter**: Best DEX aggregator — always use for optimal swap prices
- **Raydium**: Second largest DEX — good liquidity, CLMM pools
- **Orca**: User-friendly DEX — Whirlpools (CLMM), good for beginners
- **Marinade**: SOL liquid staking — earn staking rewards while providing liquidity
- **Kamino**: Automated liquidity management — auto-rebalances your positions

### Key Tokens to Know
- **SOL**: Solana native token — base pair for most pools
- **USDC**: Circle's USD stablecoin — most liquid stable on Solana
- **USDT**: Tether's USD stablecoin — high liquidity, slight depeg risk historically
- **JUP**: Jupiter governance token — strong fundamentals, active team
- **BONK**: First major Solana meme coin — high volume, high risk
- **WIF**: Dogwifhat — major meme coin, volatile but liquid
- **RAY**: Raydium governance token
- **mSOL**: Marinade staked SOL — earns staking yield + LP fees

### Solana Advantages for DeFi
- Transaction speed: 400ms finality
- Transaction cost: < $0.001 per transaction
- No gas wars — predictable costs
- Native USDC — no bridging needed
- Firedancer upgrade coming — 1M TPS capacity

---

## RISK MANAGEMENT FRAMEWORK

### Portfolio Allocation Guide
- Conservative: 70% stablecoins, 20% blue chip pairs, 10% volatile pairs
- Balanced: 40% stablecoins, 40% blue chip pairs, 20% volatile pairs
- Aggressive: 20% stablecoins, 30% blue chip pairs, 50% volatile pairs

### Position Sizing Rules
- Never put > 30% of portfolio in a single pool
- Always keep 10-20% in stablecoins for rebalancing opportunities
- High-risk pools: max 5-10% of portfolio per pool

### Emergency Exit Signals
- Smart money (top wallets) rapidly exiting a pool
- Pool TVL drops > 40% in 24 hours
- Token price crashes > 50% in 24 hours
- Protocol security issue announced
- Organic score drops below 30

---

## FEES AND RETURNS EXPLAINED

### How LP Fees Work
- Every swap in a pool generates fees
- Fees distributed proportionally to LP share
- Example: $10M pool, you deposit $100k = 1% share
- If pool does $1M daily volume at 0.25% fee = $2,500 daily fees total
- Your share: $25/day = $9,125/year = 9.1% APY just from fees

### Fee Tiers on Meteora
- 0.01% — ultra stable pairs (USDC/USDT)
- 0.05% — stable pairs with slight variance
- 0.1% — semi-stable pairs
- 0.25% — standard pairs (SOL/USDC)
- 0.3% — volatile pairs
- 1%+ — high volatility / meme coin pairs

### Understanding APR vs APY
- APR: simple annual rate without compounding
- APY: rate with compounding (reinvesting fees)
- If APR = 50% compounded daily: APY = 64.8%
- Meteora displays APR — actual returns depend on compounding frequency

---

## COMMON DEFI MISTAKES TO AVOID

1. **Chasing high APY without checking volume** — 1000% APY means nothing if volume is $0
2. **Ignoring IL risk** — high APY in volatile pairs can be wiped by IL
3. **Setting too tight ranges** — position goes out of range constantly, earns nothing
4. **Never rebalancing** — out-of-range positions earn zero fees
5. **Putting all eggs in one pool** — diversify across 3-5 pools minimum
6. **Not checking organic score** — low score = wash trading = fake volume
7. **Exiting during temporary IL** — patience is key in LP
8. **Ignoring smart money movements** — when whales exit, pay attention
9. **Over-optimizing** — frequent rebalancing costs fees and time
10. **FOMO into new pools** — new pools have no track record, higher rug risk
`

export const GLOSSARY = {
  'IL': 'Impermanent Loss — temporary loss from price divergence between paired tokens',
  'LP': 'Liquidity Provider — someone who deposits tokens into a pool to earn fees',
  'DLMM': 'Dynamic Liquidity Market Maker — Meteora\'s concentrated liquidity pool type',
  'TVL': 'Total Value Locked — total capital deposited in a protocol or pool',
  'APR': 'Annual Percentage Rate — yearly return without compounding',
  'APY': 'Annual Percentage Yield — yearly return with compounding',
  'Zap In': 'One-click liquidity deposit — LP Agent swaps and deposits in one transaction',
  'Zap Out': 'One-click liquidity withdrawal — LP Agent withdraws and swaps in one transaction',
  'Bin Step': 'Price granularity in DLMM pools — smaller = more precise but more maintenance',
  'Organic Score': 'LP Agent\'s metric for genuine vs artificial trading activity',
  'In Range': 'When current price is within your LP position\'s set price range — earns fees',
  'Out of Range': 'When price moves outside your range — earns zero fees until rebalanced',
  'Slippage': 'Price movement during transaction execution — set tolerance to protect yourself',
  'MEV': 'Maximal Extractable Value — value extracted by bots front-running transactions',
}