FROM node:20-alpine

WORKDIR /app

# 安装依赖
COPY package*.json ./
RUN npm ci

# 复制源码
COPY . .

# 创建数据目录
RUN mkdir -p data uploads

# 编译 TypeScript
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]