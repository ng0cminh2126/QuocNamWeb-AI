/**
 * E2E Test: Two Users Chat
 * 
 * Test scenario:
 * 1. User1 logs in and sends a message to a group
 * 2. User2 logs in and verifies they can see the message
 * 3. User2 replies
 * 4. User1 verifies they can see the reply
 */

const AUTH_API = 'https://vega-identity-api-dev.allianceitsc.com';
const CHAT_API = 'https://vega-chat-api-dev.allianceitsc.com';

// Test users
const USER1 = {
  email: 'user@quoc-nam.com',
  password: 'User@123',
  name: 'User1',
};

const USER2 = {
  email: 'admin@quoc-nam.com',
  password: 'Admin@123',
  name: 'Admin',
};

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    identifier: string;
  };
}

interface MessageDto {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  contentType: string;
  sentAt: string;
}

interface MessageListResponse {
  items: MessageDto[];
  nextCursor: string | null;
  hasMore: boolean;
}

interface GroupDto {
  id: string;
  name: string;
  type: string;
}

interface GroupListResponse {
  items: GroupDto[];
  hasMore: boolean;
}

// Helper functions
async function login(email: string, password: string): Promise<{ token: string; userId: string }> {
  const response = await fetch(`${AUTH_API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: email, password }),
  });

  if (!response.ok) {
    throw new Error(`Login failed for ${email}: ${response.status}`);
  }

  const data: LoginResponse = await response.json();
  return { token: data.accessToken, userId: data.user.id };
}

async function getGroups(token: string): Promise<GroupDto[]> {
  const response = await fetch(`${CHAT_API}/api/groups`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Get groups failed: ${response.status}`);
  }

  const data: GroupListResponse = await response.json();
  return data.items;
}

