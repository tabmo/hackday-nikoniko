# specify the node base image with your desired version node:<version>
FROM node:9
# replace this with your application's default port
EXPOSE 8888

ADD . /opt
WORKDIR /opt
ENV HUBOT_SLACK_TOKEN <YOUR_SLACK_API_KEY>
ENV HUBOT_LOG_LEVEL 'debug'
CMD ["bin/hubot", "--adapter", "slack"]

