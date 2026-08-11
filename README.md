# Asus Router Widget

Chrome-розширення для перегляду клієнтів і мережевого трафіку ASUS-роутера безпосередньо на сторінці його адміністративного інтерфейсу.

## Можливості

- список підключених і відомих клієнтів;
- online, login, connection type та RSSI стани;
- загальний і поточний вхідний/вихідний трафік;
- плавні SVG-графіки останніх 30 вимірювань;
- статистика INTERNET, LAN, 2.4 GHz і 5 GHz інтерфейсів;
- автоматичне оновлення даних кожні 2 секунди;
- автоматичне припинення polling після закриття діалогу;
- перемикання між Clients і Networks без перемонтування спільної оболонки діалогу;
- ізоляція UI від стилів ASUS через Shadow DOM.

## Технології

- Preact;
- TypeScript;
- Vite і CRXJS;
- Manifest V3;
- Vitest і React Testing Library;
- ESLint і Prettier.

## Вимоги

- Node.js `20.19+` або `22.12+` і новіший;
- npm;
- Chromium-браузер із підтримкою Manifest V3;
- доступ до адміністративної сторінки сумісного ASUS-роутера.

## Встановлення залежностей

```bash
npm install
```

## Розробка

```bash
npm run dev
```

Vite запускає development-збірку розширення. Для перевірки у Chrome завантажте створену директорію `dist/` як unpacked extension.

Під час перевірки development-збірки процес `npm run dev` має залишатися запущеним: service worker завантажує модулі з локального Vite-сервера. Для роботи без dev-сервера використовуйте production build.

## Production build

```bash
npm run build
```

Готове розширення буде створено в `dist/`.

### Встановлення в Chrome

1. Відкрийте `chrome://extensions`.
2. Увімкніть **Developer mode**.
3. Натисніть **Load unpacked**.
4. Виберіть директорію `dist/`.
5. Відкрийте сторінку ASUS-роутера та авторизуйтеся.
6. Натисніть іконку розширення.
7. У діалозі на сторінці виберіть `Clients` або `Networks`.

Після нової збірки натисніть **Reload** на картці розширення та оновіть вкладку роутера.

## Перевірки

Повний локальний pipeline:

```bash
npm run check
```

Команда послідовно виконує:

1. ESLint;
2. перевірку Prettier;
3. unit і component tests;
4. TypeScript typecheck;
5. production build;
6. перевірку browser bundle на Node-only `process.env`.

Окремі команди:

```bash
npm run lint
npm run lint:fix
npm run format
npm run format:check
npm run test
npm run typecheck
npm run build
npm run verify:bundle
```

## Архітектура

```text
клік по іконці розширення
  └── background service worker
        ├── програмно підключає content bundle до активної вкладки
        └── надсилає типізовану команду open-dialog
              └── content bridge створює один ShadowRoot
                    └── DialogRouter
                          ├── початкове меню вибору
                          ├── ClientsView
                          └── NetworksView
```

Content bridge створює Shadow DOM host, додає ізольовані стилі та монтує в ньому `DialogRouter`. `DialogRouter` зберігає спільні `<dialog>`, header і навігацію. Під час перемикання розмонтовується лише неактивний view із відповідним polling hook.

Основні директорії:

```text
src/
├── background/           # обробка кліку по іконці та ін'єкція content bundle
├── content/              # bridge для типізованих команд service worker
├── features/
│   ├── clients/
│   │   ├── api/          # запити та парсинг відповідей ASUS
│   │   ├── hooks/        # polling клієнтів і їхнього трафіку
│   │   ├── model/        # типи та розрахунки трафіку
│   │   └── ui/           # ClientsView і графіки клієнтів
│   ├── dialog/
│   │   └── ui/           # mount, router, header і навігація
│   └── networks/
│       ├── api/           # запити мережевого трафіку
│       ├── hooks/         # polling мережевих інтерфейсів
│       ├── model/         # конфігурація, типи та перетворення даних
│       └── ui/            # NetworksView і графіки мереж
├── shared/               # polling-хук, форматування та SVG helpers
└── test/                 # спільне тестове налаштування
```

## Потік даних

```text
fetch raw ASUS response
→ normalize
→ JSON parse
→ traffic transformation
→ local polling hook state
→ React render
```

Спільний polling-хук виконує запити послідовно кожні 2 секунди, робить один повтор після помилки та скасовує активний запит через `AbortController` під час розмонтування view. Запити не накладаються один на одного.

Для розрахунку швидкості поточні накопичувальні лічильники порівнюються з попереднім вимірюванням. Історія кожного графіка обмежена 30 точками.

## ASUS endpoints

Розширення звертається лише до origin активної сторінки роутера:

- `update_clients.asp` — інформація про клієнтів;
- `getTraffic.asp` — трафік клієнтів;
- `update.cgi` з `output=netdev` — трафік мережевих інтерфейсів.

Формат відповідей може відрізнятися між моделями та версіями прошивки ASUS. Парсери нормалізують JavaScript-подібні відповіді, розбирають їх через `JSON.parse` і перетворюють лічильники на числа без окремої runtime-валідації схеми. Несумісний формат відповіді може спричинити помилку запиту або некоректні числові значення.

## Дозволи

Manifest використовує лише:

- `activeTab` — тимчасовий доступ до вкладки після дії користувача;
- `scripting` — програмне підключення content bundle.

Manifest V3 background service worker запускається Chrome за потреби, зокрема після натискання на іконку розширення. Він ін'єктує content bundle в активну вкладку та надсилає команду відкриття діалогу, але не працює постійно.

Розширення не виконує код із відповідей роутера та не надсилає дані до сторонніх сервісів. Chrome забороняє ін'єкцію на системних сторінках на кшталт `chrome://` і Chrome Web Store; у такому разі іконка показує badge `ERR`.
