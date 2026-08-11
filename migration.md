# План оптимізації runtime і bundle

## Мета

Зменшити production bundle Chrome-розширення без зміни його поведінки:

- діалоги `Clients` і `Networks` відкриваються з іконки розширення;
- дані оновлюються кожні 2 секунди;
- запити не накладаються один на одного;
- після помилки виконується одна повторна спроба;
- активні запити скасовуються під час перемикання view або закриття діалогу;
- UI залишається ізольованим через Shadow DOM.

## Поточний стан

Runtime-залежності:

| Залежність | Потрапляє в extension bundle |
| ---------- | ---------------------------: |
| `preact`   |                           ✅ |

React, ReactDOM, TanStack Query і Zod уже видалені. Їх замінюють:

- Preact — UI runtime, hooks і JSX;
- `src/shared/usePollingQuery.ts` — polling, retry, стан і `AbortController`;
- `JSON.parse()` та перетворення через `Number()` — обробка відповідей ASUS без runtime-валідації схеми.

Build/test залежності (`Vite`, CRXJS, TypeScript, Vitest, Testing Library, ESLint, Prettier і `@types/*`) не потрапляють у production bundle. Видаляти їх заради розміру розширення не потрібно.

### Baseline

Останній перевірений production build:

```text
До оптимізації:  ≈ 209.8 KB raw / 65.8 KB gzip
Після фази 3:   ≈ 31.9 KB raw / 11.5 KB gzip
```

Фази 1–3 реалізовані й пройшли автоматичні перевірки. Для них залишається ручний smoke test у Chrome.

Перед кожною фазою потрібно повторно виконати `npm run build` і зафіксувати актуальні raw/gzip значення, оскільки hash і розмір bundle можуть змінюватися.

## Обов'язкові перевірки після кожної фази

```bash
npm run check
```

Додатковий ручний smoke test у Chrome:

1. Завантажити `dist/` як unpacked extension.
2. Відкрити й авторизуватися в адміністративному інтерфейсі ASUS.
3. Відкрити `Clients`, дочекатися кількох оновлень і перейти до `Networks`.
4. Переконатися, що таблиці та графіки оновлюються.
5. Закрити діалог і перевірити, що polling припинився.
6. Повторно відкрити діалог і перевірити відсутність дубльованого UI.

Не переходити до наступної фази, доки автоматичні й ручні перевірки поточної фази не пройдені.

---

## Фаза 1. Об'єднати компоненти графіків

### Причина

`ClientTrafficChart` і мережевий `TrafficChart` виконують однакову роботу: будують `inc`/`out` paths через `createSmoothChartPath` і рендерять чотири SVG paths. Відрізняються лише CSS-класи й `aria-label`.

### Зміни

1. Створити `src/shared/TrafficChart.tsx`.
2. Передавати через props:
   - `samples`;
   - `max`;
   - `className` або спільний CSS-клас;
   - `label`.
3. Замінити обидва feature-компоненти спільним компонентом.
4. Об'єднати однакові CSS-правила в `.traffic-chart`, `.traffic-chart-line` і `.traffic-chart-area`.
5. Залишити feature-specific modifiers лише для кольорів, якщо вони справді відрізняються.
6. Видалити старі компоненти після оновлення imports і тестів.

### Критерії приймання

- у коді залишився один компонент графіка;
- клієнтські та мережеві графіки мають попередні розміри, кольори й accessible labels;
- `npm run check` проходить;
- raw/gzip bundle не збільшився.

Очікуваний виграш невеликий. Основна користь — усунення дублювання перед зміною UI runtime.

---

## Фаза 2. Спростити монтування Shadow DOM

### Причина

Поточний `ShadowRoot` React-компонент використовує `useLayoutEffect`, локальний state і `createPortal`. Shadow DOM можна створити один раз безпосередньо в `mountDialog()` до виклику `createRoot()`.

### Цільова структура

