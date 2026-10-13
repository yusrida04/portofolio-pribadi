FROM php:8.2-apache

RUN docker-php-ext-install mysqli \
    && a2enmod rewrite \
    && sed -i 's/AllowOverride None/AllowOverride All/g' /etc/apache2/apache2.conf

COPY . /var/www/html/
RUN mkdir -p /var/www/html/uploads \
    && chown -R www-data:www-data /var/www/html/uploads

# Render mengatur port lewat env PORT
ENV PORT=10000
CMD sed -i "s/Listen 80/Listen ${PORT}/" /etc/apache2/ports.conf \
    && sed -i "s/:80>/:${PORT}>/" /etc/apache2/sites-available/000-default.conf \
    && apache2-foreground
