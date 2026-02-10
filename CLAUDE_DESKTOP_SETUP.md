# Using Konect Database MCP Server with Claude Desktop

## ✅ Current Status

The MCP server is **fully functional** and tested:
- ✅ All 19 models automatically load on startup
- ✅ Works with MongoDB Atlas and local MongoDB
- ✅ Tested with real database queries
- ✅ Ready for use with Claude Desktop

## Setup Instructions

### Step 1: Locate Claude Desktop Configuration File

The configuration file location depends on your operating system:

**macOS:**
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Windows:**
```
%APPDATA%\Claude\claude_desktop_config.json
```

**Linux:**
```
~/.config/Claude/claude_desktop_config.json
```

### Step 2: Edit the Configuration File

Open the configuration file in a text editor. If it doesn't exist, create it.

Add or update the `mcpServers` section:

```json
{
  "mcpServers": {
    "konect-database": {
      "command": "/home/mrinal/.nvm/versions/node/v18.20.8/bin/node",
      "args": [
        "/home/mrinal/Desktop/Drivio-Application/KONECT_MCP_Server/build/index.js"
      ],
      "env": {
        "MONGODB_CONNECTION_STRING": "mongodb+srv://user:password@cluster.mongodb.net/database?retryWrites=true&w=majority",
        "NODE_ENV": "development",
        "SALT_ROUNDS": "10"
      }
    }
  }
}
```

**Important:**
- **command**: Use full path to Node.js (or ensure `node` is in your PATH)
- **args**: Use absolute path to `build/index.js`
- **MONGODB_CONNECTION_STRING**: Your actual MongoDB connection string (local or Atlas)
- **NODE_ENV**: Required for model loading (set to "development")
- **SALT_ROUNDS**: Required for model loading (set to "10")
- Use forward slashes (`/`) even on Windows for paths

**Example Configuration:**
```json
{
  "mcpServers": {
    "konect-database": {
      "command": "/home/mrinal/.nvm/versions/node/v18.20.8/bin/node",
      "args": [
        "/home/mrinal/Desktop/Drivio-Application/KONECT_MCP_Server/build/index.js"
      ],
      "env": {
        "MONGODB_CONNECTION_STRING": "mongodb+srv://sankar:teHOqFmpuHptO7us@cluster0.nnxgj.mongodb.net/drivio?retryWrites=true&w=majority&appName=Cluster0",
        "NODE_ENV": "development",
        "SALT_ROUNDS": "10"
      }
    }
  }
}
```

### Step 3: Restart Claude Desktop

Close and restart Claude Desktop completely for the changes to take effect.

### Step 4: Verify the Server is Connected

After restarting Claude Desktop, verify the server is working:

**1. Check if tool is available:**
Ask Claude: "List all available MCP tools"

You should see `query_database` in the list.

**2. Test with a simple query:**
Ask Claude: "Query the database for one user and show me the result"

**3. Verify models are loaded:**
Check Claude Desktop's console/logs. You should see:
- `Connected to MongoDB`
- `Models loaded successfully`
- `Registered models: [ 'AddOn', 'ApiKey', 'BlockedDate', ... ]` (all 19 models)

**4. Test successful query:**
Try: "Show me 3 active users from the database"

If you see actual data, the server is working correctly!

## Example Prompts to Use with Claude Desktop

### Basic Queries

**1. Get all active users:**
```
Query the database for all users with status "active". Show me the first 10 results with their names and email addresses.
```

**2. Find vehicles by category:**
```
Query the Vehicle model to find all SUVs that are active and approved. Show me the make, model, year, and location.
```

**3. Get recent bookings:**
```
Show me the last 5 confirmed bookings from the database. Include the guest name, vehicle details, and booking dates.
```

### Advanced Queries

**4. Find high-rated vehicles:**
```
Query the Vehicle model to find all vehicles with a rating of 4 or higher. Sort them by rating in descending order and show the top 10.
```

**5. Search for specific make/model:**
```
Find all Toyota vehicles in the database that are currently active. Show me their details including year, category, and location.
```

**6. Get bookings in date range:**
```
Query the Booking model to find all bookings that start after January 1, 2024 and are confirmed. Include the guest, host, vehicle, and dates.
```

**7. Find users by location:**
```
Query the User model to find all users in a specific city. Show me users in Paris with their contact information.
```

**8. Get transactions by type:**
```
Show me all payment transactions from the database that are completed. Include the user, amount, and transaction date.
```

**9. Find reviews with high ratings:**
```
Query the Review model to find all reviews with a rating of 5 stars. Show me the reviewer, reviewee, and comment.
```

**10. Get active conversations:**
```
Show me all conversations from the database that have been updated in the last 7 days. Include customer and host information.
```

### Complex Queries

**11. Find vehicles with specific features:**
```
Query the Vehicle model to find all vehicles that have "AC" and "GPS Navigation" in their features list. Show me the make, model, and all features.
```

**12. Get bookings with populated relationships:**
```
Query the Booking model and populate the guest, host, and vehicle fields. Show me bookings that are in progress with all related information.
```

