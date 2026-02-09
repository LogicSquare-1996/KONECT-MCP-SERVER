# Using Konect Database MCP Server with Claude Desktop

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
      "command": "node",
      "args": [
        "/absolute/path/to/KONECT_MCP_Server/build/index.js"
      ],
      "env": {
        "MONGODB_CONNECTION_STRING": "mongodb://localhost:27017/starter_project"
      }
    }
  }
}
```

**Important:**
- Replace `/absolute/path/to/KONECT_MCP_Server/build/index.js` with the actual absolute path to your build file
- Update the `MONGODB_CONNECTION_STRING` with your actual MongoDB connection string
- Use forward slashes (`/`) even on Windows for the path

**Example for Linux:**
```json
{
  "mcpServers": {
    "konect-database": {
      "command": "node",
      "args": [
        "/home/mrinal/Desktop/Drivio-Application/KONECT_MCP_Server/build/index.js"
      ],
      "env": {
        "MONGODB_CONNECTION_STRING": "mongodb://localhost:27017/starter_project"
      }
    }
  }
}
```

### Step 3: Restart Claude Desktop

Close and restart Claude Desktop completely for the changes to take effect.

### Step 4: Verify the Server is Connected

After restarting, you should see the `query_database` tool available in Claude Desktop. You can verify by asking Claude:

"List all available MCP tools"

Or simply try one of the example prompts below.

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

## Troubleshooting

**If the tool doesn't appear:**
- Check that the path in the config file is correct and absolute
- Verify that `build/index.js` exists and is executable
- Check Claude Desktop's error logs
- Ensure MongoDB connection string is correct

**If queries fail:**
- Verify MongoDB is running
- Check the connection string in the config file
- Ensure the database contains data
- Check Claude Desktop's console for error messages

**Common issues:**
- Path must be absolute (not relative)
- Node.js must be in your PATH
- MongoDB must be accessible from the connection string
- Models must be loadable (check that drivio-web-service path is correct)
