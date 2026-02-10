// index.ts
// Main entry point for the Konect Database MCP Server
// This file sets up the MCP server, database connection, and query tool

// --------------------
// Imports
// --------------------
// dotenv: Loads environment variables from .env file
import dotenv from "dotenv";
// mongoose: MongoDB ODM (Object Document Mapper) for database operations
import mongoose from "mongoose";
// zod: Schema validation library for validating tool input parameters
import { z } from "zod";

// MCP SDK: Core MCP server and transport implementations
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// loadModels: Function to load all Mongoose models from drivio-web-service
import { loadModels } from "./loadModels.js";

// --------------------
// Environment Setup
// --------------------
// Load environment variables from .env file into process.env
// This allows us to use MONGODB_CONNECTION_STRING, NODE_ENV, etc.
dotenv.config();

// --------------------
// Database Configuration
// --------------------
// Get MongoDB connection string from environment variable or use default
// This connection string is used to connect to the MongoDB database
const MONGODB_URI =
  process.env.MONGODB_CONNECTION_STRING ||
  "mongodb://localhost:27017/starter_project";

// Track database connection status to avoid multiple connection attempts
let dbConnected = false;

/**
 * Connect to MongoDB database and load all models
 * 
 * This function:
 * 1. Checks if already connected (prevents duplicate connections)
 * 2. Connects to MongoDB using the connection string
 * 3. Sets connection timeout options (5s server selection, 45s socket timeout)
 * 4. Loads all Mongoose models after successful connection
 * 
 * IMPORTANT: Models must be loaded AFTER mongoose.connect() because
 * they need an active connection to register schemas properly
 */
async function connectDatabase(): Promise<void> {
  // Early return if already connected (prevents duplicate connections)
  if (dbConnected) return;

  // Connect to MongoDB with timeout settings
  // serverSelectionTimeoutMS: How long to wait for server selection
  // socketTimeoutMS: How long to wait for socket operations
  await mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });

  // Mark as connected to prevent reconnection attempts
  dbConnected = true;
  console.error("Connected to MongoDB");

  // 🔑 CRITICAL: Load models AFTER connection
  // Models need an active MongoDB connection to register their schemas
  // This loads all 19 models from drivio-web-service/database/mongoose/models
  await loadModels();
}

// --------------------
// MCP Server Definition
// --------------------
// List of all available models that can be queried
// This array is used for validation - only these model names are accepted
// 'as const' makes it a readonly tuple for TypeScript type safety
const AVAILABLE_MODELS = [
  "User",
  "Vehicle",
  "Booking",
  "Transaction",
  "Review",
  "AddOn",
  "Conversation",
  "Message",
  "Document",
  "PaymentMethod",
  "PayoutMethod",
  "Notification",
  "Favorite",
  "SupportRequest",
  "Calendar",
  "BlockedDate",
  "Role",
  "Keystore",
  "ApiKey",
] as const;

// TypeScript type: Extract model name type from AVAILABLE_MODELS array
// This ensures type safety when working with model names
type ModelName = (typeof AVAILABLE_MODELS)[number];

// Create the MCP server instance
// This server will handle MCP protocol communication via stdio
const server = new McpServer({
  name: "konect-database",  // Server identifier
  version: "1.0.0",          // Server version
});

