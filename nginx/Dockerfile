# /nginx/Dockerfile

# Use the official Nginx image based on Alpine for a lightweight footprint
FROM nginx:5.0.14-alpine

# Remove the default Nginx configuration to prevent unintended behavior
RUN rm /etc/nginx/conf.d/default.conf

# Copy the custom Nginx configuration file into the image
COPY nginx.conf /etc/nginx/conf.d/

# Ensure the Nginx user has the necessary permissions (optional if not modifying files)
# RUN chown -R nginx:nginx /etc/nginx/conf.d/

# Expose ports 80 and 443 (handled by docker-compose)
# EXPOSE 80 443

# Run Nginx in the foreground to keep the container alive
CMD ["nginx", "-g", "daemon off;"]
