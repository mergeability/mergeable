FROM node:12.16.0

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

FROM gcr.io/distroless/nodejs:14

COPY --from=build /app /app

EXPOSE 3000
USER 1000:1000

CMD [ "/app/node_modules/probot/bin/probot.js", "run", "/app/index.js" ]
