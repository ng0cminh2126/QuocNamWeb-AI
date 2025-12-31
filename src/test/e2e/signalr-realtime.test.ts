/**
 * E2E Test: SignalR Realtime Messaging
 * 
 * Test scenario:
 * 1. User1 và User2 cùng login
 * 2. Cả 2 connect to SignalR hub
 * 3. Cả 2 join cùng một conversation group
 * 4. User1 gửi message → User2 phải nhận được qua SignalR (realtime)
 * 5. User2 gửi message → User1 phải nhận được qua SignalR (realtime)
 * 
 * Run: npx tsx src/test/e2e/signalr-realtime.test.ts
 */

import * as signalR from '@microsoft/signalr';

// ============ CONFIG ============
const AUTH_API_URL = 'https://vega-identity-api-dev.allianceitsc.com';
const CHAT_API_URL = 'https://vega-chat-api-dev.allianceitsc.com';
const SIGNALR_HUB_URL = `${CHAT_API_URL}/hubs/chat`;

const USER1_CREDENTIALS = {
  email: 'user@quoc-nam.com',
  password: 'User@123',
};

const USER2_CREDENTIALS = {
  email: 'admin@quoc-nam.com',
  password: 'Admin@123',
};

// ============ TYPES ============
interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    fullName: string;
  };
}

interface Conversation {
  id: string;
  name: string;
  type: string;
}

interface ChatMessage {
  id: string;
  conversationId: string;
  content: string;
  senderId: string;
  senderName: string;
  createdAt: string;
}

// ============ HELPERS ============
async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${AUTH_API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: email, password }),
  });

  if (!response.ok) {
    throw new Error(`Login failed: ${response.status} ${await response.text()}`);
  }

  return response.json();
}

