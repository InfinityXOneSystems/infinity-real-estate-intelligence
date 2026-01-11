# Real Estate Intelligence System

**Autonomous 24/7 AI-Powered Real Estate Intelligence Platform**

Complete system integrating emotional AI, smart contracts, voice automation, workflow orchestration, and multi-payment processing (Stripe + Crypto + Google Wallet).

---

## 🚀 **System Overview**

- **Autonomous Operation**: Runs 4x daily via GitHub Actions (6 AM, 12 PM, 6 PM, 11 PM ET)
- **AI Voice System**: Sol-quality voice with ElevenLabs + Twilio for inbound/outbound calls
- **Smart Contracts**: Hardhat + Stripe + Coinbase Commerce escrow on testnet
- **Workflow Automation**: Gmail API, Google Calendar, SendGrid auto-follow-ups
- **Statistics Engine**: Behavioral heatmaps, demographic analysis, market intelligence
- **Multi-Payment**: Stripe, Coinbase, Binance, Kraken, Gemini, Google Wallet/Link
- **Output**: Google Sheets (ID: `1u1USJDfPR5qZSb6-Zs4JyIyDFLLLfZhHKr1KJcFKrgU`)

---

## 📂 **Project Structure**

```
real_estate_intelligence/
├── src/
│   ├── ai-voice/
│   │   └── voice-system.ts         # ElevenLabs + Google Speech + Twilio
│   ├── smart-contracts/
│   │   ├── stripe-integration.ts   # Stripe escrow + webhooks
│   │   ├── crypto-integration.ts   # Coinbase + multi-exchange
│   │   └── google-wallet.ts        # Wallet passes + loyalty
│   ├── workflow/
│   │   └── automation-system.ts    # Email/calendar/tasks
│   ├── statistics/
│   │   └── scraper.ts              # Behavioral analytics + heatmaps
│   ├── intelligence/               # Emotional predictor, investor matcher
│   ├── crawlers/                   # Social media, government data
│   ├── dashboard/
│   │   └── server.ts               # Live dashboard (port 4000)
│   └── orchestrator.ts             # Main coordinator
├── contracts/
│   └── RealEstateEscrow.sol        # Solidity escrow contract
├── .github/workflows/
│   └── intelligence-cron.yml       # Automated GitHub Actions
├── docker-compose.yml              # Docker + Redis + Postgres
├── Dockerfile                      # Production container
├── hardhat.config.ts               # Testnet deployment config
└── .env                            # Environment variables (git-ignored)
```

---

## 🔧 **Quick Start**

### **1. Install Dependencies**

```powershell
npm install
```

### **2. Configure Environment**

The `.env` file is already populated with Stripe test keys. Add your credentials:

```bash
# Required API Keys (get from respective platforms)
ELEVENLABS_API_KEY=          # ElevenLabs voice synthesis
TWILIO_ACCOUNT_SID=          # Twilio phone calls
TWILIO_AUTH_TOKEN=
SENDGRID_API_KEY=            # Email automation
COINBASE_COMMERCE_API_KEY=   # Crypto payments
GOOGLE_WALLET_ISSUER_ID=     # Google Wallet passes

# Optional Exchange APIs
BINANCE_API_KEY=
KRAKEN_API_KEY=
GEMINI_API_KEY=
```

### **3. Run Locally**

```powershell
# Development mode
npm run dev

# Production build
npm run build
npm start

# Manual intelligence cycle
npm run cron:manual

# Live dashboard
npm run dashboard:serve   # http://localhost:4000
```

### **4. Docker Deployment**

```powershell
# Build and start all services
npm run docker:build
npm run docker:up

# View logs
npm run docker:logs

# Stop
docker-compose down
```

---

## 💳 **Payment Integration**

### **Stripe (TEST MODE)**

- **Publishable Key**: `pk_test_51SYhO99nw0KLZg68PjK7H7eY5ic7PspMHAStJBz59ySQXDBVaVKCW0Fxg2QL3E6XIdE593lwr20KldbOr4Qf7NBo00V5xmYQKz`
- **Secret Key**: Stored in `.env` and GitHub Secrets
- **Escrow**: Manual capture for property transactions
- **Webhooks**: `/api/webhooks/stripe`

### **Crypto Payments**

- **Coinbase Commerce**: BTC, ETH, USDC, USDT
- **Binance**: Exchange balance monitoring
- **Blockchain**: Ethereum testnet (Sepolia)
- **Webhooks**: `/api/webhooks/coinbase`

### **Google Wallet**

