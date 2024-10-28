# frontend/Dockerfile
FROM node:20-alpine

# Tạo thư mục làm việc và copy mã nguồn
WORKDIR /app
COPY ./chat-app/ .

# Remove .env va copy build/.env.frontend
RUN rm /app/.env.local

# Cài đặt phụ thuộc và build dự án Next.js
RUN npm install

# Build Next.js với các biến môi trường từ .env.frontend
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Hiển thị giá trị của NEXT_PUBLIC_API_URL (tùy chọn, để debug)
RUN echo "NEXT_PUBLIC_API_URL: $NEXT_PUBLIC_API_URL"

RUN npm run build

# Expose cổng và start ứng dụng
EXPOSE 3000
CMD ["npm", "start"]
