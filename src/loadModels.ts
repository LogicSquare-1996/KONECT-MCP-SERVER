// loadModels.ts
// This file handles loading all Mongoose models from the drivio-web-service
// Models are CommonJS modules that need to be loaded into the ES module context

// --------------------
// Imports
// --------------------
// mongoose: The MongoDB ODM instance (must be connected before loading models)
import mongoose from "mongoose";
// createRequire: Allows using CommonJS require() in ES modules
// This is needed because drivio-web-service models are CommonJS
import { createRequire } from "module";
// fileURLToPath, dirname: Convert ES module file URLs to file paths
// Needed to get the current file's directory for path resolution
import { fileURLToPath } from "url";
import { dirname, join, resolve } from "path";

// --------------------
// Module Path Setup
// --------------------
// Get the current file's path (for ES modules, we need to convert from URL)
// __filename: Full path to this file (loadModels.ts)
const __filename = fileURLToPath(import.meta.url);
// __dirname: Directory containing this file (build/ when compiled)
const __dirname = dirname(__filename);
// baseRequire: Create a require function for this ES module context
// Used to load Node.js built-in modules like "module"
const baseRequire = createRequire(import.meta.url);

// --------------------
// Model Loader
// --------------------

/**
 * Load all Mongoose models from drivio-web-service
 * 
 * This function:
 * 1. Resolves the path to drivio-web-service models directory
 * 2. Sets up NODE_PATH so models can find config.js via relative paths
 * 3. Overrides require() to ensure models use the same mongoose instance
 * 4. Loads all models via the models/index.js file
 * 5. Restores original require behavior
 * 
 * IMPORTANT:
 * - Must run AFTER mongoose.connect() (models need active connection)
 * - Ensures all models are registered in this process
 * - Models are CommonJS, so we use createRequire to load them
 */
export async function loadModels(): Promise<void> {
  // Resolve path to drivio-web-service directory
  // From build/loadModels.js: go up to KONECT_MCP_Server, then up to Drivio-Application, then into drivio-web-service
  const drivioPath = resolve(__dirname, "../../drivio-web-service");
  
  // Path to the models directory
  // This is where all the Mongoose model files are located
  const modelsPath = join(drivioPath, "database/mongoose/models");

  // Preserve original NODE_PATH environment variable
  // NODE_PATH tells Node.js where to look for modules when resolving require() paths
  const originalNodePath = process.env.NODE_PATH || "";

  // Set NODE_PATH to include drivio-web-service directory
  // This allows models to resolve "../../../config" relative paths correctly
  // Models use require("../../../config") which needs to find drivio-web-service/config.js
  process.env.NODE_PATH =
    drivioPath + (originalNodePath ? `:${originalNodePath}` : "");

  // Create a require function rooted at the models directory
  // This require function will resolve paths relative to models/index.js
  // When models/index.js loads model files, they'll use this context
  const modelRequire = createRequire(join(modelsPath, "index.js"));

  // Override the require function to inject our mongoose instance
  // This ensures all models use the SAME mongoose instance (the one we connected)
  // Without this, models might create their own mongoose instances
  const Module = baseRequire("module");
  const originalRequire = Module.prototype.require;

  // Override require() to intercept mongoose imports
  // When any model file does require("mongoose"), return our connected instance
  Module.prototype.require = function (id: string) {
    if (id === "mongoose") {
      // Return our mongoose instance (the one with active connection)
      return mongoose;
    }
    // For all other requires, use the original require function
    return originalRequire.apply(this, arguments as any);
  };

  try {
    // Load models/index.js which loads all model files
    // models/index.js uses fs.readdirSync to find all .js files and require them
    // Each model file calls mongoose.model() to register its schema
    // After this, all 19 models will be registered and available via mongoose.model("ModelName")
    modelRequire(join(modelsPath, "index.js"));

    // Log success and list all registered models
    // This helps verify that all models loaded correctly
    console.error("Models loaded successfully");
    console.error("Registered models:", mongoose.modelNames());
  } finally {
    // Always restore original require behavior and NODE_PATH
    // This cleanup ensures we don't affect other parts of the application
    // Restore original require (remove our mongoose override)
    Module.prototype.require = originalRequire;
    // Restore original NODE_PATH (remove our drivio-web-service path)
    process.env.NODE_PATH = originalNodePath;
  }
}
