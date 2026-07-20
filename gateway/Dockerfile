FROM node:22-slim

RUN npm install -g @okxweb3/a2a-node openclaw

WORKDIR /gateway

COPY start.sh .
RUN chmod +x start.sh

EXPOSE 18789

CMD ["./start.sh"]