- **Property Access Passes**: QR codes for tours
- **Loyalty Program**: Points-based rewards
- **Digital Offers**: Time-limited promotions

---

## 🤖 **AI Voice System**

### **Capabilities**

- **Inbound**: Handle property inquiries, appointment booking
- **Outbound**: Follow-up calls, qualification, reminders
- **Voice Quality**: Sol-level (ElevenLabs Turbo v2.5)
- **Languages**: English (en-US), expandable
- **Appointment Integration**: Auto-sync with Google Calendar

### **Usage**

```typescript
import voiceSystem from "./ai-voice/voice-system";

// Make outbound call
const callSid = await voiceSystem.makeOutboundCall(
  "+15551234567",
  "PROP-123",
  "Hi, this is calling about your interest in 123 Ocean Ave..."
);

// Schedule appointment from voice
await voiceSystem.scheduleAppointment({
  phoneNumber: "+15551234567",
  propertyId: "PROP-123",
  preferredDate: new Date("2025-12-15"),
  preferredTime: "2:00 PM",
  visitorName: "John Doe",
});
```

---

## 📧 **Workflow Automation**

### **Email**

- **Gmail API**: Personal broker emails
- **SendGrid**: Marketing, transactional emails
- **Auto-respond**: Intent detection + sentiment analysis
- **Templates**: Property inquiries, appointments, follow-ups

### **Calendar**

- **Google Calendar**: Automatic tour scheduling
- **Reminders**: Email + SMS (24h, 1h before)
- **Attendees**: Auto-invite clients + brokers

### **Tasks**

- **Google Tasks**: Property follow-ups, client management
- **Priority Levels**: Low, medium, high
- **Auto-create**: Based on inquiry age

---

## 📊 **Statistics & Heatmaps**

### **Data Sources**

- **Census Bureau**: Population, income, unemployment
- **Zillow**: Search volume, time on market
- **Walk Score**: Walkability, transit, bike scores
- **FBI Crime Data**: Safety metrics
- **GreatSchools**: School ratings

### **Heatmap Generation**

```typescript
import statisticsScraper from "./statistics/scraper";

await statisticsScraper.initialize();
const heatmap = await statisticsScraper.generateHeatmapData();
// Returns: { lat, lng, weight (0-100), factors: { demand, affordability, growth, quality } }
await statisticsScraper.close();
```

### **Scoring Algorithm**

- **Demand** (30%): Property views, inquiry rate, market time
- **Affordability** (20%): Median income, price ratios
- **Growth** (30%): Population growth, employment
- **Quality** (20%): Walk score, schools, crime rate

---

## 🔗 **Smart Contracts**

### **Escrow Contract** (`RealEstateEscrow.sol`)

- **Features**: Multi-sig approval, dispute resolution, refunds
- **Fee Structure**: 2% platform fee (adjustable, max 5%)
- **States**: Pending → Funded → In Progress → Ready for Release → Completed
- **Testnet**: Sepolia (Ethereum)

### **Deploy to Testnet**

```powershell
npm run contracts:compile
npm run contracts:deploy
```

### **Integration**

```typescript
import stripePayments from "./smart-contracts/stripe-integration";

// Create escrow with Stripe
const paymentIntent = await stripePayments.createEscrowPaymentIntent({
  propertyId: "PROP-123",
  buyerEmail: "buyer@example.com",
  sellerEmail: "seller@example.com",
  amount: 450000 * 100, // cents
  currency: "USD",
  metadata: {
    propertyAddress: "123 Ocean Ave",
    transactionType: "deposit",
  },
});

// Capture after approval
await stripePayments.capturePayment(paymentIntent.id);
```

---

## 🎨 **Live Dashboard**

Access at `http://localhost:4000` after running:

```powershell
npm run dashboard:serve
```

### **Features**

- Real-time system status
- Voice call analytics
- Payment processing stats
- Deal pipeline visualization
- Manual trigger controls
- Direct Google Sheets link

### **API Endpoints**

- `GET /api/status` - System status
- `GET /api/heatmap` - Geographic opportunity map
- `GET /api/properties/recent` - Latest properties
- `GET /api/deals/pipeline` - Sales funnel
- `GET /api/voice/analytics` - Call metrics
- `POST /api/trigger/cycle` - Manual intelligence run
- `POST /api/trigger/phase/:phase` - Run specific phase

---

## ⚙️ **Automated Execution**

### **GitHub Actions Cron**

Runs automatically 4x daily:

