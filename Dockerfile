FROM node

WORKDIR /bridge

COPY package.json .

RUN npm install

COPY . .

EXPOSE 3500

CMD ["node", "./index"]