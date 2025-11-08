# Инструкция по деплою на сервер

## 1. Подготовка на локальной машине

### Backend
```bash
cd backend
npm run build
```

### Frontend
```bash
cd frontend
npm run build
```

## 2. Загрузка на сервер

### Директории уже существуют на сервере
```
~/site/silasvitera-crm/frontend
~/site/silasvitera-crm/backend
```

### Загрузить файлы (с локальной машины)
```bash
# Backend
scp -r backend/dist root@cv5413933:~/site/silasvitera-crm/backend/
scp -r backend/node_modules root@cv5413933:~/site/silasvitera-crm/backend/
scp backend/package.json root@cv5413933:~/site/silasvitera-crm/backend/
scp backend/.env root@cv5413933:~/site/silasvitera-crm/backend/

# Frontend
scp -r frontend/dist/* root@cv5413933:~/site/silasvitera-crm/frontend/dist/
```

### Или через Git (если репозиторий уже на сервере)
```bash
ssh root@cv5413933
cd ~/site/silasvitera-crm
git pull
cd frontend && npm run build
cd ../backend && npm run build
```

## 3. Настройка Backend на сервере

### Установить зависимости (если не копировали node_modules)
```bash
cd ~/site/silasvitera-crm/backend
npm install --production
```

### Создать .env файл
```bash
nano ~/site/silasvitera-crm/backend/.env
```

Содержимое:
```
MONGODB_URI=mongodb://localhost:27017/silasvitera
PORT=4000
JWT_SECRET=your-secret-key-here
```

### Установить PM2 для управления процессом
```bash
npm install -g pm2
```

### Запустить backend
```bash
cd ~/site/silasvitera-crm/backend
pm2 start dist/main.js --name silasvitera-backend
pm2 save
pm2 startup
```

## 4. Настройка Nginx

### Скопировать конфиг
```bash
nano /etc/nginx/sites-available/anywwere.ru
```

Вставить содержимое из `nginx-server.conf`

### Проверить и перезапустить Nginx
```bash
nginx -t
systemctl reload nginx
```

## 5. Проверка

### Проверить backend
```bash
curl http://localhost:4000/api/products
```

### Проверить frontend
```bash
ls -la ~/site/silasvitera-crm/frontend/dist/
```

Должны быть файлы:
- index.html
- bundle.[hash].js
- main.css

### Открыть в браузере
```
https://anywwere.ru/silasvitera/
https://anywwere.ru/silasvitera/admin/login
```

## 6. Обновление приложения

### Backend
```bash
# На локальной машине
cd backend
npm run build
scp -r dist/* root@cv5413933:~/site/silasvitera-crm/backend/dist/

# На сервере
pm2 restart silasvitera-backend
```

### Frontend
```bash
# На локальной машине
cd frontend
npm run build
scp -r dist/* root@cv5413933:~/site/silasvitera-crm/frontend/dist/

# Очистить кэш браузера или Ctrl+Shift+R
```

### Или через Git (проще)
```bash
# На сервере
ssh root@cv5413933
cd ~/site/silasvitera-crm
git pull
cd frontend && npm run build
cd ../backend && npm run build
pm2 restart silasvitera-backend
```

## 7. Логи и отладка

### Логи backend
```bash
pm2 logs silasvitera-backend
```

### Логи Nginx
```bash
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

### Проверить процессы
```bash
pm2 status
netstat -tulpn | grep :4000
```

## 8. Важные моменты

1. **MongoDB** должен быть запущен:
   ```bash
   systemctl status mongod
   ```

2. **Порт 4000** должен быть открыт только локально (не в firewall)

3. **Frontend** - это статические файлы, не нужен Node.js

4. **Backend** работает через PM2 на порту 4000

5. **Nginx** проксирует:
   - `/silasvitera/` → статические файлы
   - `/silasvitera/api/` → backend на порту 4000

## 9. Структура на сервере

```
~/site/silasvitera-crm/
├── backend/
│   ├── dist/
│   │   └── main.js
│   ├── node_modules/
│   ├── package.json
│   └── .env
└── frontend/
    └── dist/
        ├── index.html
        ├── bundle.[hash].js
        └── main.css
```

Полный путь: `/root/site/silasvitera-crm/`
