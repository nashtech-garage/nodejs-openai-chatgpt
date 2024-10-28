# backend/Dockerfile
FROM node:20-alpine

# Tạo thư mục làm việc và copy mã nguồn
WORKDIR /app
COPY ./back-end-openai-api/ .

# Remove .env va copy build/.env.backend
RUN rm /app/.env

# Cài đặt phụ thuộc và build dự án Nest.js
RUN npm install
RUN npm run build

# Expose cổng và start ứng dụng
EXPOSE 3001
CMD ["npm", "run", "start:prod"]