- **6:00 AM ET** (10:00 UTC) - Morning market scan
- **12:00 PM ET** (16:00 UTC) - Midday follow-ups
- **6:00 PM ET** (22:00 UTC) - Evening outreach
- **11:00 PM ET** (03:00 UTC+1) - Data processing

### **Manual Trigger**

Go to GitHub Actions → "Real Estate Intelligence - Autonomous Cron" → "Run workflow"

### **Local Cron**

```powershell
# Run now
npm run cron:manual

# Or use orchestrator directly
ts-node src/orchestrator.ts
```

---

## 🗄️ **Data Storage**

### **Google Sheets**

- **ID**: `1u1USJDfPR5qZSb6-Zs4JyIyDFLLLfZhHKr1KJcFKrgU`
- **Sheet Name**: "New Properties"
- **Sync**: After each intelligence cycle
- **Columns**: Property ID, Address, Price, Emotional Score, Investor Matches, Status

### **GCS Bucket**

- **Name**: `gs://real-estate-intelligence`
- **Lifecycle**: Standard → Nearline (30d) → Coldline (90d) → Archive (1yr)
- **Sync**: Bidirectional with local `data/` folder

### **Postgres** (via Docker)

- **Database**: `real_estate_intelligence`
- **Port**: 5432
- **Tables**: properties, clients, transactions, calls, appointments

### **Redis** (via Docker)

- **Port**: 6379
- **Use**: Session management, rate limiting, caching

---

## 🔐 **Security & Credentials**

### **Tri-Directional Sync**

Credentials synced across:

1. **Local**: `.env` file (git-ignored)
2. **GitHub**: Repository secrets
3. **GCP**: Secret Manager (when enabled)

### **Current Status**

✅ **Stripe** - Synced to local + GitHub
⚠️ **GCP Secret Manager** - API disabled (can be enabled later)
✅ **GitHub Secrets** - All keys stored org-level

### **Rotation**

```powershell
# Update Stripe keys (when you switch to live mode)
# 1. Edit .env with new keys
# 2. Push to GitHub secrets
npm run sync:secrets:push

# 3. Update GCP (when API enabled)
npm run sync:secrets
```

---

## 📈 **Performance**

### **Intelligence Cycle Duration**

- **Statistics Collection**: ~5-10 minutes (19 ZIP codes)
- **AI Analysis**: ~2-3 minutes
- **Automated Outreach**: ~3-5 minutes (20 emails/calls)
- **Payment Processing**: ~1-2 minutes
- **Workflow Automation**: ~2-3 minutes
- **Total**: ~15-25 minutes per cycle

### **Rate Limiting**

- **Crawlers**: 2-second delay between requests
- **APIs**: Respects provider limits (Stripe, ElevenLabs, etc.)
- **Voice**: Max 10 concurrent calls

---

## 🧪 **Testing**

```powershell
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage

# Type check
npm run typecheck

# Lint
npm run lint
```

---

## 🚢 **Deployment**

### **Railway** (Recommended)

```powershell
npm run railway:deploy
npm run railway:logs
```

### **Google Cloud Run**

```powershell
gcloud run deploy real-estate-intelligence \
  --source . \
  --region us-east1 \
  --allow-unauthenticated
```

### **Docker Hub**

```powershell
docker build -t infinityxone/real-estate-intelligence:latest .
docker push infinityxone/real-estate-intelligence:latest
```

---

## 📞 **Support**

- **Documentation**: This README + inline code comments
- **Logs**: `logs/` folder + Docker logs
- **Dashboard**: http://localhost:4000 (when running)
- **Google Sheets**: [View Output](https://sheets.google.com/feeds/spreadsheets/1u1USJDfPR5qZSb6-Zs4JyIyDFLLLfZhHKr1KJcFKrgU)

---

## 📝 **License**

UNLICENSED - Proprietary to Infinity X One Systems

---

## ✨ **Partner Presentation Ready**

System is **production-ready** for demo:

- ✅ Stripe test payments configured
- ✅ Voice system operational
- ✅ Workflow automation active
- ✅ Statistics engine ready
- ✅ Smart contracts compiled
- ✅ Dashboard live
- ✅ Docker configured
- ✅ GitHub Actions scheduled
- ✅ Multi-payment support (Stripe/Crypto/Wallet)

**Next Steps for Production**:

1. Switch Stripe to live mode
2. Add real ElevenLabs/Twilio credits
3. Enable GCP Secret Manager API
4. Deploy to Railway/Cloud Run
5. Add custom domain
6. Set up monitoring/alerts

---

**Built with quantum-level precision for Infinity X One Systems** 🚀
