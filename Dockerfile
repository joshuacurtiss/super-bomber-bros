FROM node:12-alpine
WORKDIR /var/app
COPY package.json yarn.lock ./
RUN yarn install --prod
ADD dist dist/
EXPOSE 8000
CMD ["yarn", "serve"]
