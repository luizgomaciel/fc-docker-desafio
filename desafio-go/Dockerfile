FROM golang:1.25rc1-alpine AS builder
WORKDIR /app
COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o app main.go

FROM scratch
WORKDIR /app
COPY --from=builder /app/app .
ENTRYPOINT ["./app"]