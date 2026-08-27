#include <WiFi.h>
#include <PubSubClient.h>

// ─── Network Configuration ───────────────────────────────────────────────
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// ─── MQTT Broker Configuration ───────────────────────────────────────────
const char* mqtt_server = "broker.hivemq.com"; // Public broker for demo
const int mqtt_port = 1883;
const char* mqtt_topic = "honeychain/hives/H001/telemetry";

// ─── Hive Configuration ──────────────────────────────────────────────────
const char* hive_id = "HIVE-007"; // Hardcoded for this node

WiFiClient espClient;
PubSubClient client(espClient);

unsigned long lastMsg = 0;
const long interval = 10000; // Post every 10 seconds

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Create a random client ID
    String clientId = "HoneyChainNode-";
    clientId += String(random(0xffff), HEX);
    
    // Attempt to connect
    if (client.connect(clientId.c_str())) {
      Serial.println("connected");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

// ─── Sensor Mocking ──────────────────────────────────────────────────────
// In a real scenario, integrate DHT22 and HX711 libraries here.
float readTemperature() {
  // Return a realistic temperature (e.g., 34.0 to 36.5)
  return 34.0 + (random(0, 250) / 100.0);
}

float readHumidity() {
  // Return a realistic humidity (e.g., 55.0 to 75.0)
  return 55.0 + (random(0, 2000) / 100.0);
}

float readWeight() {
  // Return a realistic weight (e.g., 20.0 to 35.0 kg)
  return 20.0 + (random(0, 1500) / 100.0);
}

float readActivity() {
  // Return activity level (0.0 to 1.0)
  return random(60, 100) / 100.0;
}

void setup() {
  Serial.begin(115200);
  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
  
  // Random seed for sensor simulation
  randomSeed(analogRead(0));
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  unsigned long now = millis();
  if (now - lastMsg > interval) {
    lastMsg = now;
    
    float t = readTemperature();
    float h = readHumidity();
    float w = readWeight();
    float a = readActivity();

    // Construct JSON payload
    String payload = "{";
    payload += "\"hive_id\": \"" + String(hive_id) + "\",";
    payload += "\"temperature\": " + String(t) + ",";
    payload += "\"humidity\": " + String(h) + ",";
    payload += "\"weight\": " + String(w) + ",";
    payload += "\"bee_activity\": " + String(a);
    payload += "}";

    Serial.print("Publishing message: ");
    Serial.println(payload);
    
    client.publish(mqtt_topic, payload.c_str());
  }
}
