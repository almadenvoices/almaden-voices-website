// config.js - Environment configuration loader
// Supports both local .env files and GCP Secret Manager

const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const fs = require('fs');
const path = require('path');

// Determine environment
const NODE_ENV = process.env.NODE_ENV || 'development';
const USE_GCP_SECRETS = process.env.USE_GCP_SECRETS === 'true';
const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID;

console.log(`🔧 Loading configuration for: ${NODE_ENV}`);
console.log(`📦 Use GCP Secrets: ${USE_GCP_SECRETS}`);

/**
 * Load secrets from GCP Secret Manager
 */
async function loadGCPSecrets() {
    if (!GCP_PROJECT_ID) {
        throw new Error('GCP_PROJECT_ID environment variable is required when USE_GCP_SECRETS=true');
    }

    console.log(`🔐 Loading secrets from GCP Secret Manager (Project: ${GCP_PROJECT_ID})...`);

    const client = new SecretManagerServiceClient();

    const secretNames = [
        'PAYPAL_CLIENT_ID',
        'PAYPAL_CLIENT_SECRET',
        'PAYPAL_ENV',
        'EMAIL_USER',
        'EMAIL_PASS',
        'EMAIL_TO',
        'BASE_URL',
        'UNSUBSCRIBE_SECRET'
    ];

    const secrets = {};

    for (const secretName of secretNames) {
        try {
            const name = `projects/${GCP_PROJECT_ID}/secrets/${secretName}/versions/latest`;
            const [version] = await client.accessSecretVersion({ name });
            const payload = version.payload.data.toString('utf8');
            secrets[secretName] = payload;
            console.log(`  ✅ Loaded: ${secretName}`);
        } catch (error) {
            // Secret might not exist, which is okay for optional secrets
            console.log(`  ⚠️  Optional secret not found: ${secretName}`);
        }
    }

    return secrets;
}

/**
 * Load secrets from local .env file
 */
function loadLocalEnv() {
    const envFile = NODE_ENV === 'production'
        ? '.env.production'
        : '.env.dev';

    const envPath = path.join(__dirname, envFile);

    if (!fs.existsSync(envPath)) {
        console.warn(`⚠️  Warning: ${envFile} not found, using .env.example as fallback`);
        return {};
    }

    console.log(`📄 Loading environment from: ${envFile}`);

    // Parse .env file manually
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const secrets = {};

    envContent.split('\n').forEach(line => {
        // Skip comments and empty lines
        if (line.trim().startsWith('#') || !line.trim()) {
            return;
        }

        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
            const value = valueParts.join('=').trim();
            secrets[key.trim()] = value;
        }
    });

    return secrets;
}

/**
 * Initialize configuration
 */
async function initConfig() {
    try {
        let config;

        if (USE_GCP_SECRETS) {
            // Load from GCP Secret Manager
            config = await loadGCPSecrets();
        } else {
            // Load from local .env file
            config = loadLocalEnv();
        }

        // Set environment variables
        Object.keys(config).forEach(key => {
            process.env[key] = config[key];
        });

        console.log('✅ Configuration loaded successfully\n');
        return config;

    } catch (error) {
        console.error('❌ Error loading configuration:', error.message);
        throw error;
    }
}

module.exports = { initConfig };
