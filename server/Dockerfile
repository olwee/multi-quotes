FROM node:12-alpine

WORKDIR /app/

RUN apk add --no-cache bash

CMD ["npm", "i"]

COPY . /app/

RUN mkdir /app_data/

CMD ["npm", "run", "build"]

RUN chmod +x /app/wait-for-it.sh

ENTRYPOINT ["npm"]