// --------------------
// MCP Tool: query_database
// --------------------
// Register the main tool that allows querying the database
// This tool is called by MCP clients (like Claude Desktop) to execute database queries
server.registerTool(
  "query_database",  // Tool name (used by MCP clients to call this tool)
  {
    // Tool description shown to MCP clients
    description: "Query MongoDB using registered Mongoose models",
    
    // Input schema: Defines and validates the parameters this tool accepts
    // Zod is used for runtime validation of input parameters
    inputSchema: {
      // model: Required - must be one of the AVAILABLE_MODELS
      model: z.enum(AVAILABLE_MODELS),
      
      // query: Required - MongoDB query object (e.g., {status: "active"})
      // z.record(z.any()) allows any key-value pairs for flexible MongoDB queries
      query: z.record(z.any()),
      
      // projection: Optional - Fields to include(1) or exclude(0) in results
      // Example: {name: 1, email: 1} to include only name and email
      projection: z
        .record(z.union([z.literal(1), z.literal(0)]))
        .optional(),
      
      // sort: Optional - Sort order for results
      // Example: {createdAt: -1} for descending, {name: 1} for ascending
      sort: z
        .record(z.union([z.literal(1), z.literal(-1)]))
        .optional(),
      
      // limit: Optional - Maximum number of results (default: 100, max: 1000)
      limit: z.number().min(1).max(1000).default(100),
      
      // skip: Optional - Number of documents to skip (for pagination)
      skip: z.number().min(0).default(0),
      
      // populate: Optional - Array of field names to populate (join related documents)
      // Example: ["guest", "host", "vehicle"] for Booking model
      populate: z.array(z.string()).default([]),
    },
  },
  // Tool handler: This function executes when the tool is called
  async ({ model, query, projection, sort, limit, skip, populate }) => {
    try {
      // Ensure database is connected before querying
      // If not connected, connect now (this also loads models)
      if (!dbConnected) {
        await connectDatabase();
      }

      // Validate that the requested model is actually registered with Mongoose
      // This prevents errors if a model failed to load
      if (!mongoose.modelNames().includes(model)) {
        return {
          content: [
            {
              type: "text",
              text: `Model "${model}" is not registered. Available: ${mongoose
                .modelNames()
                .join(", ")}`,
            },
          ],
        };
      }

      // Get the Mongoose model class for the requested model
      // This gives us access to the model's query methods (find, countDocuments, etc.)
      const Model = mongoose.model(model);

      // Build the MongoDB query
      // Model.find(query) creates a query that matches the provided criteria
      let mongoQuery = Model.find(query);

      // Apply projection if provided (select specific fields)
      // This reduces the amount of data returned
      if (projection) mongoQuery = mongoQuery.select(projection);
      
      // Apply sorting if provided
      // This orders the results (e.g., newest first, alphabetical, etc.)
      if (sort) mongoQuery = mongoQuery.sort(sort);

      // Apply pagination (skip and limit)
      // skip: How many documents to skip (for pagination)
      // limit: Maximum number of documents to return
      mongoQuery = mongoQuery.skip(skip).limit(limit);

      // Apply population if provided (join related documents)
      // This replaces ObjectId references with actual document data
      // Example: populate("guest") replaces guest ObjectId with full User document
      for (const field of populate) {
        mongoQuery = mongoQuery.populate(field);
      }

      // Execute the query
      // .lean() returns plain JavaScript objects instead of Mongoose documents (faster)
      // .exec() executes the query and returns a Promise
      const results = await mongoQuery.lean().exec();
      
      // Get total count of matching documents (for pagination info)
      // This counts all documents matching the query, not just the returned ones
      const totalCount = await Model.countDocuments(query);

      // Return the results in MCP format
      // MCP requires content array with type and text fields
      return {
        content: [
          {
            type: "text",
            // Format response as JSON with:
            // - success: true (indicates query succeeded)
            // - model: which model was queried
            // - count: number of results returned
            // - totalCount: total matching documents (for pagination)
            // - skip, limit: pagination parameters used
            // - hasMore: boolean indicating if more results exist
            // - results: array of matching documents
            text: JSON.stringify(
              {
                success: true,
                model,
                count: results.length,
                totalCount,
                skip,
                limit,
                hasMore: skip + results.length < totalCount,
                results,
              },
              null,
              2,  // Pretty print with 2-space indentation
            ),
          },
        ],
      };
    } catch (error) {
      // Handle any errors that occur during query execution
      // Return error message in MCP format so client can display it
      return {
        content: [
          {
            type: "text",
            // Extract error message (handle both Error objects and other types)
            text: `Database error: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
      };
    }
  },
);

// --------------------
// Server Startup
// --------------------
/**
 * Main function: Starts the MCP server
 * 
 * Execution order:
 * 1. Connect to MongoDB and load all models
 * 2. Connect MCP server to stdio transport (for communication with MCP clients)
 * 3. Server is now ready to receive tool calls from MCP clients
 * 
 * The server communicates via stdio (standard input/output)
 * MCP clients send JSON-RPC messages on stdin, server responds on stdout
 */
async function main() {
  // Step 1: Connect to database and load models
  // This must happen before the server starts accepting requests
  await connectDatabase();
  
  // Step 2: Connect MCP server to stdio transport
  // StdioServerTransport handles JSON-RPC communication over stdin/stdout
  // This allows the server to communicate with MCP clients (like Claude Desktop)
  await server.connect(new StdioServerTransport());
  
  // Log that server is ready (stderr is used for logs, stdout is for MCP protocol)
  console.error("Konect Database MCP Server running on stdio");
}

// Start the server and handle any fatal errors
// If startup fails, log the error and exit with code 1
main().catch((err) => {
  console.error("Fatal MCP error:", err);
  process.exit(1);
});