```text
document.body
└── host#asus-router-dialog-root
    └── ShadowRoot
        ├── style
        └── mount container
            └── DialogRouter
```

### Важлива умова lifecycle

Потрібно зберігати саме зовнішній `host`, а не внутрішній mount container:

```ts
type MountedDialog = {
  host: HTMLElement;
  root: Root;
};
```

Під час демонтування:

```ts
mounted.root.unmount();
mounted.host.remove();
```

Інакше порожній host разом із Shadow DOM і стилями залишиться у `document.body`.

### Зміни

1. У `mountDialog()` створити host і додати його до `document.body`.
2. Викликати `host.attachShadow({ mode: 'open' })`.
3. Додати `<style>` з об'єднаними CSS imports.
4. Створити внутрішній mount container і викликати `createRoot(container)`.
5. Оновити `MountedDialog` та `unmountDialog()`.
6. Видалити `src/components/ShadowRoot/ShadowRoot.tsx`.
7. Оновити архітектурний опис у README.

### Критерії приймання

- `#asus-router-dialog-root` повністю зникає після `unmountDialog()`;
- повторне відкриття не створює кілька host-елементів;
- активний polling-запит скасовується;
- стилі залишаються ізольованими;
- `mountDialog.test.tsx` перевіряє cleanup;
- `npm run check` і ручний smoke test проходять.

Ця фаза не є технічною передумовою Preact: `preact/compat` підтримує portals. Її мета — спростити lifecycle перед міграцією.

---

## Фаза 3. React → Preact

**Статус:** реалізовано нативними Preact imports без compat aliases; автоматичні перевірки пройдені, ручний smoke test очікується.

### Причина

Після видалення TanStack Query застосунок використовує невеликий набір React API: hooks, JSX та `createRoot`. Preact є головним кандидатом на зменшення залишкового runtime overhead.

Розмір Preact core не можна напряму вважати фінальним розміром застосунку: bundle також міститиме hooks, JSX runtime і compat layer. Результат приймається лише після вимірювання фактичного raw/gzip bundle.

### 3.1. Встановити Preact

```bash
npm install preact
```

### 3.2. Обраний спосіб міграції

Замість compat aliases application imports переведені безпосередньо на `preact`, `preact/hooks` і `preact.render`. Це виключає compat layer із production bundle.

### 3.3. Налаштувати TypeScript

