FROM node:16-alpine
WORKDIR /var/app
COPY package.json package-lock.json ./
RUN npm install --production
ADD dist dist/
ADD src src/
EXPOSE 8000
CMD ["npm", "run", "serve"]
