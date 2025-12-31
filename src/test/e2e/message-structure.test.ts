/**
 * E2E Test: Compare API Message vs SignalR Message Structure
 * 
 * Test scenario:
 * 1. User1 sends a message via API
 * 2. Capture the message from API response
 * 3. Capture the message from SignalR event
 * 4. Compare the two structures to find mismatches
 * 
 * Run: npx tsx src/test/e2e/message-structure.test.ts
 */

import * as signalR from '@microsoft/signalr';

// ============ CONFIG ============
const AUTH_API_URL = 'https://vega-identity-api-dev.allianceitsc.com';
const CHAT_API_URL = 'https://vega-chat-api-dev.allianceitsc.com';
const SIGNALR_HUB_URL = `${CHAT_API_URL}/hubs/chat`;

const USER1_CREDENTIALS = {
  email: 'admin@quoc-nam.com',
  password: 'Admin@123',
};

// ============ HELPERS ============
async function login(email: string, password: string): Promise<{ accessToken: string; userId: string }> {
  const response = await fetch(`${AUTH_API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: email, password }),
  });

  if (!response.ok) {
    throw new Error(`Login failed: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  return { accessToken: data.accessToken, userId: data.user.id };
}

async function getConversations(accessToken: string): Promise<{ id: string; name: string }[]> {
  const response = await fetch(`${CHAT_API_URL}/api/conversations`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Get conversations failed: ${response.status}`);
  }

  const data = await response.json();
  return data.items || data;
}

async function sendMessage(accessToken: string, conversationId: string, content: string): Promise<unknown> {
  const response = await fetch(`${CHAT_API_URL}/api/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ conversationId, content }),
  });

  if (!response.ok) {
    throw new Error(`Send message failed: ${response.status} ${await response.text()}`);
  }

  return response.json();
}

