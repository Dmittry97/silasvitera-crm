import requests
import os
from tqdm import tqdm
import json

def download_photos():
    # URL API для получения продуктов
    api_url = "https://silasvitera.up.railway.app/api/products"
    
    # Базовая URL для скачивания изображений
    image_base_url = "https://silasvitera.up.railway.app/api/image/"
    
    # Создаем папку для сохранения фотографий
    download_dir = ""
    
    try:
        # Отправляем запрос на получение продуктов
        print("Отправка запроса на получение списка продуктов...")
        response = requests.get(api_url)
        response.raise_for_status()
        
        # Парсим JSON ответ
        data = response.json()
        products = data.get("products", [])
        
        # Собираем список всех фото из массивов photos
        photo_list = []
        for product in products:
            photos = product.get("photos", [])
            if photos:
                photo_list.extend(photos)
        
        print(f"Найдено {len(photo_list)} фотографий для скачивания")
        
        # Скачиваем фотографии с прогресс-баром
        failed_downloads = []
        
        for photo_name in tqdm(photo_list, desc="Скачивание фотографий"):
            try:
                # Формируем URL для скачивания
                photo_url = f"{image_base_url}{photo_name}"
                
                # Скачиваем изображение
                photo_response = requests.get(photo_url, stream=True)
                photo_response.raise_for_status()
                
                # Сохраняем файл
                file_path = os.path.join(download_dir, photo_name)
                with open(file_path, 'wb') as f:
                    for chunk in photo_response.iter_content(chunk_size=8192):
                        f.write(chunk)
                        
            except requests.exceptions.RequestException as e:
                failed_downloads.append(photo_name)
                print(f"\nОшибка при скачивании {photo_name}: {e}")
        
        # Выводим результаты
        print(f"\nЗагрузка завершена!")
        print(f"Успешно скачано: {len(photo_list) - len(failed_downloads)} фотографий")
        
        if failed_downloads:
            print(f"Не удалось скачать {len(failed_downloads)} фотографий:")
            for photo in failed_downloads:
                print(f"  - {photo}")
        
        print(f"Фотографии сохранены в папке: {os.path.abspath(download_dir)}")
        
    except requests.exceptions.RequestException as e:
        print(f"Ошибка при запросе к API: {e}")
    except json.JSONDecodeError as e:
        print(f"Ошибка при парсинге JSON: {e}")
    except Exception as e:
        print(f"Произошла непредвиденная ошибка: {e}")

if __name__ == "__main__":
    download_photos()
