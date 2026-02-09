# Konect Database MCP Server

An MCP (Model Context Protocol) server that provides database query capabilities for the Drivio application. This server allows you to query MongoDB collections using the same models and schemas used in the main application.

## Features

- Query any model in the Drivio application database
- Support for MongoDB query operators ($gt, $gte, $lt, $lte, $in, $ne, $regex, etc.)
- Field projection and sorting
- Pagination support
- Population of referenced documents
- Type-safe queries with model validation

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

### Step 1: Verify Build Success

After running `npm run build`, check that the build directory was created:

```bash
ls -la build/
```

You should see:
- `build/index.js`
- `build/loadModels.js`

### Step 2: Check Server Starts Correctly

Run the server and check for startup messages:

```bash
node build/index.js
```

You should see:
```
Konect Database MCP Server running on stdio
```

If you see MongoDB connection errors, check your `.env` file and ensure MongoDB is running.

**Note:** The server will wait for input on stdin. Press Ctrl+C to exit.

### Step 3: Test with MCP Client (Manual JSON-RPC)

You can test the server by sending JSON-RPC requests. Create a test script or use `echo`:

**List available tools:**
```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | node build/index.js
```

**Test a query:**
```bash
echo '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"query_database","arguments":{"model":"User","query":{"status":"active"},"limit":5}}}' | node build/index.js
```

### Step 4: Verify Database Connection

Before testing queries, ensure:
1. MongoDB is running
2. The connection string in `.env` is correct
3. The database contains data

Test MongoDB connection:
```bash
# If using default connection string
mongosh "mongodb://localhost:27017/starter_project"

# Or test with your connection string from .env
```

### Step 5: Test Query Tool

Once the server is running and connected, you can test queries. The server expects JSON-RPC 2.0 format messages on stdin.

**Example test query for active users:**
```bash
cat <<EOF | node build/index.js
{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"query_database","arguments":{"model":"User","query":{"status":"active"},"limit":3}}}
EOF
```

### Step 6: Using with MCP Clients (Claude Desktop, etc.)

To use with an MCP client like Claude Desktop:

1. Add the server to your MCP client configuration (usually in `~/.config/claude-desktop/mcp.json` or similar):

```json
{
  "mcpServers": {
    "konect-database": {
      "command": "node",
      "args": ["/absolute/path/to/KONECT_MCP_Server/build/index.js"],
      "env": {
        "MONGODB_CONNECTION_STRING": "mongodb://localhost:27017/starter_project"
      }
    }
  }
}
```

2. Restart your MCP client
3. The `query_database` tool should now be available

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
- Ensure `drivio-web-service/database/mongoose/models` directory exists
- Check that models are being loaded (look for "Models loaded successfully" in stderr)
- The server will still work even if models fail to load, but may have limited functionality

**Module Loading Error:**
- Models use CommonJS, which is loaded via `createRequire`
- If models fail to load, check the path in `loadModels.ts`
- Ensure `drivio-web-service` directory is at the correct relative path from `build/loadModels.js`

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
