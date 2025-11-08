# Исправление ошибки Permission Denied

## Проблема
```
Permission denied: /root/site/silasvitera-crm/frontend/dist/index.html
```

Nginx работает от пользователя `www-data` и не имеет доступа к `/root/`

## Решение: Переместить в /var/www/

### Шаг 1: Переместить проект
```bash
sudo mv ~/site/silasvitera-crm /var/www/
```

### Шаг 2: Установить правильные права
```bash
sudo chown -R www-data:www-data /var/www/silasvitera-crm
sudo chmod -R 755 /var/www/silasvitera-crm
```

### Шаг 3: Обновить Nginx конфиг
```bash
sudo nano /etc/nginx/sites-available/anywwere.ru
```

Вставить содержимое из `nginx-production.conf`

Ключевое изменение:
```nginx
# Было:
alias /root/site/silasvitera-crm/frontend/dist;

# Стало:
alias /var/www/silasvitera-crm/frontend/dist;
```

### Шаг 4: Проверить и перезагрузить Nginx
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Шаг 5: Обновить PM2 (backend)
```bash
# Остановить старый процесс
pm2 delete silasvitera-backend

# Запустить с новым путем
cd /var/www/silasvitera-crm/backend
pm2 start dist/main.js --name silasvitera-backend
pm2 save
```

### Шаг 6: Проверка
```bash
# Проверить права
ls -la /var/www/silasvitera-crm/frontend/dist/

# Должно быть:
# drwxr-xr-x www-data www-data

# Проверить Nginx
curl -I https://anywwere.ru/silasvitera/

# Проверить backend
pm2 status
curl http://localhost:4000/api/products
```

## Новая структура на сервере

```
/var/www/silasvitera-crm/
├── backend/
│   ├── dist/
│   ├── node_modules/
│   ├── package.json
│   └── .env
└── frontend/
    └── dist/
        ├── index.html
        ├── bundle.[hash].js
        └── main.css
```

## Обновление через Git (после переноса)

```bash
cd /var/www/silasvitera-crm
git pull
cd frontend && npm run build
cd ../backend && npm run build
pm2 restart silasvitera-backend
```

## Почему это работает?

1. **Nginx** работает от пользователя `www-data`
2. `/var/www/` - стандартная директория для веб-файлов
3. `www-data` имеет доступ к `/var/www/`
4. `/root/` доступен только пользователю root
5. Nginx не может читать файлы из `/root/` по соображениям безопасности
