# DEiD Score System Deployment Guide

## 🚀 Quick Start

### 1. Environment Setup

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

Required environment variables:

```bash
# Smart Contract
NEXT_PUBLIC_PROXY_ADDRESS=0xfcd6b7875C34c02846F55408038CbC35bC5A0BEF
NEXT_PUBLIC_TESTNET_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY

# IPFS Node
NEXT_PUBLIC_IPFS_GATEWAY_URL=http://35.247.142.76:8080/ipfs
NEXT_IPFS_GATEWAY_URL_POST=http://35.247.142.76:5001/api/v0/add

# Validator (KEEP SECRET!)
VALIDATOR_PRIVATE_KEY=0xYOUR_PRIVATE_KEY

# Cron Security
CRON_SECRET=your_random_secret_string

# Backend
NEXT_PUBLIC_DEID_AUTH_BACKEND=http://localhost:8000
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the app.

## 📋 Pre-Deployment Checklist

### Smart Contract
- [ ] ScoreFacet deployed and added to proxy
- [ ] Validator address added to DEiDProfile contract
- [ ] Cooldown period configured (recommended: 3600 seconds = 1 hour)
- [ ] Contract verified on block explorer

### IPFS Node
- [ ] IPFS node running and accessible
- [ ] CORS configured to allow your domain
- [ ] API endpoint `/api/v0/add` working
- [ ] Gateway endpoint `/ipfs/:cid` working
- [ ] Sufficient storage space

### Validator Wallet
- [ ] Private key generated securely
- [ ] Address added as validator on-chain
- [ ] Funded with test ETH for gas (minimum 0.1 ETH recommended)
- [ ] Never commit private key to git!

### Environment Variables
- [ ] All variables set in production environment
- [ ] VALIDATOR_PRIVATE_KEY only in server environment (not NEXT_PUBLIC_)
- [ ] CRON_SECRET generated (use: `openssl rand -hex 32`)
- [ ] RPC URL has sufficient rate limit

## 🔧 IPFS Node Configuration

### Kubo (Go-IPFS) Setup

1. Install Kubo:
```bash
wget https://dist.ipfs.tech/kubo/v0.27.0/kubo_v0.27.0_linux-amd64.tar.gz
tar -xvzf kubo_v0.27.0_linux-amd64.tar.gz
cd kubo
sudo bash install.sh
```

2. Initialize:
```bash
ipfs init
```

3. Configure CORS:
```bash
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["GET", "POST"]'
ipfs config Addresses.API /ip4/0.0.0.0/tcp/5001
ipfs config Addresses.Gateway /ip4/0.0.0.0/tcp/8080
```

4. Run as daemon:
```bash
ipfs daemon
```

### Using PM2 for Production

```bash
npm install -g pm2
pm2 start ipfs daemon --name ipfs-node
pm2 save
pm2 startup
```

## 📦 Deployment

### Vercel Deployment

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

Vercel will automatically:
- Set up the cron job from `vercel.json`
- Run daily at midnight UTC
- Call `/api/score/cron` endpoint

### Manual Cron Setup (Alternative)

If not using Vercel, set up cron manually:

```bash
crontab -e
```

Add:
```
0 0 * * * curl -X POST https://your-domain.com/api/score/cron -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## 🧪 Testing

### 1. Test IPFS Upload

```bash
curl -F file=@test.json http://35.247.142.76:5001/api/v0/add
```

Should return CID.

### 2. Test IPFS Fetch

```bash
curl http://35.247.142.76:8080/ipfs/YOUR_CID
```

Should return JSON content.

### 3. Test Score Calculation

Navigate to `/profile` page and click "Update Scores" button.

Expected flow:
1. Button shows loading state
2. API calculates scores for all users
3. Uploads snapshot to IPFS
4. Signs snapshot with validator
5. Returns data to frontend
6. Frontend submits transaction
7. Transaction confirmed
8. Scores updated!

### 4. Test Leaderboard

Navigate to `/leaderboard` to see rankings.

## 🔍 Troubleshooting

### IPFS Upload Fails

**Problem**: Upload returns 404 or times out

**Solution**:
1. Check IPFS daemon is running: `ipfs id`
2. Verify API endpoint: `curl http://localhost:5001/api/v0/version`
3. Check firewall rules allow port 5001
4. Verify CORS settings

### Signature Verification Fails

**Problem**: Transaction reverts with "Invalid signature"

**Solution**:
1. Verify validator address is added on-chain
2. Check signature format matches simulation
3. Ensure message hash calculation is correct
4. Test with simulation script first

### Cooldown Error

**Problem**: Can't update scores even after waiting

**Solution**:
1. Check contract cooldown: `getCooldown()`
2. Check last update time: `getLastUpdate()`
3. Calculate: `now >= lastUpdate + cooldown`
4. Wait additional time if needed

### Transaction Out of Gas

**Problem**: Transaction fails due to insufficient gas

**Solution**:
1. Increase gas limit in transaction
2. Fund validator wallet with more ETH
3. Reduce number of users if possible
4. Optimize contract if needed

### IPFS Gateway Timeout

**Problem**: Frontend can't fetch snapshot data

**Solution**:
1. Check IPFS gateway is running
2. Try public gateways as fallback (ipfs.io, pinata)
3. Increase timeout in fetch calls
4. Verify CID is pinned

## 📊 Monitoring

### Key Metrics to Monitor

1. **IPFS Storage**: Monitor disk space usage
2. **Validator Balance**: Ensure sufficient ETH for gas
3. **API Response Times**: Track `/api/score/recompute` latency
4. **Error Rates**: Monitor failed transactions
5. **Snapshot Count**: Verify daily snapshots created

### Logs to Check

**Frontend**: Vercel dashboard logs
**IPFS**: `ipfs log tail`
**Contract**: Block explorer events for `SnapshotUpdated`

## 🔐 Security Best Practices

1. **Never commit private keys**: Use `.gitignore`
2. **Rotate validator keys regularly**: Every 3-6 months
3. **Monitor validator activity**: Set up alerts
4. **Rate limit APIs**: Prevent abuse
5. **Validate all inputs**: Use validation utilities
6. **Keep dependencies updated**: Run `npm audit`
7. **Use HTTPS**: Especially for IPFS gateway
8. **Backup IPFS data**: Regular backups of important CIDs

## 📈 Scaling Considerations

### For 1,000+ Users

- Implement pagination in leaderboard
- Cache snapshot data in Redis
- Use database for update counts
- Consider CDN for IPFS content

### For 10,000+ Users

- Batch processing for score calculation
- Separate worker for background jobs
- Multiple IPFS nodes with load balancer
- Optimistic UI updates

## 🆘 Support

If you encounter issues:

1. Check logs in Vercel dashboard
2. Verify contract events on block explorer
3. Test IPFS node directly
4. Review README_SCORE_SYSTEM.md for details
5. Check simulation tests for reference

## ✅ Post-Deployment Verification

1. Visit `/profile` - Should show score card
2. Visit `/leaderboard` - Should show rankings
3. Click "Update Scores" - Should complete successfully
4. Wait 24 hours - Verify cron job runs
5. Check contract events - Should see SnapshotUpdated events

## 🎉 Success Indicators

- ✅ Users can trigger score updates
- ✅ Snapshots uploaded to IPFS
- ✅ Transactions confirmed on-chain
- ✅ Leaderboard displays correctly
- ✅ Historical snapshots accessible
- ✅ Daily cron job runs successfully
- ✅ No errors in production logs

---

**Deployed successfully?** Congratulations! 🎉

The DEiD Score System is now live and users can start earning and tracking their scores!
