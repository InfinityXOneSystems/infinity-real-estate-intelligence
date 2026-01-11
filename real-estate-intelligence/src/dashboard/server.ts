/**
 * Live Dashboard Server
 * Real-time visualization of intelligence system status, heatmaps, deals
 */

import express, { Request, Response } from 'express';
import * as dotenv from 'dotenv';
import orchestrator from './orchestrator';

dotenv.config();

const app = express();
const PORT = process.env.DASHBOARD_PORT || 4000;

app.use(express.json());
app.use(express.static('public'));

/**
 * Health check
 */
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * System status
 */
app.get('/api/status', (req: Request, res: Response) => {
  const status = new orchestrator().getStatus();
  res.json(status);
});

/**
 * Heatmap data
 */
app.get('/api/heatmap', async (req: Request, res: Response) => {
  try {
    // This would fetch from database or cache
    const mockHeatmap = [
      {
        lat: 27.2931,
        lng: -80.3253,
        weight: 85,
        factors: { demand: 90, affordability: 75, growth: 88, quality: 87 },
      },
      {
        lat: 27.4467,
        lng: -80.3256,
        weight: 78,
        factors: { demand: 80, affordability: 82, growth: 75, quality: 76 },
      },
      {
        lat: 27.3805,
        lng: -80.3998,
        weight: 92,
        factors: { demand: 95, affordability: 85, growth: 93, quality: 95 },
      },
    ];

    res.json({ success: true, data: mockHeatmap });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: 'Failed to fetch heatmap data' });
  }
});

/**
 * Recent properties
 */
app.get('/api/properties/recent', async (req: Request, res: Response) => {
  try {
    const mockProperties = [
      {
        id: 'PROP-001',
        address: '123 Ocean Ave, Port St. Lucie, FL 34950',
        price: 450000,
        beds: 4,
        baths: 3,
        sqft: 2400,
        status: 'active',
        emotionalScore: 85,
        investorMatches: 12,
        daysOnMarket: 5,
      },
      {
        id: 'PROP-002',
        address: '456 Beach Blvd, Fort Pierce, FL 34946',
        price: 325000,
        beds: 3,
        baths: 2,
        sqft: 1800,
        status: 'pending',
        emotionalScore: 92,
        investorMatches: 8,
        daysOnMarket: 12,
      },
    ];

    res.json({ success: true, data: mockProperties });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: 'Failed to fetch properties' });
  }
});

/**
 * Deal pipeline
 */
app.get('/api/deals/pipeline', async (req: Request, res: Response) => {
  try {
    const pipeline = {
      leads: 45,
      qualified: 28,
      negotiating: 12,
      underContract: 5,
      closed: 3,
      totalValue: 15750000,
    };

    res.json({ success: true, data: pipeline });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch pipeline' });
  }
});

/**
 * Voice call analytics
 */
app.get('/api/voice/analytics', async (req: Request, res: Response) => {
  try {
    const analytics = {
      totalCalls: 156,
      successfulBookings: 47,
      averageDuration: 4.5,
      conversionRate: 30.1,
      activeSessions: 3,
    };

    res.json({ success: true, data: analytics });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: 'Failed to fetch voice analytics' });
  }
});

/**
 * Payment statistics
 */
app.get('/api/payments/stats', async (req: Request, res: Response) => {
  try {
    const stats = {
      stripeTotalProcessed: 1250000,
      cryptoTotalProcessed: 385000,
      pendingEscrow: 750000,
      completedTransactions: 23,
      averageTransactionSize: 54347,
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: 'Failed to fetch payment stats' });
  }
});

/**
 * Trigger intelligence cycle manually
 */
