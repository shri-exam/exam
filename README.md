http://shri-exam.github.com/exam
=======

# Экзаменационное задание | Яндекс
---
В проекте используется библиотека `jQuery 1.9`, но в последний момент была заменена на `2 pre`. На то есть свои причины. Так как в проекте используется `Yandex API.Фоток` и формат получения данных от сервера - `JSON`, то в связи с этим возникла одна небольшая проблема - версия `1.9` не поддерживает обработку ошибок `JSONP`, поэтому была использована последняя версия библиотеки. C версиий `1.9` все так же работает кроме обработки единственной ошибки, при обращении к серверу. В этом можно убедиться и раскомментировать строчку с подключением библиотеки `jQuery` :
```html
<head>
    ...
    <!-- 1.9 jq all work but JSONP error handling not supported-->
    <!--<script type="text/javascript" src="js/jquery-1.9.1.min.js"></script>-->

    <!-- 2.x pre jq - support JSONP error Handling -->
    <script type="text/javascript" src="js/jquery-git2.js"></script>
    ...
</head>
```
---
### Ядро(core.js):
Включает в себя модули:

    * Модуль работы с Yandex API.Фотки
    * Шаблонизатор
    * Модуль работы c анимациией
    * Модуль работы со скролингом  колесо мыши\тачпад

**Модуль работы с Yandex API.Фотки:**
Модуль позволяет получать информацию об альбомах и фотографиях указанного пользователя, в частности: получает сервисный документ, получает альбомы и данные к ним( ссылку на привью -  `75x75px`, идентификатор, ссылку на оригинал ), из постраничной структуры рекурсивно создает линейную для последующей работы с ней, так же осуществляет поиск фото по идентификатору для загрузки прежнего состояния. Все ключевые методы работают асинхронно и возвращают `deferred` объекты, позволяющие отследить состояние загрузки\ошибки.  

**Шаблонизатор:**
Ищет в файле шаблоны, предоставляет интерфейс, позволяющий  задать параметры шаблона и получить `HTML`

**Модуль работы c анимацией:**
Позволяет анимировать указанный спрайт, с необходимыми параметрами( скорость, высота, ширина ) .Используется для работы с прелоадерами.

**Модуль работы со скролингом  колесо мыши\тачпад:**
Предоставляет единственный метод, позволяющий кроссбраузерно прослушивать события скрола, возвращает дельту по горизонтали.

---
### Реализация(gallery.js):
Включает в себя реализацию всего функционала галереи и обработку событий, взаимодействует со всеми модулями ядра. 

---
### Основные возможности галереи:

    *Поиск альбомов пользователя
    *Асинхронная загрузка привью альбомов    
    *Скролинг альбомов
    *Скролинг фотографий
    *Асинхронная \ порционная загрузка привью фотографий
    *Загрузка порций фото при скролинге / клику
    *Сохранение состояния искомых пользователей
Так же реализована порционная загрузка изображений в левую сторону, если  предыдущий индекс фото был, к примеру - `500+`, то рационально загружать фото порциями от текущего индекса в обе стороны, а не все изображения до нужного. Активное изображение держится в фокусе рабочего поля, в случае скролинга кнопками(вправо, влево) или  случае загрузки предыдущей позиции.
Изображения растягиваются по высоте на  свободную зону, ограничиваясь максимально-допустимой высотой(задается в файле реализации - `gallery.js`).

---













