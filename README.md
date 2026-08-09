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
- ізоляція UI від стилів ASUS через Shadow DOM.

## Технології

- React 19;
- TypeScript;
- Vite і CRXJS;
- Manifest V3;
- TanStack Query;
- Zod;
- Vitest і React Testing Library;
- ESLint і Prettier.

## Вимоги

- Node.js `20.19+` або `22.12+`;
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
6. Натисніть іконку розширення й виберіть `clients` або `networks`.

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

Ручний сценарій перевірки описаний у [SMOKE_TEST.md](./SMOKE_TEST.md).

## Архітектура

```text
popup
  └── програмно підключає content bundle до активної вкладки
        └── content bridge приймає типізовану команду
              ├── монтує Clients у власний Shadow DOM
              └── монтує Networks у власний Shadow DOM
```

Основні директорії:

```text
src/
├── content/              # маршрутизація команд popup
├── features/
│   ├── clients/
│   │   ├── api/          # запити та parser-и ASUS
│   │   ├── hooks/        # TanStack Query polling
│   │   ├── model/        # типи та traffic calculations
│   │   └── ui/           # React UI і Shadow DOM mount
│   └── networks/
│       ├── api/
│       ├── hooks/
│       ├── model/
│       └── ui/
├── popup/                # React popup
├── shared/               # форматування та SVG chart helpers
└── test/                 # спільне тестове налаштування
```

## Потік даних

```text
fetch raw ASUS response
→ normalize
→ JSON parse
→ Zod validation
→ traffic transformation
→ TanStack Query cache
→ React render
```

Для розрахунку швидкості поточні накопичувальні лічильники порівнюються з попереднім вимірюванням. Історія кожного графіка обмежена 30 точками.

## ASUS endpoints

Розширення звертається лише до origin активної сторінки роутера:

- `update_clients.asp` — інформація про клієнтів;
- `getTraffic.asp` — трафік клієнтів;
- `update.cgi` з `output=netdev` — трафік мережевих інтерфейсів.

Формат відповідей може відрізнятися між моделями та версіями прошивки ASUS. Parser-и перевіряють нормалізовані дані через Zod і показують контрольовану помилку, якщо формат не підтримується.

## Дозволи

Manifest використовує лише:

- `activeTab` — тимчасовий доступ до вкладки після дії користувача;
- `scripting` — програмне підключення content bundle.

Розширення не має background service worker, не виконує код із відповідей роутера та не надсилає дані до сторонніх сервісів.

## Додаткова документація

- [MIGRATION_PLAN.md](./MIGRATION_PLAN.md) — план і статус міграції;
- [SMOKE_TEST.md](./SMOKE_TEST.md) — ручна перевірка production-збірки.
