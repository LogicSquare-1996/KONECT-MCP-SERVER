import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { loadModels } from "./loadModels.js";

// Load environment variables
dotenv.config();

// Database connection
const MONGODB_URI = process.env.MONGODB_CONNECTION_STRING || 'mongodb://localhost:27017/starter_project';

// Available models in the Drivio application
const AVAILABLE_MODELS = [
  'User',
  'Vehicle',
  'Booking',
  'Transaction',
  'Review',
  'AddOn',
  'Conversation',
  'Message',
  'Document',
  'PaymentMethod',
  'PayoutMethod',
  'Notification',
  'Favorite',
  'SupportRequest',
  'Calendar',
  'BlockedDate',
  'Role',
  'Keystore',
  'ApiKey'
] as [string, ...string[]];

type ModelName = typeof AVAILABLE_MODELS[number];

// Create server instance
const server = new McpServer({
  name: "konect-database",
  version: "1.0.0",
});

// Connect to MongoDB
let dbConnected = false;

async function connectDatabase(): Promise<void> {
  if (dbConnected) {
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    dbConnected = true;
    console.error('Connected to MongoDB');
    
    // Load models after connection
    // This loads all models from drivio-web-service/database/mongoose/models
    loadModels();
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Initialize database connection
connectDatabase().catch(console.error);

// Register database query tool
server.registerTool(
  "query_database",
  {
    description: "Query the Drivio application database. Supports querying any model (User, Vehicle, Booking, Transaction, Review, etc.) with MongoDB query syntax. Returns matching documents.",
    inputSchema: {
      model: z
        .enum(AVAILABLE_MODELS)
        .describe("The model name to query (e.g., User, Vehicle, Booking, Transaction, Review, AddOn, Conversation, Message, Document, PaymentMethod, PayoutMethod, Notification, Favorite, SupportRequest, Calendar, BlockedDate, Role, Keystore, ApiKey)"),
      query: z
        .record(z.any())
        .describe("MongoDB query object (e.g., {\"status\": \"active\"}, {\"host\": \"userId\"}, {\"rating\": {\"$gte\": 4}}). Use MongoDB query operators like $gt, $gte, $lt, $lte, $in, $ne, $regex, etc."),
      projection: z
        .record(z.union([z.literal(1), z.literal(0)]))
        .optional()
        .describe("Optional: Fields to include/exclude in the result (e.g., {\"name\": 1, \"email\": 1} to include only name and email, or {\"password\": 0} to exclude password)"),
      sort: z
        .record(z.union([z.literal(1), z.literal(-1)]))
        .optional()
        .describe("Optional: Sort order (e.g., {\"createdAt\": -1} for descending, {\"name\": 1} for ascending)"),
      limit: z
        .number()
        .min(1)
        .max(1000)
        .optional()
        .default(100)
        .describe("Optional: Maximum number of documents to return (default: 100, max: 1000)"),
      skip: z
        .number()
        .min(0)
        .optional()
        .default(0)
        .describe("Optional: Number of documents to skip (for pagination)"),
      populate: z
        .array(z.string())
        .optional()
        .default([])
        .describe("Optional: Array of field names to populate (e.g., [\"host\", \"vehicle\"] for Booking model)"),
    },
  },
  async ({ model, query, projection, sort, limit = 100, skip = 0, populate = [] }: {
    model: string;
    query: Record<string, any>;
    projection?: Record<string, 1 | 0>;
    sort?: Record<string, 1 | -1>;
    limit?: number;
    skip?: number;
    populate?: string[];
  }) => {
    try {
      // Ensure database is connected
      if (!dbConnected) {
        await connectDatabase();
      }

      // Validate model name
      if (!AVAILABLE_MODELS.includes(model as ModelName)) {
        return {
          content: [
            {
              type: "text",
              text: `Invalid model name: ${model}. Available models: ${AVAILABLE_MODELS.join(', ')}`,
            },
          ],
        };
      }

      // Get the model from mongoose
      const Model = mongoose.model(model);

      // Build the query
      let mongoQuery = Model.find(query);

      // Apply projection if provided
      if (projection) {
        mongoQuery = mongoQuery.select(projection);
      }

      // Apply sorting if provided
      if (sort) {
        mongoQuery = mongoQuery.sort(sort);
      }

      // Apply pagination
      const actualLimit = Math.min(limit, 1000);
      mongoQuery = mongoQuery.skip(skip).limit(actualLimit);

      // Apply population if provided
      for (const field of populate) {
        mongoQuery = mongoQuery.populate(field);
      }

      // Execute query
      const results = await mongoQuery.lean().exec();

      // Get total count for pagination info
      const totalCount = await Model.countDocuments(query);

      const response = {
        success: true,
        model,
        query,
        count: results.length,
        totalCount,
        skip,
        limit: actualLimit,
        hasMore: skip + results.length < totalCount,
        results,
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response, null, 2),
          },
        ],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Handle mongoose errors
      if (error instanceof mongoose.Error) {
        return {
          content: [
            {
              type: "text",
              text: `Database error: ${errorMessage}`,
            },
          ],
        };
      }

      // Handle other errors
      return {
        content: [
          {
            type: "text",
            text: `Error executing query: ${errorMessage}`,
          },
        ],
      };
    }
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Konect Database MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