async function getConversations(accessToken: string): Promise<Conversation[]> {
  const response = await fetch(`${CHAT_API_URL}/api/conversations`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Get conversations failed: ${response.status}`);
  }

  const data = await response.json();
  return data.items || data;
}

async function sendMessage(
  accessToken: string,
  conversationId: string,
  content: string
): Promise<ChatMessage> {
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

function createSignalRConnection(accessToken: string): signalR.HubConnection {
  return new signalR.HubConnectionBuilder()
    .withUrl(SIGNALR_HUB_URL, {
      accessTokenFactory: () => accessToken,
    })
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Information)
    .build();
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============ TEST ============
async function runSignalRRealtimeTest() {
  console.log('🚀 Starting SignalR Realtime E2E Test\n');
  console.log('Hub URL:', SIGNALR_HUB_URL);
  console.log('');

  let user1Connection: signalR.HubConnection | null = null;
  let user2Connection: signalR.HubConnection | null = null;

  try {
    // ===== STEP 1: Login both users =====
    console.log('📝 Step 1: Login both users...');
    
    const [user1Auth, user2Auth] = await Promise.all([
      login(USER1_CREDENTIALS.email, USER1_CREDENTIALS.password),
      login(USER2_CREDENTIALS.email, USER2_CREDENTIALS.password),
    ]);

    console.log(`   ✅ User1 logged in: ${user1Auth.user.fullName} (${user1Auth.user.id})`);
    console.log(`   ✅ User2 logged in: ${user2Auth.user.fullName} (${user2Auth.user.id})`);
    console.log('');

    // ===== STEP 2: Get a shared conversation =====
    console.log('📝 Step 2: Find shared conversation...');
    
    const [user1Convos, user2Convos] = await Promise.all([
      getConversations(user1Auth.accessToken),
      getConversations(user2Auth.accessToken),
    ]);

    // Find a conversation that both users are in
    const user1ConvoIds = new Set(user1Convos.map((c) => c.id));
    const sharedConvo = user2Convos.find((c) => user1ConvoIds.has(c.id));

    if (!sharedConvo) {
      // Use first conversation from each user if no shared one
      console.log('   ⚠️ No shared conversation found, using first available');
      const testConvo = user1Convos[0] || user2Convos[0];
      if (!testConvo) {
        throw new Error('No conversations available for testing');
      }
    }

    const conversationId = sharedConvo?.id || user1Convos[0]?.id;
    console.log(`   ✅ Using conversation: ${conversationId}`);
    console.log('');

    // ===== STEP 3: Create SignalR connections =====
    console.log('📝 Step 3: Create SignalR connections...');
    
    user1Connection = createSignalRConnection(user1Auth.accessToken);
    user2Connection = createSignalRConnection(user2Auth.accessToken);

    // Track received messages
    const user1ReceivedMessages: ChatMessage[] = [];
    const user2ReceivedMessages: ChatMessage[] = [];

    // Listen for all possible event names (including lowercase versions from backend)
    const eventNames = [
      'ReceiveMessage', 'NewMessage', 'MessageReceived', 'OnMessage',
      'messagesent', 'MessageSent', 'messageSent',  // Backend uses 'messagesent'
      'receivemessage', 'newmessage',
    ];
    
    eventNames.forEach((eventName) => {
      user1Connection!.on(eventName, (message: ChatMessage) => {
        console.log(`   📨 User1 received [${eventName}]:`, JSON.stringify(message).substring(0, 100));
        user1ReceivedMessages.push(message);
      });

      user2Connection!.on(eventName, (message: ChatMessage) => {
        console.log(`   📨 User2 received [${eventName}]:`, JSON.stringify(message).substring(0, 100));
        user2ReceivedMessages.push(message);
      });
    });

    // Also log any invocation
    user1Connection.on('*', (...args: unknown[]) => {
      console.log('   📨 User1 received (any):', args);
    });
    user2Connection.on('*', (...args: unknown[]) => {
      console.log('   📨 User2 received (any):', args);
    });

    console.log('   ✅ Event listeners registered');
    console.log('');

    // ===== STEP 4: Connect to SignalR =====
    console.log('📝 Step 4: Connect to SignalR hub...');
    
    try {
      await Promise.all([
        user1Connection.start(),
        user2Connection.start(),
      ]);
      console.log(`   ✅ User1 connected: ${user1Connection.state}`);
      console.log(`   ✅ User2 connected: ${user2Connection.state}`);
    } catch (error) {
      console.error('   ❌ SignalR connection failed:', error);
      throw error;
    }
    console.log('');

    // ===== STEP 5: Join conversation group =====
    console.log('📝 Step 5: Join conversation group...');
    
    try {
      // Try different method names for joining group
      const joinMethods = ['JoinGroup', 'JoinConversation', 'Subscribe'];
      
      for (const method of joinMethods) {
        try {
          await Promise.all([
            user1Connection.invoke(method, conversationId),
            user2Connection.invoke(method, conversationId),
          ]);
          console.log(`   ✅ Both users joined group using: ${method}`);
          break;
        } catch (e) {
          console.log(`   ⚠️ Method "${method}" not found, trying next...`);
        }
      }
    } catch (error) {
      console.log('   ⚠️ Could not join group (may not be required):', error);
    }
    console.log('');

    // ===== STEP 6: User1 sends message =====
    console.log('📝 Step 6: User1 sends message...');
    
    const testMessage1 = `[E2E SignalR Test] From User1 at ${new Date().toISOString()}`;
    const sentMessage1 = await sendMessage(user1Auth.accessToken, conversationId, testMessage1);
    console.log(`   ✅ Message sent: "${testMessage1.substring(0, 40)}..."`);
    console.log(`   📤 Message ID: ${sentMessage1.id}`);
    console.log('');

    // Wait for SignalR to deliver
    console.log('   ⏳ Waiting 3 seconds for SignalR delivery...');
    await wait(3000);

    // ===== STEP 7: Check if User2 received the message =====
    console.log('📝 Step 7: Verify User2 received message via SignalR...');
    
    // Backend sends { message: ChatMessage } so we need to extract properly
    const user2ReceivedFromUser1 = user2ReceivedMessages.find((m) => {
      const msg = 'message' in m ? (m as { message: ChatMessage }).message : m;
      return msg.id === sentMessage1.id || msg.content === testMessage1;
    });

    if (user2ReceivedFromUser1) {
      console.log('   ✅ SUCCESS: User2 received message via SignalR!');
      const msg = 'message' in user2ReceivedFromUser1 
        ? (user2ReceivedFromUser1 as { message: ChatMessage }).message 
        : user2ReceivedFromUser1;
      console.log(`   📨 Received: "${msg.content?.substring(0, 40)}..."`);
    } else {
      console.log('   ❌ FAILED: User2 did NOT receive message via SignalR');
      console.log(`   📊 Total messages User2 received: ${user2ReceivedMessages.length}`);
      if (user2ReceivedMessages.length > 0) {
        console.log('   📊 Messages received:', user2ReceivedMessages.map((m) => JSON.stringify(m)));
      }
    }
    console.log('');

    // ===== STEP 8: User2 sends message back =====
    console.log('📝 Step 8: User2 sends message back...');
    
    const testMessage2 = `[E2E SignalR Test] From User2 at ${new Date().toISOString()}`;
    const sentMessage2 = await sendMessage(user2Auth.accessToken, conversationId, testMessage2);
    console.log(`   ✅ Message sent: "${testMessage2.substring(0, 40)}..."`);
    console.log('');

    // Wait for SignalR to deliver
    console.log('   ⏳ Waiting 3 seconds for SignalR delivery...');
    await wait(3000);

    // ===== STEP 9: Check if User1 received the message =====
    console.log('📝 Step 9: Verify User1 received message via SignalR...');
    
    // Backend sends { message: ChatMessage } so we need to extract properly
    const user1ReceivedFromUser2 = user1ReceivedMessages.find((m) => {
      const msg = 'message' in m ? (m as { message: ChatMessage }).message : m;
      return msg.id === sentMessage2.id || msg.content === testMessage2;
    });

    if (user1ReceivedFromUser2) {
      console.log('   ✅ SUCCESS: User1 received message via SignalR!');
      const msg = 'message' in user1ReceivedFromUser2 
        ? (user1ReceivedFromUser2 as { message: ChatMessage }).message 
        : user1ReceivedFromUser2;
      console.log(`   📨 Received: "${msg.content?.substring(0, 40)}..."`);
    } else {
      console.log('   ❌ FAILED: User1 did NOT receive message via SignalR');
      console.log(`   📊 Total messages User1 received: ${user1ReceivedMessages.length}`);
    }
    console.log('');

    // ===== FINAL SUMMARY =====
    console.log('═══════════════════════════════════════════════════');
    console.log('📊 TEST SUMMARY');
    console.log('═══════════════════════════════════════════════════');
    console.log(`   SignalR Hub URL: ${SIGNALR_HUB_URL}`);
    console.log(`   User1 Connection State: ${user1Connection.state}`);
    console.log(`   User2 Connection State: ${user2Connection.state}`);
    console.log(`   User1 → User2 Realtime: ${user2ReceivedFromUser1 ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   User2 → User1 Realtime: ${user1ReceivedFromUser2 ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Total User1 received: ${user1ReceivedMessages.length}`);
    console.log(`   Total User2 received: ${user2ReceivedMessages.length}`);
    console.log('═══════════════════════════════════════════════════');

    const allPassed = user2ReceivedFromUser1 && user1ReceivedFromUser2;
    if (allPassed) {
      console.log('\n🎉 ALL TESTS PASSED! SignalR realtime is working!\n');
    } else {
      console.log('\n⚠️ SOME TESTS FAILED. SignalR realtime may not be working properly.\n');
      console.log('Possible issues:');
      console.log('1. SignalR hub may not broadcast to group members');
      console.log('2. Event name mismatch (check backend for correct event names)');
      console.log('3. Users may not be in the same SignalR group');
      console.log('4. Backend may only send to specific connections, not groups');
    }

  } catch (error) {
    console.error('\n❌ Test failed with error:', error);
    throw error;
  } finally {
    // Cleanup
    console.log('\n🧹 Cleaning up connections...');
    if (user1Connection) {
      await user1Connection.stop().catch(() => {});
    }
    if (user2Connection) {
      await user2Connection.stop().catch(() => {});
    }
    console.log('   ✅ Connections closed\n');
  }
}

// Run test
runSignalRRealtimeTest()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
