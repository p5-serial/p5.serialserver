
// variable for websocket server
WebsocketServer server;

// variable for port
int serverPort = 8081;

void webSocketServerEvent(String msg) {
  println(msg);
  
  JSONObject json = parseJSONObject(msg);
  
  if (json == null) {
    println("no parsing");
  }
  
  else {
    // i was able to retrieve the method
    println(json.getString("method"));
  }
  
  
}

// TODO: method for stopping web socket server
// after closing all serialport connections
