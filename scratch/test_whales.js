import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = 'https://api.lpagent.io/open-api/v1';
const API_KEY = process.env.VITE_LP_AGENT_KEY;

async function testWhaleData() {
  console.log('--- Testing LP Agent Whale Data ---');
  try {
    // 1. Get Top Pools
    const poolRes = await fetch(`${BASE_URL}/pools/discover?chain=SOL&sortBy=vol_24h&sortOrder=desc&pageSize=1`, {
      headers: { 'x-api-key': API_KEY }
    });
    const pools = await poolRes.json();
    const topPool = pools?.data?.[0];

    if (!topPool) {
      console.log('❌ No pools found.');
      return;
    }

    const poolId = topPool.pool || topPool.address;
    console.log(`✅ Found Top Pool: ${topPool.token0_symbol}/${topPool.token1_symbol} (${poolId})`);

    // 2. Get LPers for this pool
    const lperRes = await fetch(`${BASE_URL}/pools/${poolId}/top-lpers?sort_order=desc&page=1&limit=3`, {
      headers: { 'x-api-key': API_KEY }
    });
    const lpers = await lperRes.json();

    if (lpers?.data && lpers.data.length > 0) {
      console.log(`✅ Success! Found ${lpers.data.length} whales for this pool.`);
      console.log('Sample Whale Wallet:', lpers.data[0].owner);
    } else {
      console.log('⚠️ API returned success but 0 whales found for this specific pool.');
    }
  } catch (err) {
    console.error('❌ Diagnostic Failed:', err.message);
  }
}

testWhaleData();
