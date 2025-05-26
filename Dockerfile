# Используем официальный Go-образ
FROM golang:1.24-alpine

# Устанавливаем зависимости
RUN apk update && apk add --no-cache git

# Создаем рабочую директорию
WORKDIR /app

# Копируем go.mod и go.sum и загружаем зависимости
COPY go.mod go.sum ./
RUN go mod download

# Копируем весь проект
COPY . .

# Собираем бинарник
RUN go build -o server .

# Указываем порт, который слушает приложение
EXPOSE 8080

# Команда запуска
CMD ["/app/server"]