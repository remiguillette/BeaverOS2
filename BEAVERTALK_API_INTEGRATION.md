# BeaverTalk API Integration Guide

## Overview

BeaverTalk is a secure communication system that allows external client sites to integrate real-time chat support with the BEAVERNET platform. This guide provides complete API documentation and integration examples for connecting your client site (like rgra.ca) to the BeaverTalk system.

## Base URL

```
https://your-beavernet-domain.com/api/chat
```

## Authentication

All API requests require HTTP Basic Authentication using the following headers:

```http
Authorization: Basic <base64(username:password)>
Content-Type: application/json
```

Default credentials:
- Username: `remiguillette`
- Password: `MC44rg99qc@`

## Security Features

BeaverTalk includes comprehensive security measures:
- **Content Filtering**: Automatic scanning for malicious content and code injection
- **Security Scoring**: Real-time threat assessment (0-100 scale)
- **Audit Logging**: Complete conversation and security event tracking
- **Session Management**: Secure session handling with unique identifiers

## API Endpoints

### 1. Create Chat Session

**POST** `/api/chat/sessions`

Creates a new chat session for support communication.

**Request Body:**
```json
{
  "sessionId": "session_1234567890_abcdef",
  "userId": "user_123",
  "userName": "John Doe",
  "userEmail": "john@rgra.ca",
  "userDepartment": "IT Support",
  "category": "technical",
  "priority": "normal",
  "clientSite": "rgra.ca",
  "referrerUrl": "https://rgra.ca/support"
}
```

**Parameters:**
- `sessionId` (required): Unique session identifier (generate using timestamp + random string)
- `userId` (required): Your internal user ID
- `userName` (required): User's display name
- `userEmail` (optional): User's email address
- `userDepartment` (optional): User's department or role
- `category` (required): One of: `general`, `technical`, `emergency`, `feedback`
- `priority` (required): One of: `low`, `normal`, `high`, `urgent`
- `clientSite` (optional): Your domain name for identification
- `referrerUrl` (optional): Page where chat was initiated

**Response:**
```json
{
  "id": 1,
  "sessionId": "session_1234567890_abcdef",
  "userId": "user_123",
  "userName": "John Doe",
  "userEmail": "john@rgra.ca",
  "userDepartment": "IT Support",
  "category": "technical",
  "priority": "normal",
  "status": "active",
  "clientSite": "rgra.ca",
  "referrerUrl": "https://rgra.ca/support",
  "createdAt": "2025-01-08T04:00:00.000Z",
  "updatedAt": "2025-01-08T04:00:00.000Z"
}
```

### 2. Send Message

**POST** `/api/chat/messages`

Sends a message in an active chat session.

**Request Body:**
```json
{
  "sessionId": "session_1234567890_abcdef",
  "senderId": "user_123",
  "senderName": "John Doe",
  "senderType": "user",
  "messageContent": "I need help with login issues",
  "messageType": "text"
}
```

**Parameters:**
- `sessionId` (required): Session ID from created session
- `senderId` (required): Your internal user ID
- `senderName` (required): Sender's display name
- `senderType` (required): Always use `"user"` for client messages
- `messageContent` (required): Message text (max 2000 characters)
- `messageType` (required): Always use `"text"` for standard messages

**Response:**
```json
{
  "id": 1,
  "sessionId": "session_1234567890_abcdef",
  "senderId": "user_123",
  "senderName": "John Doe",
  "senderType": "user",
  "messageContent": "I need help with login issues",
  "messageType": "text",
  "isSecure": true,
  "securityScore": 95,
  "filteredContent": null,
  "threatLevel": "none",
  "createdAt": "2025-01-08T04:00:00.000Z"
}
```

### 3. Get Messages

**GET** `/api/chat/messages/:sessionId`

Retrieves all messages for a specific chat session.

**Response:**
```json
[
  {
    "id": 1,
    "sessionId": "session_1234567890_abcdef",
    "senderId": "user_123",
    "senderName": "John Doe",
    "senderType": "user",
    "messageContent": "I need help with login issues",
    "messageType": "text",
    "isSecure": true,
    "securityScore": 95,
    "createdAt": "2025-01-08T04:00:00.000Z"
  },
  {
    "id": 2,
    "sessionId": "session_1234567890_abcdef",
    "senderId": "support_agent_1",
    "senderName": "Support Agent",
    "senderType": "agent",
    "messageContent": "I'd be happy to help you with login issues. Can you describe what error you're seeing?",
    "messageType": "text",
    "isSecure": true,
    "securityScore": 100,
    "createdAt": "2025-01-08T04:01:00.000Z"
  }
]
```

