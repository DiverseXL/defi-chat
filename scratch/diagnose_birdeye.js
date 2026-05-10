import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = 'https://public-api.birdeye.so';
const API_KEY = process.env.VITE_BIRDEYE_KEY;
const USDC_ADDRESS = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

async function diagnoseBirdeye() {
  console.log('--- Birdeye Security Diagnostic ---');
  const headers = {
    'X-API-KEY': API_KEY,
    'x-chain': 'solana',
    'accept': 'application/json'
  };

  try {
    const res = await fetch(`${BASE_URL}/defi/token_security?address=${USDC_ADDRESS}`, { headers });
    const data = await res.json();
    
    console.log('Status:', res.status);
    if (data.success) {
      console.log('✅ Security Data Fetched Successfully');
      console.log('Keys returned:', Object.keys(data.data || {}));
      console.log('Sample data (Security):', JSON.stringify(data.data, null, 2));
    } else {
      console.log('❌ API Error:', data.message || 'Unknown error');
    }
  } catch (err) {
    console.error('❌ Fetch failed:', err.message);
  }
}

diagnoseBirdeye();
