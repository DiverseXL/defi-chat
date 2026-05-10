import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = 'https://api.lpagent.io/open-api/v1';
const API_KEY = process.env.VITE_LP_AGENT_KEY;

async function checkSpecificPool() {
  console.log('--- Checking SOL/USDC Pool Data ---');
  try {
    const res = await fetch(`${BASE_URL}/pools/discover?chain=SOL&sortBy=vol_24h&sortOrder=desc&pageSize=50`, {
      headers: { 'x-api-key': API_KEY }
    });
    const data = await res.json();
    
    if (!data?.data) {
      console.log('❌ No data returned from API.');
      return;
    }

    const solUsdc = data.data.filter(p => {
      const sA = p.token_x_symbol || p.token_a_symbol || p.token0_symbol || p.baseTokenInfo?.symbol;
      const sB = p.token_y_symbol || p.token_b_symbol || p.token1_symbol || p.quoteTokenInfo?.symbol;
      return (sA === 'SOL' && sB === 'USDC') || (sA === 'USDC' && sB === 'SOL');
    });

    if (solUsdc.length > 0) {
      console.log(`✅ Found ${solUsdc.length} SOL/USDC pools in the top 50.`);
      console.log('Top Match:', solUsdc[0].pool || solUsdc[0].address);
    } else {
      console.log('❌ SOL/USDC not found in the top 50 pools.');
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

checkSpecificPool();