### 4. Update Session Status

**PATCH** `/api/chat/sessions/:sessionId/status`

Updates the status of a chat session.

**Request Body:**
```json
{
  "status": "closed"
}
```

**Status Options:**
- `active`: Session is ongoing
- `waiting`: Waiting for agent response
- `closed`: Session completed
- `abandoned`: User left without completion

### 5. Get Session Details

**GET** `/api/chat/sessions/:sessionId`

Retrieves details for a specific chat session.

## Security Event Monitoring

### Get Security Logs

**GET** `/api/chat/security-logs/:sessionId`

Retrieves security events and threat assessments for a session.

**Response:**
```json
[
  {
    "id": 1,
    "sessionId": "session_1234567890_abcdef",
    "eventType": "content_filter",
    "severity": "low",
    "description": "Message scanned for malicious content",
    "messageId": 1,
    "securityScore": 95,
    "actionTaken": "allowed",
    "createdAt": "2025-01-08T04:00:00.000Z"
  }
]
```

## JavaScript Integration Example

Here's a complete example for integrating BeaverTalk into your client site:

```html
<!DOCTYPE html>
<html>
<head>
    <title>BeaverTalk Integration Example</title>
    <style>
        /* Chat bubble styles */
        .chat-bubble {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            background: #F59E0B;
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }

        .chat-window {
            position: fixed;
            bottom: 90px;
            right: 20px;
            width: 350px;
            height: 500px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.3);
            display: none;
            flex-direction: column;
            z-index: 1001;
        }

        .chat-header {
            background: #F59E0B;
            color: white;
            padding: 15px;
            border-radius: 10px 10px 0 0;
            font-weight: bold;
        }

        .chat-messages {
            flex: 1;
            padding: 15px;
            overflow-y: auto;
            background: #f8f9fa;
        }

        .message {
            margin-bottom: 10px;
            padding: 8px 12px;
            border-radius: 18px;
            max-width: 80%;
        }

        .message.user {
            background: #F59E0B;
            color: white;
            margin-left: auto;
        }

        .message.agent {
            background: white;
            color: #333;
            border: 1px solid #ddd;
        }

        .chat-input {
            padding: 15px;
            border-top: 1px solid #ddd;
            display: flex;
            gap: 10px;
        }

        .chat-input input {
            flex: 1;
            padding: 8px 12px;
            border: 1px solid #ddd;
            border-radius: 20px;
            outline: none;
        }

        .chat-input button {
            background: #F59E0B;
            color: white;
            border: none;
            padding: 8px 15px;
            border-radius: 20px;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <!-- Your website content -->
    <h1>Welcome to RGRA.ca</h1>
    <p>This is your website content...</p>

    <!-- BeaverTalk Chat Integration -->
    <div class="chat-bubble" onclick="toggleChat()">
        💬
    </div>

    <div class="chat-window" id="chatWindow">
        <div class="chat-header">
            BeaverTalk Support
            <span style="float: right; cursor: pointer;" onclick="toggleChat()">×</span>
        </div>
        <div class="chat-messages" id="chatMessages">
            <div class="message agent">
                Welcome! How can I help you today?
            </div>
        </div>
        <div class="chat-input">
            <input type="text" id="messageInput" placeholder="Type your message..." 
                   onkeypress="handleKeyPress(event)">
            <button onclick="sendMessage()">Send</button>
        </div>
    </div>

    <script>
        class BeaverTalkClient {
            constructor(config) {
                this.baseUrl = config.baseUrl;
                this.credentials = btoa(`${config.username}:${config.password}`);
                this.sessionId = null;
                this.userId = config.userId;
                this.userName = config.userName;
                this.userEmail = config.userEmail;
                this.pollInterval = null;
            }

            async createSession(category = 'general', priority = 'normal') {
                this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                
                const response = await fetch(`${this.baseUrl}/sessions`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Basic ${this.credentials}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        sessionId: this.sessionId,
                        userId: this.userId,
                        userName: this.userName,
                        userEmail: this.userEmail,
                        category: category,
                        priority: priority,
                        clientSite: window.location.hostname,
                        referrerUrl: window.location.href
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to create chat session');
                }

                // Start polling for new messages
                this.startPolling();
                return await response.json();
            }

            async sendMessage(content) {
                if (!this.sessionId) {
                    await this.createSession();
                }

                const response = await fetch(`${this.baseUrl}/messages`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Basic ${this.credentials}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        sessionId: this.sessionId,
                        senderId: this.userId,
                        senderName: this.userName,
                        senderType: 'user',
                        messageContent: content,
                        messageType: 'text'
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to send message');
                }

                return await response.json();
            }

            async getMessages() {
                if (!this.sessionId) return [];

                const response = await fetch(`${this.baseUrl}/messages/${this.sessionId}`, {
                    headers: {
                        'Authorization': `Basic ${this.credentials}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to get messages');
                }

                return await response.json();
            }

            startPolling() {
                this.pollInterval = setInterval(async () => {
                    try {
                        const messages = await this.getMessages();
                        this.updateChatDisplay(messages);
                    } catch (error) {
                        console.error('Error polling messages:', error);
                    }
                }, 2000); // Poll every 2 seconds
            }

            stopPolling() {
                if (this.pollInterval) {
                    clearInterval(this.pollInterval);
                    this.pollInterval = null;
                }
            }

            updateChatDisplay(messages) {
                const messagesContainer = document.getElementById('chatMessages');
                messagesContainer.innerHTML = '<div class="message agent">Welcome! How can I help you today?</div>';

                messages.forEach(message => {
                    const messageDiv = document.createElement('div');
                    messageDiv.className = `message ${message.senderType === 'user' ? 'user' : 'agent'}`;
                    messageDiv.textContent = message.messageContent;
                    
                    // Add security indicator if needed
                    if (message.securityScore < 70) {
                        const securityIndicator = document.createElement('span');
                        securityIndicator.textContent = ` (Security: ${message.securityScore}%)`;
                        securityIndicator.style.fontSize = '0.8em';
                        securityIndicator.style.opacity = '0.7';
                        messageDiv.appendChild(securityIndicator);
                    }
                    
                    messagesContainer.appendChild(messageDiv);
                });

                // Scroll to bottom
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }

            async closeSession() {
                if (!this.sessionId) return;

                await fetch(`${this.baseUrl}/sessions/${this.sessionId}/status`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Basic ${this.credentials}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ status: 'closed' })
                });

                this.stopPolling();
                this.sessionId = null;
            }
        }

        // Initialize BeaverTalk client
        const beaverTalk = new BeaverTalkClient({
            baseUrl: 'https://your-beavernet-domain.com/api/chat',
            username: 'remiguillette',
            password: 'MC44rg99qc@',
            userId: 'rgra_user_' + Math.random().toString(36).substr(2, 9),
            userName: 'RGRA User',
            userEmail: 'user@rgra.ca'
        });

        function toggleChat() {
            const chatWindow = document.getElementById('chatWindow');
            if (chatWindow.style.display === 'none' || chatWindow.style.display === '') {
                chatWindow.style.display = 'flex';
            } else {
                chatWindow.style.display = 'none';
                beaverTalk.closeSession();
            }
        }

        async function sendMessage() {
            const input = document.getElementById('messageInput');
            const message = input.value.trim();
            if (!message) return;

            try {
                await beaverTalk.sendMessage(message);
                input.value = '';
                
                // Add user message to display immediately
                const messagesContainer = document.getElementById('chatMessages');
                const messageDiv = document.createElement('div');
                messageDiv.className = 'message user';
                messageDiv.textContent = message;
                messagesContainer.appendChild(messageDiv);
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
                
            } catch (error) {
                console.error('Error sending message:', error);
                alert('Failed to send message. Please try again.');
            }
        }

        function handleKeyPress(event) {
            if (event.key === 'Enter') {
                sendMessage();
            }
        }

        // Cleanup on page unload
        window.addEventListener('beforeunload', () => {
            beaverTalk.closeSession();
        });
    </script>
