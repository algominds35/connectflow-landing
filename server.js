const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.raw({ type: 'application/json' }));

// In-memory storage (replace with database in production)
let customers = {};
let activeSyncs = {};

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'ConnectFlow Platform API',
    version: '2.0.0',
    customers: Object.keys(customers).length,
    activeSyncs: Object.keys(activeSyncs).length,
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Lemon Squeezy Billing Routes

// Pricing page route
app.get('/pricing', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ConnectFlows - Pricing</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                color: #333;
            }
            .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; color: white; margin-bottom: 50px; }
            .header h1 { font-size: 3rem; margin-bottom: 20px; }
            .header p { font-size: 1.2rem; opacity: 0.9; }
            .pricing-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; }
            .plan { 
                background: white; border-radius: 20px; padding: 40px 30px; text-align: center;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1); transition: transform 0.3s ease;
                position: relative; overflow: hidden;
            }
            .plan:hover { transform: translateY(-10px); }
            .plan.popular { 
                border: 3px solid #667eea; transform: scale(1.05);
                box-shadow: 0 25px 50px rgba(102, 126, 234, 0.3);
            }
            .plan.popular::before {
                content: 'Most Popular'; position: absolute; top: 20px; right: -35px;
                background: #667eea; color: white; padding: 8px 40px;
                transform: rotate(45deg); font-size: 0.9rem; font-weight: bold;
            }
            .plan-name { font-size: 1.5rem; font-weight: bold; margin-bottom: 10px; color: #333; }
            .plan-price { font-size: 3rem; font-weight: bold; color: #667eea; margin-bottom: 20px; }
            .plan-price span { font-size: 1rem; color: #666; }
            .plan-features { list-style: none; margin-bottom: 30px; }
            .plan-features li { 
                padding: 10px 0; color: #666; position: relative; padding-left: 25px;
                border-bottom: 1px solid #f0f0f0;
            }
            .plan-features li::before { 
                content: '✓'; position: absolute; left: 0; color: #4CAF50; font-weight: bold; 
            }
            .cta-button { 
                background: linear-gradient(135deg, #667eea, #764ba2); color: white;
                border: none; padding: 15px 30px; border-radius: 50px; font-size: 1.1rem;
                cursor: pointer; transition: all 0.3s ease; text-decoration: none;
                display: inline-block; font-weight: bold;
            }
            .cta-button:hover { 
                background: linear-gradient(135deg, #5a6fd8, #6a42a0);
                transform: translateY(-2px); box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
            }
            .savings { background: #e8f5e8; color: #2d5016; padding: 8px 16px; border-radius: 20px; font-size: 0.9rem; margin-bottom: 15px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Choose Your ConnectFlows Plan</h1>
                <p>Save $100K+ annually with automated Salesforce ↔ HubSpot sync</p>
            </div>

            <div class="pricing-grid">
                <div class="plan">
                    <div class="plan-name">Starter</div>
                    <div class="savings">Save $45K+ annually</div>
                    <div class="plan-price">$197<span>/month</span></div>
                    <ul class="plan-features">
                        <li>Up to 5,000 contacts</li>
                        <li>Bidirectional Salesforce ↔ HubSpot sync</li>
                        <li>Real-time updates</li>
                        <li>Basic field mapping</li>
                        <li>Email support</li>
                        <li>Conflict resolution</li>
                    </ul>
                    <button class="cta-button" onclick="subscribe('starter')">Start Free Trial</button>
                </div>

                <div class="plan popular">
                    <div class="plan-name">Professional</div>
                    <div class="savings">Save $195K+ annually</div>
                    <div class="plan-price">$397<span>/month</span></div>
                    <ul class="plan-features">
                        <li>Up to 25,000 contacts</li>
                        <li>Advanced bidirectional sync</li>
                        <li>Custom field mapping</li>
                        <li>Real-time webhooks</li>
                        <li>Priority support</li>
                        <li>Advanced analytics</li>
                        <li>Team collaboration</li>
                        <li>Duplicate detection</li>
                    </ul>
                    <button class="cta-button" onclick="subscribe('professional')">Start Free Trial</button>
                </div>

                <div class="plan">
                    <div class="plan-name">Enterprise</div>
                    <div class="savings">Save $490K+ annually</div>
                    <div class="plan-price">$797<span>/month</span></div>
                    <ul class="plan-features">
                        <li>Unlimited contacts</li>
                        <li>White-label integration</li>
                        <li>Multi-instance sync</li>
                        <li>24/7 phone support</li>
                        <li>Custom development</li>
                        <li>Enterprise security (SOC2)</li>
                        <li>SLA guarantees</li>
                        <li>Dedicated account manager</li>
                    </ul>
                    <button class="cta-button" onclick="subscribe('enterprise')">Start Free Trial</button>
                </div>
            </div>
        </div>

        <script>
            async function subscribe(plan) {
                try {
                    const response = await fetch('/create-checkout', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ plan })
                    });
                    
                    const data = await response.json();
                    if (data.checkoutUrl) {
                        window.location.href = data.checkoutUrl;
                    } else {
                        alert('Error creating checkout. Please try again.');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert('Error creating checkout. Please try again.');
                }
            }
        </script>
    </body>
    </html>
  `);
});

// Create checkout session with Lemon Squeezy
app.post('/create-checkout', async (req, res) => {
  try {
    const { plan } = req.body;

    // Map plans to your Lemon Squeezy product variant IDs
    const planVariants = {
      starter: '839923',      // Basic/Starter plan
      professional: '845532', // Professional plan  
      enterprise: '845546'    // Enterprise plan
    };

    const variantId = planVariants[plan];
    if (!variantId) {
      return res.status(400).json({ error: 'Invalid plan selected' });
    }

    // Create checkout with Lemon Squeezy API
    const checkoutResponse = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.LEMON_SQUEEZY_API_KEY}`,
        'Content-Type': 'application/vnd.api+json',
        'Accept': 'application/vnd.api+json'
      },
      body: JSON.stringify({
        data: {
          type: 'checkouts',
          attributes: {
            checkout_data: {
              email: 'customer@example.com',
              name: 'ConnectFlows Customer',
              custom: {
                plan: plan
              }
            }
          },
          relationships: {
            store: {
              data: {
                type: 'stores',
                id: process.env.LEMON_SQUEEZY_STORE_ID
              }
            },
            variant: {
              data: {
                type: 'variants',
                id: variantId
              }
            }
          }
        }
      })
    });

    const checkoutData = await checkoutResponse.json();
    
    if (checkoutData.data && checkoutData.data.attributes.url) {
      res.json({ checkoutUrl: checkoutData.data.attributes.url });
    } else {
      console.error('Lemon Squeezy API Error:', checkoutData);
      res.status(500).json({ error: 'Failed to create checkout session' });
    }

  } catch (error) {
    console.error('Checkout creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Webhook endpoint for Lemon Squeezy
app.post('/webhooks/lemonsqueezy', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const payload = req.body;
    const signature = req.headers['x-signature'];
    
    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.LEMON_SQUEEZY_WEBHOOK_SECRET)
      .update(payload)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('Invalid webhook signature');
      return res.status(400).send('Invalid signature');
    }

    const event = JSON.parse(payload);
    const eventType = event.meta.event_name;
    const data = event.data;

    console.log('Webhook received:', eventType);

    switch (eventType) {
      case 'order_created':
        console.log('Order created:', data.id);
        // Create customer record from order
        if (data.attributes.customer_email) {
          const customerId = data.id;
          customers[customerId] = {
            id: customerId,
            email: data.attributes.customer_email,
            plan: data.attributes.custom?.plan || 'starter',
            status: 'active',
            createdAt: new Date().toISOString(),
            onboarded: false
          };
        }
        break;

      case 'subscription_created':
        console.log('Subscription created:', data.id);
        // Handle subscription creation
        break;

      case 'subscription_updated':
        console.log('Subscription updated:', data.id);
        // Handle subscription changes
        break;

      case 'subscription_cancelled':
        console.log('Subscription cancelled:', data.id);
        // Handle cancellation
        break;

      case 'subscription_resumed':
        console.log('Subscription resumed:', data.id);
        // Handle resumption
        break;
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Webhook error');
  }
});