**13. Search by multiple criteria:**
```
Find all active users who have verified emails and are not suspended. Show me their names, primary email, and status.
```

**14. Get vehicles by price range:**
```
Query vehicles that have a daily price between $50 and $200 in their purpose-based pricing. Show me the vehicle details and pricing information.
```

**15. Find bookings with add-ons:**
```
Show me all bookings that include add-ons. Display the booking details along with the add-on names and fees.
```

### Data Analysis Queries

**16. Count records:**
```
How many active vehicles are in the database? Also show me how many are SUVs vs SEDANs.
```

**17. Get statistics:**
```
Query the database to show me statistics: how many users are active, how many vehicles are approved, and how many bookings are confirmed.
```

**18. Find most popular vehicles:**
```
Show me the top 10 vehicles by rating count. Include the vehicle details and their average rating.
```

**19. Get user activity:**
```
Find all users who have logged in within the last 30 days. Show me their names, last login date, and status.
```

**20. Booking trends:**
```
Query bookings from the last month and show me how many are confirmed, pending, completed, and cancelled. Group them by status.
```

## Tips for Using the MCP Server

1. **Be specific about what you want**: Include the model name, query criteria, and what fields you want to see.

2. **Use natural language**: Claude will translate your request into the appropriate database query.

3. **Ask for populated data**: If you want related data (e.g., user details in a booking), ask Claude to populate those fields.

4. **Specify limits**: If you want a specific number of results, mention it in your prompt.

5. **Combine queries**: You can ask Claude to perform multiple queries and compare results.

## Testing the MCP Server

### Quick Test from Terminal

Before using with Claude Desktop, test the server manually:

```bash
cd /home/mrinal/Desktop/Drivio-Application/KONECT_MCP_Server

# Test with your MongoDB connection string
MONGODB_CONNECTION_STRING="mongodb+srv://user:password@cluster.mongodb.net/database" \
NODE_ENV=development \
SALT_ROUNDS=10 \
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"query_database","arguments":{"model":"User","query":{},"limit":1}}}' | \
node build/index.js
```

**Expected output:**
- `Connected to MongoDB`
- `Models loaded successfully`
- `Registered models: [ ... ]` (19 models)
- JSON response with query results

### Verify All Models Load

Check that all 19 models are registered:

```bash
MONGODB_CONNECTION_STRING="your-connection-string" \
NODE_ENV=development \
SALT_ROUNDS=10 \
node build/index.js 2>&1 | grep "Registered models"
```

You should see: `AddOn, ApiKey, BlockedDate, Booking, Calendar, Conversation, Document, Favorite, Keystore, Message, Notification, PaymentMethod, PayoutMethod, Review, Role, SupportRequest, Transaction, User, Vehicle`

## Troubleshooting

### If the tool doesn't appear in Claude Desktop:

1. **Check configuration file syntax:**
   ```bash
   cat ~/.config/Claude/claude_desktop_config.json | python3 -m json.tool
   ```
   If there's a syntax error, fix it.

2. **Verify paths are absolute:**
   - Node.js path: `/home/mrinal/.nvm/versions/node/v18.20.8/bin/node`
   - Server path: `/home/mrinal/Desktop/Drivio-Application/KONECT_MCP_Server/build/index.js`

3. **Check file permissions:**
   ```bash
   ls -la /home/mrinal/Desktop/Drivio-Application/KONECT_MCP_Server/build/index.js
   ```
   Should be executable (`-rwxr-xr-x`)

4. **Check Claude Desktop logs:**
   - Look for error messages in Claude Desktop's console
   - Check system logs for Node.js errors

### If queries fail:

1. **Verify MongoDB connection:**
   - Test connection string manually: `mongosh "your-connection-string"`
   - Ensure database is accessible
   - Check network/firewall settings for MongoDB Atlas

2. **Check environment variables:**
   - `MONGODB_CONNECTION_STRING` must be set
   - `NODE_ENV=development` is required
   - `SALT_ROUNDS=10` is required

3. **Verify models loaded:**
   - Check Claude Desktop logs for "Models loaded successfully"
   - Verify "Registered models" shows all 19 models
   - If models aren't loading, check that `drivio-web-service` directory exists

### Common Issues:

**"Schema hasn't been registered for model"**
- Models didn't load properly
- Check that `drivio-web-service/config.js` exists
- Verify `NODE_ENV` and `SALT_ROUNDS` are set
- Ensure `drivio-web-service/keys/private.pem` and `public.pem` exist

**"Cannot find module"**
- Check that `drivio-web-service` directory is at correct path
- From `build/loadModels.js`, path should be `../../drivio-web-service`

**"MongoDB connection error"**
- Verify connection string is correct
- Test connection manually with `mongosh`
- Check MongoDB Atlas IP whitelist if using Atlas

**"No models registered"**
- Check Claude Desktop logs for model loading errors
- Verify `drivio-web-service/database/mongoose/models` exists
- Ensure all environment variables are set correctly