</body>
</html>
```

## React Integration Example

For React applications, here's a more advanced integration:

```jsx
import React, { useState, useEffect, useCallback } from 'react';

class BeaverTalkAPI {
  constructor(config) {
    this.baseUrl = config.baseUrl;
    this.credentials = btoa(`${config.username}:${config.password}`);
    this.sessionId = null;
    this.userId = config.userId;
    this.userName = config.userName;
    this.userEmail = config.userEmail;
  }

  async createSession(category = 'general', priority = 'normal') {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const response = await fetch(`${this.baseUrl}/sessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${this.credentials}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sessionId: this.sessionId,
        userId: this.userId,
        userName: this.userName,
        userEmail: this.userEmail,
        category,
        priority,
        clientSite: window.location.hostname,
        referrerUrl: window.location.href
      })
    });

    if (!response.ok) throw new Error('Failed to create session');
    return await response.json();
  }

  async sendMessage(content) {
    if (!this.sessionId) await this.createSession();

    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${this.credentials}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sessionId: this.sessionId,
        senderId: this.userId,
        senderName: this.userName,
        senderType: 'user',
        messageContent: content,
        messageType: 'text'
      })
    });

    if (!response.ok) throw new Error('Failed to send message');
    return await response.json();
  }

  async getMessages() {
    if (!this.sessionId) return [];

    const response = await fetch(`${this.baseUrl}/messages/${this.sessionId}`, {
      headers: { 'Authorization': `Basic ${this.credentials}` }
    });

    if (!response.ok) throw new Error('Failed to get messages');
    return await response.json();
  }
}

export function BeaverTalkWidget({ config }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [api] = useState(() => new BeaverTalkAPI(config));

  const fetchMessages = useCallback(async () => {
    try {
      const newMessages = await api.getMessages();
      setMessages(newMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [api]);

  useEffect(() => {
    if (isOpen) {
      const interval = setInterval(fetchMessages, 2000);
      return () => clearInterval(interval);
    }
  }, [isOpen, fetchMessages]);

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    try {
      await api.sendMessage(inputValue);
      setInputValue('');
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 w-16 h-16 bg-orange-500 hover:bg-orange-600 
                   text-white rounded-full shadow-lg hover:shadow-xl transition-all
                   flex items-center justify-center z-50"
        >
          💬
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-white rounded-lg shadow-xl z-50 flex flex-col">
          <div className="bg-orange-500 text-white p-4 rounded-t-lg flex justify-between items-center">
            <h3 className="font-semibold">BeaverTalk Support</h3>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200">
              ×
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            <div className="mb-4 p-3 bg-white rounded-lg">
              Welcome! How can I help you today?
            </div>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-4 p-3 rounded-lg max-w-[80%] ${
                  message.senderType === 'user'
                    ? 'bg-orange-500 text-white ml-auto'
                    : 'bg-white text-gray-800'
                }`}
              >
                {message.messageContent}
                {message.securityScore < 70 && (
                  <div className="text-xs opacity-70 mt-1">
                    Security: {message.securityScore}%
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="p-4 border-t flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
            />
            <button
              onClick={sendMessage}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// Usage in your React app:
// <BeaverTalkWidget config={{
//   baseUrl: 'https://your-beavernet-domain.com/api/chat',
//   username: 'remiguillette',
//   password: 'MC44rg99qc@',
//   userId: 'rgra_user_123',
//   userName: 'John Doe',
//   userEmail: 'john@rgra.ca'
// }} />
```

## Error Handling

The API returns standard HTTP status codes:

- `200`: Success
- `400`: Bad Request (invalid parameters)
- `401`: Unauthorized (invalid credentials)
- `404`: Not Found (session doesn't exist)
- `429`: Rate Limited
- `500`: Internal Server Error

Example error response:
```json
{
  "error": "Invalid session ID",
  "message": "The specified session does not exist or has expired",
  "code": "SESSION_NOT_FOUND"
}
```

## Rate Limiting

- Maximum 100 requests per minute per IP address
- Maximum 10 new sessions per hour per user
- Message content limited to 2000 characters

## Security Considerations

1. **Always use HTTPS** in production
2. **Store credentials securely** - consider using environment variables
3. **Implement client-side validation** before sending messages
4. **Monitor security scores** - messages below 70% may contain threats
5. **Handle session timeouts** gracefully
6. **Sanitize user input** before display

## Testing

Use tools like Postman or curl to test the API:

```bash
# Create session
curl -X POST https://your-domain.com/api/chat/sessions \
  -H "Authorization: Basic cmVtaWd1aWxsZXR0ZTpNQzQ0cmc5OXFjQA==" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test_session_123",
    "userId": "test_user",
    "userName": "Test User",
    "category": "technical",
    "priority": "normal"
  }'

# Send message
curl -X POST https://your-domain.com/api/chat/messages \
  -H "Authorization: Basic cmVtaWd1aWxsZXR0ZTpNQzQ0cmc5OXFjQA==" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test_session_123",
    "senderId": "test_user",
    "senderName": "Test User",
    "senderType": "user",
    "messageContent": "Hello, I need help",
    "messageType": "text"
  }'
```

## Support

For technical support with BeaverTalk integration, contact the BEAVERNET support team or create a support ticket through the BeaverTalk system itself.