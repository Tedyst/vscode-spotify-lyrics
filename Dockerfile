
FROM node:latest
LABEL Name=vscode-spotify-lyrics Version=0.0.1 
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN yarn install
EXPOSE 3001
CMD node app.js
