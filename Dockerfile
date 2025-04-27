# FROM node:22

# WORKDIR /app

# COPY package*.json ./

# RUN npm install

# COPY . .

# RUN npm run build

# EXPOSE 3000

# CMD ["npm", "run", "start"]

# Базовый образ
FROM node:22

# Рабочая директория
WORKDIR /app

# Копируем только package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем остальные файлы
COPY . .

# Порт для разработки
EXPOSE 3000

# Запускаем сервер в режиме разработки
CMD ["npm", "run", "dev"]