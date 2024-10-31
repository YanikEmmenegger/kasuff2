# Verwenden Sie das offizielle Nginx-Image als Basis
FROM nginx:alpine

# Entfernen Sie die Standard-Nginx-Konfigurationsdateien
RUN rm /etc/nginx/conf.d/default.conf

# Kopieren Sie die benutzerdefinierte Nginx-Konfigurationsdatei in das Image
COPY nginx.conf /etc/nginx/conf.d
