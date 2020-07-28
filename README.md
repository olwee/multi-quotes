# multi-quotes

## Deploying with Docker Compose

```bash
$ cd server/
$ npm run build
$ docker-compose up
```

## API Endpoint


API URL: `http://127.0.0.1:3000/api/v1/quotes`

Response:

```json
{
  "error":null,
  "result":{
    "bidPx":"11003.83",
    "askPx":"11009.47",
    "bidQty":"0.12049",
    "askQty":"0.128086",
    "spread":"5.64",
    "seq":505,
    "lastUpdated":1595909851541,
  },
}
```
