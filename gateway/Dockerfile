FROM node:22-slim

WORKDIR /gateway

RUN npm init -y && npm install @okxweb3/a2a-node openclaw

COPY start.sh .
RUN chmod +x start.sh

EXPOSE 18789

CMD ["./start.sh"]
