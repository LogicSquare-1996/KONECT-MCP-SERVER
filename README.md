# Konect Database MCP Server

An MCP (Model Context Protocol) server that provides database query capabilities for the Drivio application. This server allows you to query MongoDB collections using the same models and schemas used in the main application.

## ✅ Current Status

**Fully Working:**
- ✅ All 19 models automatically loaded and registered
- ✅ MongoDB connection (local and Atlas)
- ✅ Database queries working correctly
- ✅ Model validation and error handling
- ✅ Tested and verified with real database queries

**Tested Models:**
All 19 models are successfully loaded: AddOn, ApiKey, BlockedDate, Booking, Calendar, Conversation, Document, Favorite, Keystore, Message, Notification, PaymentMethod, PayoutMethod, Review, Role, SupportRequest, Transaction, User, Vehicle

## Features

- ✅ **Automatic Model Loading**: Automatically loads all 19 Mongoose models from drivio-web-service
- ✅ **Real Database Queries**: Direct MongoDB connection with full query support
- ✅ **MongoDB Query Operators**: Support for $gt, $gte, $lt, $lte, $in, $ne, $regex, etc.
- ✅ **Field Projection**: Include/exclude specific fields in results
- ✅ **Sorting & Pagination**: Full support for sorting and pagination (skip/limit)
- ✅ **Population**: Populate referenced documents (e.g., guest, host, vehicle in bookings)
- ✅ **Type-Safe**: Validated model names and query parameters
- ✅ **Error Handling**: Comprehensive error handling with clear messages

## Available Models

The server supports querying the following models:

- **User** - User accounts and profiles
- **Vehicle** - Vehicle listings
- **Booking** - Rental bookings
- **Transaction** - Payment transactions
- **Review** - User and vehicle reviews
- **AddOn** - Additional services/features
- **Conversation** - User conversations
- **Message** - Chat messages
- **Document** - Uploaded documents
- **PaymentMethod** - Payment methods
- **PayoutMethod** - Payout methods
- **Notification** - User notifications
- **Favorite** - User favorites
- **SupportRequest** - Support tickets
- **Calendar** - Availability calendar
- **BlockedDate** - Blocked dates
- **Role** - User roles
- **Keystore** - Authentication keys
- **ApiKey** - API keys

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp env.example .env
# Edit .env and set your MONGODB_CONNECTION_STRING
```

3. Build the TypeScript code:
```bash
npm run build
```

## Usage

### Running the Server

```bash
npm start
```

Or run directly:
```bash
node build/index.js
```

The server runs on stdio and communicates via the Model Context Protocol.

## Testing the MCP Server

### Quick Test

After building, test the server with a simple query:

```bash
cd /home/mrinal/Desktop/Drivio-Application/KONECT_MCP_Server
MONGODB_CONNECTION_STRING="your-connection-string" NODE_ENV=development SALT_ROUNDS=10 \
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"query_database","arguments":{"model":"User","query":{},"limit":1}}}' | \
node build/index.js
```

You should see:
- `Connected to MongoDB`
- `Models loaded successfully`
- `Registered models: [ 'AddOn', 'ApiKey', 'BlockedDate', 'Booking', ... ]`
- A JSON response with query results

### Step 1: Verify Build Success

After running `npm run build`, check that the build directory was created:

```bash
ls -la build/
```

You should see:
- `build/index.js` (executable)
- `build/loadModels.js`

### Step 2: Test Server Startup

Run the server and check for startup messages:

```bash
MONGODB_CONNECTION_STRING="your-connection-string" NODE_ENV=development SALT_ROUNDS=10 \
node build/index.js
```

**Expected output:**
```
Connected to MongoDB
Models loaded successfully
Registered models: [
  'AddOn',        'ApiKey',
  'BlockedDate',  'Booking',
  'Calendar',     'Conversation',
  'Document',     'Favorite',
  'Keystore',     'Message',
  'Notification', 'PaymentMethod',
  'PayoutMethod', 'Review',
  'Role',         'SupportRequest',
  'Transaction',  'User',
  'Vehicle'
]
Konect Database MCP Server running on stdio
```

**Note:** The server will wait for input on stdin. Press Ctrl+C to exit.

### Step 3: Test Model Loading

Verify all 19 models are loaded:

```bash
MONGODB_CONNECTION_STRING="your-connection-string" NODE_ENV=development SALT_ROUNDS=10 \
node build/index.js 2>&1 | grep "Registered models"
```

You should see all 19 models listed.

### Step 4: Test Database Query

Test a simple query using JSON-RPC:

```bash
MONGODB_CONNECTION_STRING="your-connection-string" NODE_ENV=development SALT_ROUNDS=10 \
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"query_database","arguments":{"model":"User","query":{},"limit":1}}}' | \
node build/index.js 2>&1 | grep -A 20 '"success"'
```

**Expected:** JSON response with `"success": true` and query results.

### Step 5: Test Different Models

Test various models to ensure they all work:

```bash
# Test User model
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"query_database","arguments":{"model":"User","query":{"status":"active"},"limit":2}}}' | \
MONGODB_CONNECTION_STRING="your-connection-string" NODE_ENV=development SALT_ROUNDS=10 \
node build/index.js 2>&1 | tail -5