async function getMessages(token: string, conversationId: string): Promise<MessageDto[]> {
  const response = await fetch(`${CHAT_API}/api/conversations/${conversationId}/messages?limit=50`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Get messages failed: ${response.status}`);
  }

  const data: MessageListResponse = await response.json();
  return data.items;
}

async function sendMessage(token: string, conversationId: string, content: string): Promise<MessageDto> {
  const response = await fetch(`${CHAT_API}/api/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      conversationId,
      content,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Send message failed: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Main E2E Test
async function runE2ETest(): Promise<void> {
  console.log('============================================================');
  console.log('🧪 E2E TEST: Two Users Chat');
  console.log('============================================================');
  console.log(`Auth API: ${AUTH_API}`);
  console.log(`Chat API: ${CHAT_API}`);
  console.log('');

  let testPassed = true;
  const testId = Date.now();
  const user1Message = `[E2E-${testId}] Hello from User1!`;
  const user2Reply = `[E2E-${testId}] Reply from Admin!`;

  try {
    // ========================================
    // STEP 1: Both users login
    // ========================================
    console.log('📝 STEP 1: Login both users');
    console.log('------------------------------------------------------------');

    console.log(`   Logging in ${USER1.name} (${USER1.email})...`);
    const user1Auth = await login(USER1.email, USER1.password);
    console.log(`   ✅ ${USER1.name} logged in! UserId: ${user1Auth.userId.substring(0, 8)}...`);

    console.log(`   Logging in ${USER2.name} (${USER2.email})...`);
    const user2Auth = await login(USER2.email, USER2.password);
    console.log(`   ✅ ${USER2.name} logged in! UserId: ${user2Auth.userId.substring(0, 8)}...`);

    // ========================================
    // STEP 2: Find a common group
    // ========================================
    console.log('\n📁 STEP 2: Find common group');
    console.log('------------------------------------------------------------');

    const user1Groups = await getGroups(user1Auth.token);
    const user2Groups = await getGroups(user2Auth.token);

    console.log(`   ${USER1.name} has ${user1Groups.length} groups`);
    console.log(`   ${USER2.name} has ${user2Groups.length} groups`);

    // Find common group
    const user2GroupIds = new Set(user2Groups.map(g => g.id));
    const commonGroup = user1Groups.find(g => user2GroupIds.has(g.id));

    if (!commonGroup) {
      throw new Error('No common group found between users! Cannot proceed with E2E test.');
    }

    console.log(`   ✅ Common group found: "${commonGroup.name}" (${commonGroup.id.substring(0, 8)}...)`);

    // ========================================
    // STEP 3: User1 sends a message
    // ========================================
    console.log('\n✉️ STEP 3: User1 sends a message');
    console.log('------------------------------------------------------------');

    console.log(`   Sending: "${user1Message}"`);
    const sentMessage = await sendMessage(user1Auth.token, commonGroup.id, user1Message);
    console.log(`   ✅ Message sent! ID: ${sentMessage.id.substring(0, 8)}...`);

    // Small delay to ensure message is propagated
    await delay(500);

    // ========================================
    // STEP 4: User2 verifies they can see the message
    // ========================================
    console.log('\n👀 STEP 4: User2 verifies the message');
    console.log('------------------------------------------------------------');

    const user2Messages = await getMessages(user2Auth.token, commonGroup.id);
    const foundMessage = user2Messages.find(m => m.id === sentMessage.id);

    if (!foundMessage) {
      console.log(`   ❌ FAIL: User2 cannot see the message from User1!`);
      console.log(`   Messages visible to User2: ${user2Messages.length}`);
      testPassed = false;
    } else {
      console.log(`   ✅ User2 can see the message!`);
      console.log(`   Content: "${foundMessage.content}"`);
      console.log(`   Sender: ${foundMessage.senderName}`);
    }

    // ========================================
    // STEP 5: User2 replies
    // ========================================
    console.log('\n💬 STEP 5: User2 replies');
    console.log('------------------------------------------------------------');

    console.log(`   Sending reply: "${user2Reply}"`);
    const replyMessage = await sendMessage(user2Auth.token, commonGroup.id, user2Reply);
    console.log(`   ✅ Reply sent! ID: ${replyMessage.id.substring(0, 8)}...`);

    // Small delay
    await delay(500);

    // ========================================
    // STEP 6: User1 verifies they can see the reply
    // ========================================
    console.log('\n👀 STEP 6: User1 verifies the reply');
    console.log('------------------------------------------------------------');

    const user1Messages = await getMessages(user1Auth.token, commonGroup.id);
    const foundReply = user1Messages.find(m => m.id === replyMessage.id);

    if (!foundReply) {
      console.log(`   ❌ FAIL: User1 cannot see the reply from User2!`);
      console.log(`   Messages visible to User1: ${user1Messages.length}`);
      testPassed = false;
    } else {
      console.log(`   ✅ User1 can see the reply!`);
      console.log(`   Content: "${foundReply.content}"`);
      console.log(`   Sender: ${foundReply.senderName}`);
    }

    // ========================================
    // STEP 7: Verify conversation history
    // ========================================
    console.log('\n📋 STEP 7: Verify conversation history');
    console.log('------------------------------------------------------------');

    // Both users should see both messages
    const user1HasBoth = user1Messages.some(m => m.id === sentMessage.id) && 
                         user1Messages.some(m => m.id === replyMessage.id);
    const user2HasBoth = user2Messages.some(m => m.content === user1Message) && 
                         user1Messages.some(m => m.id === replyMessage.id);

    if (user1HasBoth) {
      console.log(`   ✅ User1 can see both messages in history`);
    } else {
      console.log(`   ❌ User1 is missing some messages`);
      testPassed = false;
    }

    // Refresh User2's view
    const user2MessagesRefresh = await getMessages(user2Auth.token, commonGroup.id);
    const user2HasBothRefresh = user2MessagesRefresh.some(m => m.id === sentMessage.id) && 
                                user2MessagesRefresh.some(m => m.id === replyMessage.id);

    if (user2HasBothRefresh) {
      console.log(`   ✅ User2 can see both messages in history`);
    } else {
      console.log(`   ❌ User2 is missing some messages`);
      testPassed = false;
    }

    // Print recent messages
    console.log('\n   Recent messages in group:');
    const recentMessages = user1Messages.slice(0, 5);
    recentMessages.forEach((m, i) => {
      const isTestMsg = m.content.includes(`E2E-${testId}`);
      const marker = isTestMsg ? '🆕' : '  ';
      console.log(`   ${marker} [${i + 1}] ${m.senderName}: "${m.content.substring(0, 50)}..."`);
    });

  } catch (error) {
    console.log('\n❌ TEST ERROR:', error);
    testPassed = false;
  }

  // ========================================
  // FINAL RESULT
  // ========================================
  console.log('\n============================================================');
  if (testPassed) {
    console.log('🎉 E2E TEST PASSED: Both users can chat successfully!');
  } else {
    console.log('❌ E2E TEST FAILED: Check the errors above.');
  }
  console.log('============================================================');

  process.exit(testPassed ? 0 : 1);
}

// Run the test
runE2ETest().catch(console.error);
