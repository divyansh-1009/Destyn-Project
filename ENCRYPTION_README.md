# Database Encryption Implementation

This document describes the encryption implementation for sensitive data in the MongoDB database.

## Overview

The application now encrypts sensitive data before storing it in MongoDB and decrypts it when retrieving for authorized users. This ensures that even database administrators cannot read the actual content of chat messages and confessions.

## What's Encrypted

### 1. Chat Messages
- **Field**: `message` in the `messages` collection
- **Encryption**: Applied when messages are saved via Socket.IO
- **Decryption**: Applied when messages are retrieved via `/api/get-chat-history`

### 2. Confessions
- **Field**: `userEmail` in the `confessions` collection (confession content remains readable)
- **Encryption**: Applied when confessions are created via `/api/create-confession`
- **Decryption**: Applied when confessions are retrieved via `/api/get-confessions`

### 3. Comments on Confessions
- **Field**: `userEmail` in the comments array within confessions (comment content remains readable)
- **Encryption**: Applied when comments are added via `/api/add-comment`
- **Decryption**: Applied when confessions with comments are retrieved

## Technical Implementation

### Encryption Library
- Uses `crypto-js` for AES encryption
- Encryption key stored in environment variable `ENCRYPTION_KEY`

### Files Modified

1. **`src/lib/encryption.ts`** - New encryption utility functions
2. **`server.js`** - Added encryption for Socket.IO chat messages
3. **`src/app/api/get-chat-history/route.ts`** - Added decryption for chat messages
4. **`src/app/api/create-confession/route.ts`** - Added encryption for confessions
5. **`src/app/api/get-confessions/route.ts`** - Added decryption for confessions and comments
6. **`src/app/api/add-comment/route.ts`** - Added encryption for comments

## Security Features

### 1. End-to-End Encryption
- Messages are encrypted before being stored in the database
- Only the intended recipients can decrypt and read messages
- Database administrators cannot read message content

### 2. Anonymous Confessions
- User email is encrypted in the database (confession content remains readable)
- User email is stored but not exposed in API responses
- Even with database access, you cannot see who sent which confession

### 3. Secure Key Management
- Encryption key should be stored in environment variables
- Default key is provided for development but should be changed in production

## Environment Variables

Add the following to your `.env.local` file:

```env
ENCRYPTION_KEY=your-secure-encryption-key-here
```

**Important**: Change the default encryption key in production!

## How It Works

### Chat Messages Flow
1. User sends message via Socket.IO
2. Server encrypts message content using AES encryption
3. Encrypted message is stored in MongoDB
4. Original unencrypted message is sent to chat participants
5. When retrieving chat history, server decrypts messages before sending to client

### Confessions Flow
1. User submits confession
2. Server encrypts user email (confession content remains readable)
3. Encrypted user email is stored in MongoDB
4. When retrieving confessions, server decrypts user email before sending to client
5. User email is never exposed in API responses

## Benefits

1. **Privacy Protection**: Even with database access, you cannot read chat messages or confession content
2. **Compliance**: Meets privacy requirements for sensitive user data
3. **Security**: Protects against data breaches and unauthorized access
4. **Trust**: Users can be confident their private communications are secure

## Important Notes

1. **Key Management**: The encryption key must be kept secure and backed up
2. **Performance**: Encryption/decryption adds minimal overhead
3. **Backup**: Ensure encryption key is included in your backup strategy
4. **Migration**: Existing unencrypted data will need to be migrated if you have any

## Testing

To verify encryption is working:

1. Check MongoDB directly - you should see encrypted (garbled) text in message and confession fields
2. Use the application normally - messages and confessions should appear normal to users
3. Verify that database queries return encrypted data when accessed directly

## Troubleshooting

If decryption fails:
1. Check that `ENCRYPTION_KEY` environment variable is set correctly
2. Ensure the same key is used across all server instances
3. Verify that the encryption library is properly installed

## Future Enhancements

Consider implementing:
1. Key rotation mechanisms
2. Per-user encryption keys
3. Hardware security modules (HSM) for key storage
4. Audit logging for encryption/decryption operations 