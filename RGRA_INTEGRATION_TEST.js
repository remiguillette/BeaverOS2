// BeaverTalk Integration Test for RGRA.ca
// This script demonstrates how to integrate BeaverTalk with your RGRA.ca website

// Configuration for production
const BEAVERTALK_CONFIG = {
  baseUrl: 'https://rgbeavernet.ca/api/chat',
  username: 'remiguillette',
  password: 'MC44rg99qc@'
};

// Create authentication header
const authHeader = btoa(`${BEAVERTALK_CONFIG.username}:${BEAVERTALK_CONFIG.password}`);

// Test the integration
async function testBeaverTalkIntegration() {
  console.log('🚀 Starting BeaverTalk integration test...');
  
  try {
    // 1. Health check
    console.log('📡 Checking API health...');
    const healthResponse = await fetch(`${BEAVERTALK_CONFIG.baseUrl}/health`, {
      headers: { 'Authorization': `Basic ${authHeader}` }
    });
    
    if (!healthResponse.ok) {
      throw new Error('Health check failed');
    }
    console.log('✅ API is healthy');
    
    // 2. Create a test session
    console.log('🔗 Creating chat session...');
    const sessionId = `rgra_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const sessionResponse = await fetch(`${BEAVERTALK_CONFIG.baseUrl}/sessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sessionId,
        userId: 1,
        userName: 'Test User from RGRA.ca',
        userDepartment: 'RGRA Website',
        category: 'general',
        priority: 'normal'
      })
    });
    
    if (!sessionResponse.ok) {
      throw new Error('Failed to create session');
    }
    
    const session = await sessionResponse.json();
    console.log('✅ Session created:', session.sessionId);
    
    // 3. Send test messages
    console.log('💬 Sending test messages...');
    
    const messages = [
      'Hello from RGRA.ca! This is a test message.',
      'Can you help me with information about the recent beaver conservation efforts?',
      'I would like to know more about the RGRA services.'
    ];
    
    for (let i = 0; i < messages.length; i++) {
      const messageResponse = await fetch(`${BEAVERTALK_CONFIG.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId,
          senderId: 1,
          senderName: 'Test User from RGRA.ca',
          senderType: 'user',
          messageContent: messages[i],
          messageType: 'text'
        })
      });
      
      if (!messageResponse.ok) {
        throw new Error(`Failed to send message ${i + 1}`);
      }
      
      console.log(`✅ Message ${i + 1} sent successfully`);
      
      // Wait a bit between messages
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('🎉 Integration test completed successfully!');
    console.log('👀 Check the BeaverTalk dashboard at https://rgbeavernet.ca/BeaverTalk');
    console.log(`📝 Session ID: ${sessionId}`);
    
  } catch (error) {
    console.error('❌ Integration test failed:', error.message);
    console.error('🔍 Please check:');
    console.error('   - Network connection');
    console.error('   - API credentials');
    console.error('   - Server status at https://rgbeavernet.ca');
  }
}

// For HTML integration on RGRA.ca
function createBeaverTalkWidget() {
  const widget = document.createElement('div');
  widget.id = 'beavertalk-widget';
  widget.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 300px;
    height: 400px;
    background: white;
    border: 1px solid #ccc;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    z-index: 1000;
    font-family: Arial, sans-serif;
  `;
  
  widget.innerHTML = `
    <div style="background: #f5f5f5; padding: 12px; border-bottom: 1px solid #ddd;">
      <h3 style="margin: 0; color: #333;">BeaverTalk Support</h3>
      <button id="close-widget" style="float: right; background: none; border: none; font-size: 18px; cursor: pointer;">×</button>
    </div>
    <div id="messages" style="height: 300px; overflow-y: auto; padding: 10px;">
      <p style="color: #666; font-size: 14px;">Welcome! How can we help you today?</p>
    </div>
    <div style="padding: 10px; border-top: 1px solid #ddd;">
      <input type="text" id="message-input" placeholder="Type your message..." style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
      <button id="send-message" style="width: 100%; margin-top: 8px; padding: 8px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Send</button>
    </div>
  `;
  
  document.body.appendChild(widget);
  
  // Initialize widget functionality
  let currentSessionId = null;
  
  // Create session when widget opens
  createChatSession('RGRA.ca Visitor', 'RGRA Website').then(session => {
    currentSessionId = session.sessionId;
  });
  
  // Send message functionality
  document.getElementById('send-message').addEventListener('click', async () => {
    const input = document.getElementById('message-input');
    const message = input.value.trim();
    
    if (message && currentSessionId) {
      try {
        await sendMessage(currentSessionId, 'RGRA.ca Visitor', message);
        
        // Add message to chat
        const messagesDiv = document.getElementById('messages');
        messagesDiv.innerHTML += `<p style="text-align: right; margin: 5px 0; padding: 5px; background: #e3f2fd; border-radius: 4px;">${message}</p>`;
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
        
        input.value = '';
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    }
  });
  
  // Close widget
  document.getElementById('close-widget').addEventListener('click', () => {
    widget.remove();
  });
  
  // Enter key to send
  document.getElementById('message-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      document.getElementById('send-message').click();
    }
  });
}

// Helper functions (same as in the integration guide)
async function createChatSession(userName, userDepartment = 'RGRA Website') {
  const sessionId = `rgra_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const response = await fetch(`${BEAVERTALK_CONFIG.baseUrl}/sessions`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${authHeader}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sessionId,
      userId: 1,
      userName,
      userDepartment,
      category: 'general',
      priority: 'normal'
    })
  });
  
  if (!response.ok) throw new Error('Failed to create session');
  return await response.json();
}

async function sendMessage(sessionId, senderName, messageContent) {
  const response = await fetch(`${BEAVERTALK_CONFIG.baseUrl}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${authHeader}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sessionId,
      senderId: 1,
      senderName,
      senderType: 'user',
      messageContent,
      messageType: 'text'
    })
  });
  
  if (!response.ok) throw new Error('Failed to send message');
  return await response.json();
}

// Export for use in browser or Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testBeaverTalkIntegration, createBeaverTalkWidget };
} else {
  // Browser environment - make functions available globally
  window.testBeaverTalkIntegration = testBeaverTalkIntegration;
  window.createBeaverTalkWidget = createBeaverTalkWidget;
}