У `tsconfig.json` налаштовано нативний JSX runtime:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "preact"
  }
}
```

### 3.4. Налаштувати Vitest

`@testing-library/react` замінено на `@testing-library/preact`. Тести виконують application code через той самий Preact runtime, що й production build; aliases у Vitest не потрібні.

### 3.5. Видалити React

Виконано після успішних build, typecheck і тестів:

```bash
npm uninstall react react-dom @types/react @types/react-dom
```

У `package.json` серед runtime-залежностей має залишитися тільки `preact`.

### Критерії приймання

- у `package.json` немає `react` і `react-dom`;
- `npm ls react react-dom` не показує неочікуваних runtime-залежностей;
- production bundle не містить React/ReactDOM;
- TypeScript використовує Preact types;
- component tests виконуються на Preact runtime;
- `npm run check` проходить;
- ручний smoke test у Chrome проходить;
- raw і gzip bundle помітно менші за baseline.

Якщо Preact створює поведінкові проблеми або виграш несуттєвий, фазу потрібно відкотити окремо, не змішуючи її з build tuning.

Офіційна інструкція: [Aliasing React to Preact](https://preactjs.com/guide/v10/getting-started/#aliasing-react-to-preact).

---

## Фаза 4. Додати size report і budget

### Зміни

Розширити `scripts/verify-build.mjs`:

```js
import { readFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { resolve } from 'node:path';

const contentScriptPath = resolve('dist/src/content/index.js');
const content = await readFile(contentScriptPath);
const rawKb = content.byteLength / 1024;
const gzipKb = gzipSync(content).byteLength / 1024;

console.log(`Content bundle: ${rawKb.toFixed(1)} KB (${gzipKb.toFixed(1)} KB gzip)`);
```

Спочатку додати лише звіт. Після завершення Preact-міграції зафіксувати новий baseline і встановити budget із невеликим запасом:

```js
const MAX_GZIP_KB = /* виміряний baseline + приблизно 5% */;
```

Не встановлювати довільний ліміт `50 KB`, доки перевірений bundle фактично не вкладається в нього.

### Критерії приймання

- `npm run verify:bundle` показує raw і gzip розмір;
- перевірка `process.env` збережена;
- перевищення budget завершує команду з ненульовим exit code;
- поточний перевірений build проходить budget.

---

## Фаза 5. Окремі вимірювані build-експерименти

Ці зміни не входять до основної міграції. Кожну потрібно перевіряти окремим build і залишати лише за наявності вимірюваного виграшу без регресій.

### Terser

Vite 8 використовує Oxc для JS minification. Terser потенційно стискає приблизно на 0.5–2% краще, але працює повільніше.

```bash
npm install -D terser
```

```ts
build: {
  minify: 'terser',
},
```

Приймати зміну лише після порівняння raw/gzip і часу build. Якщо виграш не виправдовує нову залежність, залишити Oxc.

### Chromium-specific target

Якщо визначена мінімальна підтримувана версія Chrome, можна протестувати:

```ts
build: {
  target: 'chrome120',
},
```

Одночасно потрібно зафіксувати ту саму вимогу в manifest:

```ts
minimum_chrome_version: '120',
```

Не підвищувати target без продуктового рішення про припинення підтримки старіших Chromium-браузерів.

Офіційна документація: [Vite build options](https://vite.dev/config/build-options).

---

## Поза поточним scope

### IIFE → loader/chunks

Поточний content script програмно ін'єктується через `chrome.scripting.executeScript` і збирається як standalone IIFE з інлайненими imports. IIFE не обов'язково потрібен для UI після кліку, але перехід на стандартний CRXJS loader змінює спосіб завантаження generated files і може потребувати `web_accessible_resources`.

Це окремий архітектурний експеримент, а не гарантований спосіб зменшити ZIP/CRX. Code splitting може зменшити initial chunk, але не обов'язково загальний розмір `dist`.

Офіційна документація: [CRXJS content scripts](https://crxjs.dev/concepts/content/).

### `React.lazy()` / lazy loading

Lazy loading може зменшити initial JS, але всі chunks усе одно потраплять у package. Для KPI «загальний розмір extension» це низький пріоритет.

### PNG optimization

Іконки разом займають приблизно 7.7 KB. Їх оптимізація можлива, але потенційний виграш значно менший за зміну UI runtime.

---

## Порядок виконання

| Порядок | Зміна                             | Очікуваний ефект                   |
| ------: | --------------------------------- | ---------------------------------- |
|       1 | Спільний `TrafficChart` і CSS     | малий, менше дублювання            |
|       2 | Імперативний Shadow DOM mount     | малий, простіший lifecycle         |
|       3 | React/ReactDOM → Preact           | найбільший потенційний виграш      |
|       4 | Size report і реалістичний budget | захист від майбутніх регресій      |
|       5 | Окремий експеримент із Terser     | орієнтовно 0.5–2%                  |
|       6 | Узгоджений Chrome build target    | малий, залежить від browser policy |

IIFE/chunks, lazy loading та PNG optimization не блокують основну міграцію.

## Цільовий стан

```text
Chrome Extension
├── service worker
└── content IIFE
    ├── Preact
    ├── DialogRouter
    ├── shared TrafficChart
    ├── shared polling
    ├── Clients
    └── Networks
```

Успіх визначається не лише розміром bundle: усі автоматичні перевірки, cleanup lifecycle і реальна робота розширення в Chrome мають залишитися коректними.
