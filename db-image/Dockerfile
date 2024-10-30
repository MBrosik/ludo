FROM mysql:8.0.19
ENV MYSQL_ROOT_PASSWORD=root
ENV MYSQL_DATABASE=ludo
ENV MYSQL_USER=admin
ENV MYSQL_PASSWORD=admin

COPY ./db/ludo.sql /docker-entrypoint-initdb.d/