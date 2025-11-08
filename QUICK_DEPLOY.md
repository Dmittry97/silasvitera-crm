# Быстрый деплой на сервер

## Путь на сервере
```
~/site/silasvitera-crm/
```

## 1. Собрать проект локально
```bash
cd frontend
npm run build

cd ../backend
npm run build
```

## 2. Обновить на сервере через Git (рекомендуется)
```bash
ssh root@cv5413933

cd ~/site/silasvitera-crm
git pull

# Собрать frontend
cd frontend
npm run build

# Собрать backend
cd ../backend
npm run build

# Перезапустить backend
pm2 restart silasvitera-backend

# Проверить статус
pm2 status
```

## 3. Обновить Nginx конфиг (один раз)
```bash
nano /etc/nginx/sites-available/anywwere.ru
```

Вставить содержимое из `nginx-server.conf`

```bash
nginx -t
systemctl reload nginx
```

## 4. Проверка
```bash
# Backend
curl http://localhost:4000/api/products

# Frontend файлы
ls -la ~/site/silasvitera-crm/frontend/dist/

# PM2
pm2 status
pm2 logs silasvitera-backend

# Nginx
tail -f /var/log/nginx/error.log
```

## 5. Открыть в браузере
```
https://anywwere.ru/silasvitera/
https://anywwere.ru/silasvitera/admin/login
```

## Быстрое обновление (после первого деплоя)
```bash
ssh root@cv5413933
cd ~/site/silasvitera-crm
git pull
cd frontend && npm run build
cd ../backend && npm run build
pm2 restart silasvitera-backend
```

## Важные команды

### PM2
```bash
pm2 status                      # Статус всех процессов
pm2 logs silasvitera-backend    # Логи backend
pm2 restart silasvitera-backend # Перезапуск
pm2 stop silasvitera-backend    # Остановка
pm2 start dist/main.js --name silasvitera-backend  # Запуск
```

### Nginx
```bash
nginx -t                        # Проверка конфига
systemctl reload nginx          # Перезагрузка
systemctl status nginx          # Статус
tail -f /var/log/nginx/error.log  # Логи ошибок
```

### MongoDB
```bash
systemctl status mongod         # Статус
systemctl start mongod          # Запуск
mongo                           # Консоль
```

## Структура файлов на сервере
```
/root/site/silasvitera-crm/
├── .git/
├── backend/
│   ├── src/
│   ├── dist/           ← Скомпилированный backend
│   ├── node_modules/
│   ├── package.json
│   └── .env           ← Переменные окружения
├── frontend/
│   ├── src/
│   ├── dist/          ← Скомпилированный frontend
│   ├── node_modules/
│   └── package.json
└── nginx-server.conf  ← Конфиг для Nginx
```