# Test Vehicle model
echo '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"query_database","arguments":{"model":"Vehicle","query":{"isActive":true},"limit":2}}}' | \
MONGODB_CONNECTION_STRING="your-connection-string" NODE_ENV=development SALT_ROUNDS=10 \
node build/index.js 2>&1 | tail -5
```

### Step 6: Test with Filters and Sorting

Test advanced query features:

```bash
# Test with filter and sort
echo '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"query_database","arguments":{"model":"User","query":{"status":"active"},"sort":{"createdAt":-1},"limit":3}}}' | \
MONGODB_CONNECTION_STRING="your-connection-string" NODE_ENV=development SALT_ROUNDS=10 \
node build/index.js 2>&1 | grep -A 10 '"success"'
```

### Step 7: Verify Database Connection

Before testing queries, ensure:
1. MongoDB is accessible (local or Atlas)
2. The connection string is correct
3. The database contains data

Test MongoDB connection manually:
```bash
# For MongoDB Atlas
mongosh "mongodb+srv://user:password@cluster.mongodb.net/database"

# For local MongoDB
mongosh "mongodb://localhost:27017/database"
```

### Step 8: Using with MCP Clients (Claude Desktop, etc.)

To use with an MCP client like Claude Desktop:

1. Add the server to your MCP client configuration (usually in `~/.config/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "konect-database": {
      "command": "/home/mrinal/.nvm/versions/node/v18.20.8/bin/node",
      "args": [
        "/home/mrinal/Desktop/Drivio-Application/KONECT_MCP_Server/build/index.js"
      ],
      "env": {
        "MONGODB_CONNECTION_STRING": "mongodb+srv://user:password@cluster.mongodb.net/database",
        "NODE_ENV": "development",
        "SALT_ROUNDS": "10"
      }
    }
  }
}
```

**Important:**
- Use the full path to Node.js (or ensure `node` is in PATH)
- Use absolute path to `build/index.js`
- Include `NODE_ENV` and `SALT_ROUNDS` for model loading
- Use your actual MongoDB connection string

2. Restart Claude Desktop completely
3. Verify the tool is available by asking: "List all available MCP tools"
4. The `query_database` tool should now be available

### Troubleshooting

**Build Errors:**
- Run `npm install` to ensure all dependencies are installed
- Check that TypeScript is installed: `npm list typescript`
- Verify Node.js version: `node --version` (should be >= 18.0.0)

**Runtime Errors:**

**MongoDB Connection Error:**
- Check that MongoDB is running: `mongosh --version` or `mongo --version`
- Verify the connection string in `.env`
- Test connection manually: `mongosh "your-connection-string"`

**Model Not Found Error:**
- Check that all 19 models are registered: Look for "Registered models:" in stderr output
- Ensure `drivio-web-service/database/mongoose/models` directory exists
- Verify `drivio-web-service/config.js` exists (models need it for saltRound)
- Check that `NODE_ENV` and `SALT_ROUNDS` environment variables are set

**Models Not Loading:**
- Models use CommonJS and require `config.js` from drivio-web-service
- Ensure `drivio-web-service` directory is at the correct relative path: `../../drivio-web-service` from `build/loadModels.js`
- Check that `keys/private.pem` and `keys/public.pem` exist in drivio-web-service (config.js reads them)
- Verify MongoDB connection is established before models load

### Tool: query_database

Query the database with MongoDB query syntax.

#### Parameters

- **model** (required): The model name to query (e.g., "User", "Vehicle", "Booking")
- **query** (required): MongoDB query object
- **projection** (optional): Fields to include/exclude
- **sort** (optional): Sort order
- **limit** (optional): Maximum number of results (default: 100, max: 1000)
- **skip** (optional): Number of documents to skip (for pagination)
- **populate** (optional): Array of field names to populate

#### Example Queries

**Query active users:**
```json
{
  "model": "User",
  "query": {
    "status": "active"
  },
  "limit": 10
}
```

**Query vehicles by category:**
```json
{
  "model": "Vehicle",
  "query": {
    "category": "SUV",
    "isActive": true,
    "status": "active"
  },
  "sort": {
    "createdAt": -1
  },
  "limit": 20
}
```

**Query bookings with date range:**
```json
{
  "model": "Booking",
  "query": {
    "startDate": {
      "$gte": "2024-01-01T00:00:00.000Z"
    },
    "status": "confirmed"
  },
  "populate": ["guest", "host", "vehicle"],
  "sort": {
    "startDate": 1
  }
}
```

**Query with field projection:**
```json
{
  "model": "User",
  "query": {
    "status": "active"
  },
  "projection": {
    "name": 1,
    "emails": 1,
    "status": 1
  },
  "limit": 50
}
```

**Query with MongoDB operators:**
```json
{
  "model": "Review",
  "query": {
    "rating": {
      "$gte": 4
    }
  },
  "sort": {
    "rating": -1,
    "createdAt": -1
  }
}
```

**Query with regex:**
```json
{
  "model": "Vehicle",
  "query": {
    "make": {
      "$regex": "Toyota",
      "$options": "i"
    }
  }
}
```

## Response Format

The server returns a JSON object with:

- **success**: Boolean indicating query success
- **model**: The model that was queried
- **query**: The query that was executed
- **count**: Number of results returned
- **totalCount**: Total number of matching documents
- **skip**: Number of documents skipped
- **limit**: Maximum number of results
- **hasMore**: Boolean indicating if there are more results
- **results**: Array of matching documents

## Error Handling

The server handles various error cases:

- Invalid model names
- MongoDB connection errors
- Invalid query syntax
- Database operation errors

All errors are returned in the MCP error format with appropriate error codes.

## Development

This server follows the same pattern as the weather MCP server, using the `@modelcontextprotocol/sdk` package for MCP protocol implementation.

## License

MIT
