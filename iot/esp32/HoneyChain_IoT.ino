#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h> // Make sure to install ArduinoJson library

// ─── Network Configuration ───────────────────────────────────────────────
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// ─── API Configuration (Next.js Vercel URL) ──────────────────────────────
// E.g. "https://honey-chan.vercel.app/api/iot" or local dev URL
const char* api_url = "http://192.168.1.100:3000/api/iot";
const char* api_key = "secret_device_key_123"; // Optional security token

// ─── Hive Configuration ──────────────────────────────────────────────────
const char* hive_id = "H001"; // Must match a Hive ID in database

unsigned long lastMsg = 0;
const long interval = 60000; // Post every 60 seconds (1 minute)

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

// ─── Sensor Mocking ──────────────────────────────────────────────────────
// In a real scenario, integrate DHT22 and HX711 libraries here.
float readTemperature() {
  return 34.0 + (random(0, 250) / 100.0);
}

float readHumidity() {
  return 55.0 + (random(0, 2000) / 100.0);
}

float readWeight() {
  return 20.0 + (random(0, 1500) / 100.0);
}

float readActivity() {
  return random(60, 100) / 100.0;
}

void setup() {
  Serial.begin(115200);
  setup_wifi();
  
  // Random seed for sensor simulation
  randomSeed(analogRead(0));
}

void sendTelemetryData(float t, float h, float w, float a) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(api_url);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("x-device-key", api_key);

    // Create JSON Payload
    StaticJsonDocument<200> doc;
    doc["hiveCode"] = hive_id;
    doc["temperature"] = t;
    doc["humidity"] = h;
    doc["weight"] = w;
    doc["beeActivity"] = a;

    String jsonPayload;
    serializeJson(doc, jsonPayload);

    Serial.print("Sending POST request to ");
    Serial.println(api_url);
    Serial.println(jsonPayload);

    int httpResponseCode = http.POST(jsonPayload);

    if (httpResponseCode > 0) {
      Serial.print("HTTP Response code: ");
      Serial.println(httpResponseCode);
      String response = http.getString();
      Serial.println(response);
    } else {
      Serial.print("Error code: ");
      Serial.println(httpResponseCode);
    }
    http.end();
  } else {
    Serial.println("WiFi Disconnected. Cannot send data.");
  }
}

void loop() {
  // Reconnect WiFi if dropped
  if (WiFi.status() != WL_CONNECTED) {
    setup_wifi();
  }

  unsigned long now = millis();
  if (now - lastMsg > interval) {
    lastMsg = now;
    
    float t = readTemperature();
    float h = readHumidity();
    float w = readWeight();
    float a = readActivity();

    sendTelemetryData(t, h, w, a);
  }
}