async function getMessages(accessToken: string, conversationId: string): Promise<{ items: unknown[] }> {
  const response = await fetch(`${CHAT_API_URL}/api/conversations/${conversationId}/messages?limit=5`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Get messages failed: ${response.status}`);
  }

  return response.json();
}

function createSignalRConnection(accessToken: string): signalR.HubConnection {
  return new signalR.HubConnectionBuilder()
    .withUrl(SIGNALR_HUB_URL, {
      accessTokenFactory: () => accessToken,
    })
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Warning)
    .build();
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function compareObjects(obj1: Record<string, unknown>, obj2: Record<string, unknown>, path = ''): string[] {
  const differences: string[] = [];
  const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);

  for (const key of allKeys) {
    const fullPath = path ? `${path}.${key}` : key;
    const val1 = obj1[key];
    const val2 = obj2[key];

    if (!(key in obj1)) {
      differences.push(`❌ Missing in API: "${fullPath}" (SignalR has: ${JSON.stringify(val2)})`);
    } else if (!(key in obj2)) {
      differences.push(`❌ Missing in SignalR: "${fullPath}" (API has: ${JSON.stringify(val1)})`);
    } else if (typeof val1 !== typeof val2) {
      differences.push(`⚠️ Type mismatch "${fullPath}": API=${typeof val1} (${JSON.stringify(val1)}), SignalR=${typeof val2} (${JSON.stringify(val2)})`);
    } else if (typeof val1 === 'object' && val1 !== null && val2 !== null) {
      if (Array.isArray(val1) && Array.isArray(val2)) {
        if (val1.length !== val2.length) {
          differences.push(`⚠️ Array length mismatch "${fullPath}": API=${val1.length}, SignalR=${val2.length}`);
        }
      } else if (!Array.isArray(val1) && !Array.isArray(val2)) {
        differences.push(...compareObjects(val1 as Record<string, unknown>, val2 as Record<string, unknown>, fullPath));
      }
    } else if (val1 !== val2) {
      // Only report significant differences (ignore timestamps)
      if (!fullPath.toLowerCase().includes('at') && !fullPath.toLowerCase().includes('time')) {
        differences.push(`⚠️ Value mismatch "${fullPath}": API=${JSON.stringify(val1)}, SignalR=${JSON.stringify(val2)}`);
      }
    }
  }

  return differences;
}

// ============ TEST ============
async function runMessageStructureTest() {
  console.log('🚀 Starting Message Structure Comparison Test\n');

  let connection: signalR.HubConnection | null = null;

  try {
    // ===== Login =====
    console.log('📝 Step 1: Login...');
    const auth = await login(USER1_CREDENTIALS.email, USER1_CREDENTIALS.password);
    console.log(`   ✅ Logged in as: ${USER1_CREDENTIALS.email}`);
    console.log('');

    // ===== Get conversation =====
    console.log('📝 Step 2: Get conversation...');
    const conversations = await getConversations(auth.accessToken);
    const conversationId = conversations[0]?.id;
    if (!conversationId) throw new Error('No conversations found');
    console.log(`   ✅ Using conversation: ${conversationId}`);
    console.log('');

    // ===== Setup SignalR =====
    console.log('📝 Step 3: Setup SignalR connection...');
    connection = createSignalRConnection(auth.accessToken);
    
    let signalRMessage: Record<string, unknown> | null = null;
    
    connection.on('MessageSent', (data: { message: Record<string, unknown> }) => {
      signalRMessage = data.message;
      console.log('   📨 Received SignalR message');
    });

    await connection.start();
    await connection.invoke('JoinConversation', conversationId);
    console.log(`   ✅ Connected and joined conversation`);
    console.log('');

    // ===== Send message =====
    console.log('📝 Step 4: Send message via API...');
    const testContent = `[Structure Test] ${new Date().toISOString()}`;
    const apiResponse = await sendMessage(auth.accessToken, conversationId, testContent) as Record<string, unknown>;
    console.log('   ✅ Message sent');
    console.log('');

    // Wait for SignalR
    console.log('📝 Step 5: Wait for SignalR message...');
    await wait(2000);
    
    if (!signalRMessage) {
      console.log('   ⚠️ SignalR message not received, fetching from API...');
      const messages = await getMessages(auth.accessToken, conversationId);
      const latestFromApi = messages.items[0] as Record<string, unknown>;
      signalRMessage = latestFromApi;
    }
    console.log('');

    // ===== Compare structures =====
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📊 API RESPONSE STRUCTURE');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(JSON.stringify(apiResponse, null, 2));
    console.log('');

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📊 SIGNALR MESSAGE STRUCTURE');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(JSON.stringify(signalRMessage, null, 2));
    console.log('');

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📊 STRUCTURE DIFFERENCES');
    console.log('═══════════════════════════════════════════════════════════════');
    
    const differences = compareObjects(apiResponse, signalRMessage || {});
    
    if (differences.length === 0) {
      console.log('   ✅ No significant differences found!');
    } else {
      console.log('   Found the following differences:\n');
      differences.forEach((diff) => console.log(`   ${diff}`));
    }
    console.log('');

    // ===== Check specific fields that might cause blank display =====
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📊 CRITICAL FIELDS CHECK');
    console.log('═══════════════════════════════════════════════════════════════');
    
    const criticalFields = ['id', 'content', 'senderId', 'senderName', 'conversationId', 'contentType', 'sentAt', 'createdAt'];
    
    for (const field of criticalFields) {
      const apiVal = apiResponse[field];
      const signalVal = signalRMessage?.[field];
      
      const apiType = typeof apiVal;
      const signalType = typeof signalVal;
      
      if (apiVal === undefined && signalVal === undefined) {
        console.log(`   ⚪ ${field}: not present in either`);
      } else if (apiVal === undefined) {
        console.log(`   🔴 ${field}: MISSING in API, SignalR has: ${signalType} = ${JSON.stringify(signalVal)}`);
      } else if (signalVal === undefined) {
        console.log(`   🔴 ${field}: MISSING in SignalR, API has: ${apiType} = ${JSON.stringify(apiVal)}`);
      } else if (apiType !== signalType) {
        console.log(`   🟡 ${field}: TYPE MISMATCH - API: ${apiType} (${apiVal}), SignalR: ${signalType} (${signalVal})`);
      } else if (apiVal !== signalVal) {
        console.log(`   🟡 ${field}: VALUE DIFFERS - API: ${JSON.stringify(apiVal)}, SignalR: ${JSON.stringify(signalVal)}`);
      } else {
        console.log(`   ✅ ${field}: ${apiType} = ${JSON.stringify(apiVal)}`);
      }
    }

    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🎯 RECOMMENDATION');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('   If you see type mismatches or missing fields above,');
    console.log('   the component rendering the message may be expecting');
    console.log('   different field names or types than what SignalR provides.');
    console.log('');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.stop().catch(() => {});
    }
    console.log('🧹 Cleanup complete\n');
  }
}

runMessageStructureTest()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
