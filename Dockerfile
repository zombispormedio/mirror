FROM golang:1.14 as build-env
WORKDIR /go/src/app
ADD . /go/src/app

RUN go get -d -v ./...

RUN go build -o /go/bin/app

FROM node:12.14 as build-public-env
ADD . /app
WORKDIR /app
RUN npm install
RUN npm run build

FROM gcr.io/distroless/base
COPY --from=build-env /go/bin/app /
COPY --from=build-public-env /app/public /public

CMD ["/app"]