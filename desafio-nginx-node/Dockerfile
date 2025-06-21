FROM node

RUN apt update && \
    apt install -y wget netcat-traditional && \
    wget -q -O /usr/bin/wait-for https://raw.githubusercontent.com/eficode/wait-for/v2.2.3/wait-for && \
    chmod +x /usr/bin/wait-for

WORKDIR /usr/src/app

RUN npm init -y && npm install express mysql2 @faker-js/faker

COPY node/index.js .

EXPOSE 3000

CMD ["wait-for", "mysql:3306", "--", "node", "index.js"]
