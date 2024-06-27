# define the base image
FROM node:lts-alpine3.18

# Install PM2 globally
RUN npm install pm2 -g 

# Set the working directory
WORKDIR /app

# Copy the package.json and install dependencies
COPY package.json .

# install dependencies
RUN npm install


# Copy application source
COPY . .

CMD ["pm2-runtime", "start", "ecosystem.config.js"] 


EXPOSE 8000