app.post('/api/trigger/cycle', async (req: Request, res: Response) => {
  try {
    const orch = new orchestrator();

    // Run in background
    orch.executeIntelligenceCycle().catch(console.error);

    res.json({ success: true, message: 'Intelligence cycle triggered' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to trigger cycle' });
  }
});

/**
 * Trigger specific phase
 */
app.post('/api/trigger/phase/:phase', async (req: Request, res: Response) => {
  const { phase } = req.params;

  if (
    !['statistics', 'analysis', 'outreach', 'payments', 'workflow'].includes(
      phase
    )
  ) {
    return res.status(400).json({ success: false, error: 'Invalid phase' });
  }

  try {
    const orch = new orchestrator();
    await orch.executePhase(phase as any);

    res.json({ success: true, message: `Phase ${phase} completed` });
  } catch (error) {
    res.status(500).json({ success: false, error: `Phase ${phase} failed` });
  }
});

/**
 * HTML Dashboard (simple for demo)
 */
app.get('/', (req: Request, res: Response) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Real Estate Intelligence Dashboard</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #333;
          padding: 20px;
        }
        .container { max-width: 1400px; margin: 0 auto; }
        h1 {
          color: white;
          text-align: center;
          margin-bottom: 30px;
          font-size: 2.5rem;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        .card {
          background: white;
          border-radius: 12px;
          padding: 25px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          transition: transform 0.3s;
        }
        .card:hover { transform: translateY(-5px); }
        .card h2 {
          color: #667eea;
          margin-bottom: 15px;
          font-size: 1.3rem;
        }
        .metric {
          display: flex;
          justify-content: space-between;
          margin: 10px 0;
          padding: 10px;
          background: #f7f9fc;
          border-radius: 6px;
        }
        .metric-label { font-weight: 600; color: #666; }
        .metric-value { font-weight: 700; color: #667eea; font-size: 1.1rem; }
        .btn {
          display: inline-block;
          padding: 12px 24px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          text-decoration: none;
          margin: 5px;
          transition: background 0.3s;
        }
        .btn:hover { background: #5568d3; }
        .btn-success { background: #48bb78; }
        .btn-success:hover { background: #38a169; }
        .controls {
          text-align: center;
          background: white;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .status {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
        }
        .status-active { background: #48bb78; color: white; }
        .status-idle { background: #edf2f7; color: #666; }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .live { animation: pulse 2s infinite; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>ðŸ  Real Estate Intelligence System <span class="live">â—</span></h1>

        <div class="grid">
          <div class="card">
            <h2>ðŸ“Š System Status</h2>
            <div class="metric">
              <span class="metric-label">Status</span>
              <span class="status status-active">ACTIVE</span>
            </div>
            <div class="metric">
              <span class="metric-label">Intelligence Cycles</span>
              <span class="metric-value" id="cycles">0</span>
            </div>
            <div class="metric">
              <span class="metric-label">Voice Sessions</span>
              <span class="metric-value" id="voice">0</span>
            </div>
          </div>

          <div class="card">
            <h2>ðŸ’° Payment Processing</h2>
            <div class="metric">
              <span class="metric-label">Stripe (Test)</span>
              <span class="metric-value">$1.25M</span>
            </div>
            <div class="metric">
              <span class="metric-label">Crypto</span>
              <span class="metric-value">$385K</span>
            </div>
            <div class="metric">
              <span class="metric-label">Escrow</span>
              <span class="metric-value">$750K</span>
            </div>
          </div>

          <div class="card">
            <h2>ðŸŽ¯ Deal Pipeline</h2>
            <div class="metric">
              <span class="metric-label">Active Leads</span>
              <span class="metric-value">45</span>
            </div>
            <div class="metric">
              <span class="metric-label">Under Contract</span>
              <span class="metric-value">5</span>
            </div>
            <div class="metric">
              <span class="metric-label">Closed (Month)</span>
              <span class="metric-value">3</span>
            </div>
          </div>

          <div class="card">
            <h2>ðŸ“ž AI Voice Analytics</h2>
            <div class="metric">
              <span class="metric-label">Total Calls</span>
              <span class="metric-value">156</span>
            </div>
            <div class="metric">
              <span class="metric-label">Bookings</span>
              <span class="metric-value">47</span>
            </div>
            <div class="metric">
              <span class="metric-label">Conversion</span>
              <span class="metric-value">30.1%</span>
            </div>
          </div>
        </div>

        <div class="controls">
          <h2 style="margin-bottom: 20px;">âš¡ System Controls</h2>
          <button class="btn btn-success" onclick="triggerCycle()">Run Intelligence Cycle</button>
          <button class="btn" onclick="triggerPhase('statistics')">Statistics</button>
          <button class="btn" onclick="triggerPhase('outreach')">Outreach</button>
          <button class="btn" onclick="triggerPhase('payments')">Payments</button>
          <a href="https://sheets.google.com/feeds/spreadsheets/1u1USJDfPR5qZSb6-Zs4JyIyDFLLLfZhHKr1KJcFKrgU" target="_blank" class="btn">ðŸ“ View Google Sheets</a>
        </div>
      </div>

      <script>
        async function triggerCycle() {
          try {
            const res = await fetch('/api/trigger/cycle', { method: 'POST' });
            const data = await res.json();
            alert(data.success ? 'âœ… Intelligence cycle triggered!' : 'âŒ Failed');
          } catch (e) {
            alert('âŒ Error: ' + e.message);
          }
        }

        async function triggerPhase(phase) {
          try {
            const res = await fetch(\`/api/trigger/phase/\${phase}\`, { method: 'POST' });
            const data = await res.json();
            alert(data.success ? \`âœ… \${phase} completed!\` : \`âŒ \${phase} failed\`);
          } catch (e) {
            alert('âŒ Error: ' + e.message);
          }
        }

        async function updateStats() {
          try {
            const res = await fetch('/api/status');
            const data = await res.json();
            document.getElementById('cycles').textContent = data.runCount || 0;
            document.getElementById('voice').textContent = data.voiceActiveSessions || 0;
          } catch (e) {
            console.error('Failed to update stats:', e);
          }
        }

        // Update stats every 10 seconds
        setInterval(updateStats, 10000);
        updateStats();
      </script>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`\nðŸŽ¨ Dashboard running at http://localhost:${PORT}`);
  console.log(`   API: http://localhost:${PORT}/api/status`);
  console.log(`   Heatmap: http://localhost:${PORT}/api/heatmap\n`);
});

export default app;
