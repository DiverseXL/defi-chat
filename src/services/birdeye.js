const BIRDEYE_KEY = import.meta.env.VITE_BIRDEYE_KEY
const BASE_URL = 'https://public-api.birdeye.so'

const analysisCache = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// SOL token address
const SOL_ADDRESS = 'So11111111111111111111111111111111111111112'

const cache = new Map()
const CACHE_TTL = 10 * 60 * 1000 // 10 minutes

// Helper for rate-limited fetch with retries and caching
async function fetchWithRetry(url, options = {}, retries = 3, backoff = 1500) {
  // 1. Check cache first
  if (cache.has(url)) {
    const { data, ts } = cache.get(url)
    if (Date.now() - ts < CACHE_TTL) return data
  }

  const apiKey = import.meta.env.VITE_BIRDEYE_KEY || BIRDEYE_KEY
  const headers = {
    'X-API-KEY': apiKey,
    'x-chain': 'solana',
    ...options.headers
  }

  try {
    const res = await fetch(url, { ...options, headers })
    
    if (res.status === 429 && retries > 0) {
      console.warn(`Birdeye rate limited (429) for ${url}. Retrying in ${backoff}ms...`)
      await new Promise(r => setTimeout(r, backoff + Math.random() * 500))
      return fetchWithRetry(url, options, retries - 1, backoff * 2)
    }
    
    if (!res.ok) return null

    const data = await res.json()
    // 2. Save to cache on success
    if (data?.success) {
      cache.set(url, { data, ts: Date.now() })
    }
    return data
  } catch (err) {
    if (retries > 0) {
      await new Promise(r => setTimeout(r, backoff))
      return fetchWithRetry(url, options, retries - 1, backoff * 2)
    }
    return null
  }
}

// Get current token price
export async function getTokenPrice(address) {
  if (address === SOL_ADDRESS) {
    // We can get SOL price from Jupiter or other sources more reliably
    // but if we want Birdeye data:
  }
  const data = await fetchWithRetry(`${BASE_URL}/defi/price?address=${address}`)
  return data?.data || null
}

// Get token overview — name, symbol, market cap, volume, price change
export async function getTokenOverview(address) {
  const data = await fetchWithRetry(`${BASE_URL}/defi/token_overview?address=${address}`)
  return data?.data || null
}

// Get token security — holder concentration, top holders, rug risk
export async function getTokenSecurity(address) {
  // SOL is inherently safe/special-cased
  if (address === SOL_ADDRESS) {
    return {
      ownerCount: 1000000,
      top10HolderPercent: 1,
      creatorAddress: 'Native',
      freezeable: false,
      mintable: false,
    }
  }
  const data = await fetchWithRetry(`${BASE_URL}/defi/token_security?address=${address}`)
  return data?.data || null
}

// Get full token analysis — combines all three calls
export async function analyzeToken(address) {
  if (!address) return null
  
  const cached = analysisCache.get(address)
  if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
    console.log('Birdeye cache hit for:', address)
    return cached.data
  }

  // Handle native SOL with hardcoded "perfect" security
  if (address === SOL_ADDRESS) {
    const solResult = {
      price: 0,
      priceChange24h: 0,
      symbol: 'SOL',
      name: 'Solana',
      marketCap: 0,
      volume24h: 0,
      holders: 1000000,
      top10HolderPercent: 1,
      creatorAddress: 'System',
      isVerified: true,
      freezeable: false,
      mintable: false,
    }
    try {
       const [price, overview] = await Promise.all([
         getTokenPrice(address),
         getTokenOverview(address)
       ])
       solResult.price = price?.value || 0
       solResult.priceChange24h = overview?.priceChange24hPercent || 0
       solResult.marketCap = overview?.mc || 0
       solResult.volume24h = overview?.v24hUSD || 0
       
       analysisCache.set(address, { data: solResult, timestamp: Date.now() })
       return solResult
    } catch {
       return solResult
    }
  }

  try {
    // Serialized to avoid 429 burst limits
    const price = await getTokenPrice(address)
    await new Promise(r => setTimeout(r, 200))
    const overview = await getTokenOverview(address)
    await new Promise(r => setTimeout(r, 200))
    const security = await getTokenSecurity(address)

    const result = {
      price: price?.value || 0,
      priceChange24h: overview?.priceChange24hPercent || 0,
      symbol: overview?.symbol || 'Unknown',
      name: overview?.name || 'Unknown',
      marketCap: overview?.mc || 0,
      volume24h: overview?.v24hUSD || 0,
      // Robust mapping for varying API response styles
      holders: security?.ownerCount || security?.owner_count || 0,
      top10HolderPercent: security?.top10HolderPercent || security?.top_10_holder_percent || 0,
      creatorAddress: security?.creatorAddress || security?.creator_address || null,
      isVerified: (overview?.extensions?.coingeckoId || overview?.extensions?.website || overview?.is_verified) ? true : false,
      freezeable: security?.freezeable || security?.freeze_authority !== null || false,
      mintable: security?.mintable || security?.mint_authority !== null || false,
      isMutable: security?.mutable_metadata || security?.is_mutable || false,
      hasSecurityData: security ? true : false
    }

    analysisCache.set(address, { data: result, timestamp: Date.now() })
    return result
  } catch (err) {
    console.error('analyzeToken failed:', err)
    return null
  }
}

// Calculate risk level from security data
export function calculateRiskLevel(tokenData) {
  if (!tokenData) return { level: 'Unknown', score: 0, flags: [] }

  const flags = []
  let riskScore = 0

  if (!tokenData.hasSecurityData) {
    flags.push('SECURITY AUDIT INCOMPLETE: Live security feed unavailable for this token')
    riskScore += 20
  }

  if (tokenData.top10HolderPercent > 80) {
    flags.push('CRITICAL: Top 10 wallets hold ' + tokenData.top10HolderPercent.toFixed(1) + '% of supply')
    riskScore += 50
  } else if (tokenData.top10HolderPercent > 50) {
    flags.push('High concentration: Top 10 hold ' + tokenData.top10HolderPercent.toFixed(1) + '%')
    riskScore += 30
  }

  if (tokenData.freezeable) {
    flags.push('RUG RISK: Token can be frozen by authority at any time')
    riskScore += 60
  }

  if (tokenData.mintable) {
    flags.push('INFLATION RISK: Authority can mint new tokens')
    riskScore += 30
  }

  if (tokenData.isMutable) {
    flags.push('Metadata is mutable: Creator can change token name/logo to scam')
    riskScore += 15
  }

  if (!tokenData.isVerified && tokenData.holders < 500) {
    flags.push('Unverified token with very low holder count')
    riskScore += 25
  }

  const level = riskScore >= 70 ? 'CRITICAL' : riskScore >= 40 ? 'HIGH' : riskScore >= 20 ? 'MEDIUM' : 'LOW'
  return { level, score: riskScore, flags }
}