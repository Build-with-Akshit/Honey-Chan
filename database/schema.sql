-- Honey Chain Database Schema
-- For PostgreSQL / Supabase

-- Users / Participants
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    wallet_address VARCHAR(42) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('ADMIN', 'BEEKEEPER', 'PROCESSOR', 'LAB', 'DISTRIBUTOR', 'RETAILER')),
    phone VARCHAR(20),
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- KVIC Beekeeping Clusters
CREATE TABLE clusters (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    district VARCHAR(255) NOT NULL,
    state VARCHAR(255) NOT NULL,
    total_beekeepers INT DEFAULT 0,
    total_hives INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Hives
CREATE TABLE hives (
    id SERIAL PRIMARY KEY,
    hive_code VARCHAR(50) UNIQUE NOT NULL,
    beekeeper_id INT REFERENCES users(id),
    cluster_id INT REFERENCES clusters(id),
    location VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    flower_source VARCHAR(255),
    bee_colony_type VARCHAR(100) DEFAULT 'Apis mellifera',
    installation_date DATE,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'MAINTENANCE')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- IoT Sensor Readings
CREATE TABLE sensor_readings (
    id SERIAL PRIMARY KEY,
    hive_id INT REFERENCES hives(id),
    temperature DECIMAL(5, 2),  -- °C
    humidity DECIMAL(5, 2),     -- %
    weight DECIMAL(8, 2),       -- grams
    bee_activity DECIMAL(3, 2), -- 0.00 - 1.00
    battery DECIMAL(5, 2),      -- %
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Honey Batches
CREATE TABLE honey_batches (
    id SERIAL PRIMARY KEY,
    batch_id VARCHAR(50) UNIQUE NOT NULL,
    hive_id INT REFERENCES hives(id),
    beekeeper_id INT REFERENCES users(id),
    honey_type VARCHAR(100),
    quantity DECIMAL(10, 2),    -- grams
    harvest_date DATE,
    location VARCHAR(255),
    notes TEXT,
    metadata_hash VARCHAR(66),  -- 0x + 64 hex chars
    blockchain_tx VARCHAR(66),
    status VARCHAR(20) DEFAULT 'CREATED' CHECK (status IN ('CREATED', 'HARVESTED', 'PROCESSING', 'TESTED', 'DISTRIBUTED', 'RETAIL', 'COMPLETED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quality Tests
CREATE TABLE quality_tests (
    id SERIAL PRIMARY KEY,
    batch_id INT REFERENCES honey_batches(id),
    lab_id INT REFERENCES users(id),
    moisture DECIMAL(5, 2),
    sucrose DECIMAL(5, 2),
    fructose DECIMAL(5, 2),
    glucose DECIMAL(5, 2),
    hfm_content DECIMAL(5, 2),  -- Hydroxymethylfurfural
    result VARCHAR(10) CHECK (result IN ('PASS', 'FAIL', 'PENDING')),
    report_hash VARCHAR(66),
    report_url TEXT,
    tested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Supply Chain Events
CREATE TABLE supply_chain_events (
    id SERIAL PRIMARY KEY,
    batch_id INT REFERENCES honey_batches(id),
    actor_id INT REFERENCES users(id),
    stage VARCHAR(20) NOT NULL CHECK (stage IN ('HARVEST', 'COLLECTION', 'PROCESSING', 'LAB_TESTING', 'DISTRIBUTION', 'RETAIL')),
    location VARCHAR(255),
    notes TEXT,
    tx_hash VARCHAR(66),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI Predictions
CREATE TABLE ai_predictions (
    id SERIAL PRIMARY KEY,
    hive_id INT REFERENCES hives(id),
    health_score INT CHECK (health_score BETWEEN 0 AND 100),
    risk_level VARCHAR(10) CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    productivity_prediction DECIMAL(8, 2),  -- estimated kg
    productivity_confidence DECIMAL(3, 2),   -- 0.00 - 1.00
    prediction_window_days INT,
    explanation TEXT,
    recommendation TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_sensor_readings_hive ON sensor_readings(hive_id, timestamp DESC);
CREATE INDEX idx_honey_batches_beekeeper ON honey_batches(beekeeper_id);
CREATE INDEX idx_honey_batches_batch_id ON honey_batches(batch_id);
CREATE INDEX idx_supply_chain_batch ON supply_chain_events(batch_id, timestamp);
CREATE INDEX idx_ai_predictions_hive ON ai_predictions(hive_id, created_at DESC);
CREATE INDEX idx_users_wallet ON users(wallet_address);