// Success page (updated for Lemon Squeezy)
app.get('/success', (req, res) => {
  const { order_id } = req.query;
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Welcome to ConnectFlow!</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
        .success { background: #d4edda; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .button { background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; }
        .steps { background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="success">
        <h2>🎉 Payment Successful!</h2>
        <p>Welcome to ConnectFlows!</p>
        <p>Order ID: ${order_id}</p>
      </div>
      
      <div class="steps">
        <h3>What happens next:</h3>
        <ol>
          <li>Check your email for onboarding instructions</li>
          <li>Connect your Salesforce and HubSpot accounts</li>
          <li>Start syncing your data automatically</li>
        </ol>
      </div>
      
      <a href="https://rapid-mailbox-production.up.railway.app/demo" class="button">View Demo →</a>
      
      <p style="margin-top: 30px; color: #666;">
        Questions? Contact support at hello@getconnectflows.com
      </p>
    </body>
    </html>
  `);
});

// Cancel page
app.get('/cancel', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Payment Cancelled</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
        .cancel { background: #f8d7da; padding: 20px; border-radius: 5px; }
        .button { background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="cancel">
        <h2>Payment Cancelled</h2>
        <p>No worries! You can try again anytime.</p>
        <a href="https://getconnectflows.com" class="button">← Back to ConnectFlow</a>
      </div>
    </body>
    </html>
  `);
});

// Onboarding flow
app.get('/onboard/:customerId', (req, res) => {
  const { customerId } = req.params;
  const customer = customers[customerId];
  
  if (!customer) {
    return res.status(404).send('Customer not found');
  }

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>ConnectFlow Onboarding</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .card { background: white; border: 1px solid #ddd; border-radius: 8px; padding: 30px; margin: 20px 0; }
        .button { background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px; }
        .connected { background: #28a745; }
        .pending { background: #ffc107; color: black; }
        h1 { color: #333; }
        .step { margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 5px; }
      </style>
    </head>
    <body>
      <h1>🚀 Welcome to ConnectFlow!</h1>
      <p>Let's get your data syncing in 3 simple steps:</p>
      
      <div class="card">
        <div class="step">
          <h3>Step 1: Connect Salesforce</h3>
          <p>Connect your Salesforce account to start syncing leads and contacts.</p>
          <a href="/auth/salesforce?customer=${customerId}" class="button">Connect Salesforce</a>
        </div>
        
        <div class="step">
          <h3>Step 2: Connect HubSpot</h3>
          <p>Connect your HubSpot account to enable bi-directional sync.</p>
          <a href="/auth/hubspot?customer=${customerId}" class="button">Connect HubSpot</a>
        </div>
        
        <div class="step">
          <h3>Step 3: Configure Sync</h3>
          <p>Set up your sync preferences and field mappings.</p>
          <a href="/configure/${customerId}" class="button pending">Configure Sync</a>
        </div>
      </div>
      
      <div class="card">
        <h3>💡 Pro Tips:</h3>
        <ul>
          <li>Make sure you have admin access to both platforms</li>
          <li>The sync will start automatically once both connections are made</li>
          <li>You can customize field mappings anytime in your dashboard</li>
        </ul>
      </div>
    </body>
    </html>
  `);
});

// OAuth routes (simplified for demo)
app.get('/auth/salesforce', (req, res) => {
  const { customer } = req.query;
  res.send(`
    <h2>Salesforce OAuth</h2>
    <p>In production, this would redirect to Salesforce OAuth.</p>
    <a href="/oauth/callback/salesforce?customer=${customer}&code=demo">Simulate Successful Connection</a>
  `);
});

app.get('/auth/hubspot', (req, res) => {
  const { customer } = req.query;
  res.send(`
    <h2>HubSpot OAuth</h2>
    <p>In production, this would redirect to HubSpot OAuth.</p>
    <a href="/oauth/callback/hubspot?customer=${customer}&code=demo">Simulate Successful Connection</a>
  `);
});

// OAuth callbacks
app.get('/oauth/callback/salesforce', (req, res) => {
  const { customer, code } = req.query;
  
  if (customers[customer]) {
    customers[customer].salesforce = {
      connected: true,
      connectedAt: new Date().toISOString(),
      accessToken: 'sf_' + code
    };
  }
  
  res.redirect(`/onboard/${customer}?sf=connected`);
});

app.get('/oauth/callback/hubspot', (req, res) => {
  const { customer, code } = req.query;
  
  if (customers[customer]) {
    customers[customer].hubspot = {
      connected: true,
      connectedAt: new Date().toISOString(),
      accessToken: 'hs_' + code
    };
  }
  
  res.redirect(`/onboard/${customer}?hs=connected`);
});

// Configuration page
app.get('/configure/:customerId', (req, res) => {
  const { customerId } = req.params;
  const customer = customers[customerId];
  
  if (!customer) {
    return res.status(404).send('Customer not found');
  }

  const sfConnected = customer.salesforce?.connected;
  const hsConnected = customer.hubspot?.connected;

  if (!sfConnected || !hsConnected) {
    return res.redirect(`/onboard/${customerId}`);
  }

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Configure Your Sync</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .card { background: white; border: 1px solid #ddd; border-radius: 8px; padding: 30px; margin: 20px 0; }
        .button { background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; }
        .field-mapping { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 5px; }
      </style>
    </head>
    <body>
      <h1>🔧 Configure Your Data Sync</h1>
      
      <div class="card">
        <h3>✅ Connections Verified</h3>
        <p>✅ Salesforce: Connected</p>
        <p>✅ HubSpot: Connected</p>
      </div>
      
      <div class="card">
        <h3>Default Field Mappings</h3>
        <div class="field-mapping">
          <strong>Salesforce Lead → HubSpot Contact</strong><br>
          First Name → First Name<br>
          Last Name → Last Name<br>
          Email → Email<br>
          Company → Company<br>
          Phone → Phone<br>
        </div>
        
        <div class="field-mapping">
          <strong>Sync Direction:</strong> Bi-directional<br>
          <strong>Sync Frequency:</strong> Real-time<br>
          <strong>Duplicate Handling:</strong> Update existing<br>
        </div>
      </div>
      
      <a href="/start-sync/${customerId}" class="button">🚀 Start Syncing Now</a>
    </body>
    </html>
  `);
});

// Start sync
app.get('/start-sync/:customerId', async (req, res) => {
  const { customerId } = req.params;
  const customer = customers[customerId];
  
  if (!customer) {
    return res.status(404).send('Customer not found');
  }

  // Mark customer as onboarded and start sync
  customer.onboarded = true;
  customer.syncStatus = 'active';
  customer.syncStartedAt = new Date().toISOString();
  
  // Add to active syncs
  activeSyncs[customerId] = {
    customerId,
    status: 'running',
    startedAt: new Date().toISOString(),
    recordsSynced: 0,
    lastSync: new Date().toISOString()
  };

  // Simulate initial sync
  setTimeout(() => {
    if (activeSyncs[customerId]) {
      activeSyncs[customerId].recordsSynced = Math.floor(Math.random() * 100) + 50;
      activeSyncs[customerId].lastSync = new Date().toISOString();
    }
  }, 5000);

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Sync Started!</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
        .success { background: #d4edda; padding: 30px; border-radius: 8px; }
        .button { background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px; }
        .stats { background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="success">
        <h1>🎉 Your Data Sync is Now Active!</h1>
        <p>ConnectFlow is now syncing your Salesforce and HubSpot data in real-time.</p>
      </div>
      
      <div class="stats">
        <h3>What's happening now:</h3>
        <p>✅ Initial data scan in progress</p>
        <p>✅ Field mappings applied</p>
        <p>✅ Real-time sync activated</p>
        <p>✅ Duplicate detection enabled</p>
      </div>
      
      <a href="/dashboard/${customerId}" class="button">View Dashboard</a>
      <a href="https://getconnectflows.com" class="button">Back to ConnectFlow</a>
      
      <p style="margin-top: 30px; color: #666;">
        You'll receive email updates about sync progress and any issues.
      </p>
    </body>
    </html>
  `);
});

// Customer dashboard
app.get('/dashboard/:customerId', (req, res) => {
  const { customerId } = req.params;
  const customer = customers[customerId];
  const sync = activeSyncs[customerId];
  
  if (!customer) {
    return res.status(404).send('Customer not found');
  }

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>ConnectFlow Dashboard</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 1000px; margin: 0 auto; padding: 20px; }
        .card { background: white; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin: 15px 0; }
        .metric { display: inline-block; margin: 10px 20px; text-align: center; }
        .metric-value { font-size: 2em; font-weight: bold; color: #007bff; }
        .status-active { color: #28a745; }
        .button { background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
      </style>
    </head>
    <body>
      <h1>ConnectFlow Dashboard</h1>
      <p>Welcome back! Here's your sync overview:</p>
      
      <div class="card">
        <h3>Account Status</h3>
        <p><strong>Plan:</strong> ${customer.plan}</p>
        <p><strong>Status:</strong> <span class="status-active">${customer.status}</span></p>
        <p><strong>Member since:</strong> ${new Date(customer.createdAt).toLocaleDateString()}</p>
      </div>
      
      <div class="card">
        <h3>Sync Metrics</h3>
        ${sync ? `
          <div class="metric">
            <div class="metric-value">${sync.recordsSynced}</div>
            <div>Records Synced</div>
          </div>
          <div class="metric">
            <div class="metric-value status-active">Active</div>
            <div>Sync Status</div>
          </div>
          <div class="metric">
            <div class="metric-value">${new Date(sync.lastSync).toLocaleTimeString()}</div>
            <div>Last Sync</div>
          </div>
        ` : `
          <p>Sync not yet started. <a href="/onboard/${customerId}">Complete onboarding</a></p>
        `}
      </div>
      
      <div class="card">
        <h3>Connected Platforms</h3>
        <p>✅ Salesforce: ${customer.salesforce?.connected ? 'Connected' : 'Not connected'}</p>
        <p>✅ HubSpot: ${customer.hubspot?.connected ? 'Connected' : 'Not connected'}</p>
      </div>
      
      <div class="card">
        <h3>Quick Actions</h3>
        <a href="/configure/${customerId}" class="button">Sync Settings</a>
        <a href="mailto:hello@getconnectflows.com" class="button">Contact Support</a>
      </div>
    </body>
    </html>
  `);
});

// API endpoints for website integration
app.get('/api/customers', (req, res) => {
  res.json({
    total: Object.keys(customers).length,
    active: Object.values(customers).filter(c => c.status === 'active').length,
    onboarded: Object.values(customers).filter(c => c.onboarded).length
  });
});

app.get('/api/syncs', (req, res) => {
  res.json({
    total: Object.keys(activeSyncs).length,
    running: Object.values(activeSyncs).filter(s => s.status === 'running').length,
    totalRecords: Object.values(activeSyncs).reduce((sum, sync) => sum + sync.recordsSynced, 0)
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 ConnectFlows Server Starting...`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Server URL: http://localhost:${PORT}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  console.log(`💰 Pricing Page: http://localhost:${PORT}/pricing`);
  console.log(`✅ Server ready for connections!`);
});
