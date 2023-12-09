# Use an official PHP runtime as a parent image
FROM php:7.4.33-apache

# Install system dependencies
RUN apt-get update && apt-get install -y \
        libssl-dev \
        zip \
        unzip \
        git

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_mysql
RUN pecl install mongodb-1.17.0 && docker-php-ext-enable mongodb

# Set COMPOSER_ALLOW_SUPERUSER to 1
ENV COMPOSER_ALLOW_SUPERUSER 1

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Set the working directory inside the container
WORKDIR /var/www/html

# Copy the application content to the container
COPY . .

# Install the PHP dependencies with Composer
RUN composer install --no-interaction

# Grant write permissions to the web root
RUN chown -R www-data:www-data /var/www/html

# Expose port 80
EXPOSE 80
