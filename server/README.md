# Multi.io Quotes

## Websocket Documentation

Multi.io Staging API Endpoint

```bash
wss://staging-ome-sockets.multi.io
```

### Ping

Request

```json
{
  "id": 1000,
  "method": "server.ping",
  "params": [],
}
```

Response

```json
{
  "id": 1000,
  "result": "pong",
  "error": null,
}
```

### Subscribe

Request

```json
{
  "id": 1001,
  "method": "depth.subscribe",
  "params": ["BTCUSDT", 50, "0.01"],
}
```

Response

```json
{
  "id": 1001,
  "result": {"status": "success"},
  "error": null,
}
```

### Depth Of Market

Response

```json
{
  "method": "depth.update",
  "params": [
    true,
    0,
    {
      "market": "BTCUSDT",
      "asks": [
        ["9681.11", "0.199625"],
      ],
      "bids": [
        ["9672.37", "0.010713"],
      ],
      "timestamp": 1595736351.968364,
    },
    "BTCUSDT",
  ],
  "id": null,
}
```
