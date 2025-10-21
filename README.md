# Bygge webapplikationer med Node.js

> Mini-Express-app med klar mappestruktur, middleware (logging, 404, error), validering, enkle routes, fil-download og test med Postman/curl.

## Krav

- Node.js v18+ og npm
- Postman eller curl

## Installation

```bash
npm install
```

## Kørsel

```bash
npm run dev
```
Appen starter på: **http://localhost:3000/**

---

## Indhold

- [Mappeoversigt](#mappeoversigt)
- [Fil for fil](#fil-for-fil)
- [HTTP-endpoints](#http-endpoints)
- [Request-flow step for step](#request-flow-step-for-step)
- [Sekvensdiagrammer](#sekvensdiagrammer)
- [Statuskoder og fejlhåndtering](#statuskoder-og-fejlhåndtering)
- [Test med Postman](#test-med-postman)
- [Fejlfinding](#fejlfinding)
- [Udvidelser](#udvidelser)
- [Licens](#licens)

---

## Mappeoversigt

```text
project/
  server.js
  src/
    routes/
      index.js
      users.js
    controllers/
      homeController.js
      submitController.js
    middleware/
      logger.js
      validateUser.js
      notFound.js
      errorHandler.js
    services/
      userService.js
  public/
    404.html
    sample.txt
```

---

## Fil for fil

### `server.js`
**Formål:** Indgangspunkt for Express-appen.  
**Ansvar:**
- JSON-body parsing med `express.json()`
- Statiske filer fra `public/`
- Global request-logging (`logger`)
- Montere ruter: `/` og `/users`
- Sidste led: `notFound` og `errorHandler`
- Starte HTTP-server (PORT fra env eller 3000)

---

### `src/routes/index.js`
**Formål:** Ruter for rodområdet `/`.  
**Ansvar:**
- `GET /` → `homeController.getHome`

---

### `src/routes/users.js`
**Formål:** Ruter relateret til brugere og download.  
**Ansvar:**
- `POST /users/submit` → `validateUser` → `submitController.submitData`
- `GET /users` → `submitController.getUsers`
- `GET /users/download` → `submitController.downloadFile`

---

### `src/controllers/homeController.js`
**Formål:** Forside/healthcheck.  
**Ansvar:**
- `getHome(req, res)` → 200 med tekst/HTML

---

### `src/controllers/submitController.js`
**Formål:** Oprette/læse brugere og håndtere download.  
**Ansvar:**
- `submitData(req, res, next)`
    - Læser `{ name, email }`
    - (Demo) `if (name === 'boom') throw new Error(...)` for at udløse 500-flow
    - `userService.addUser(...)` → 201 med oprettet bruger
- `getUsers(req, res)` → 200 med liste
- `downloadFile(req, res, next)` → `res.download('public/sample.txt')`

---

### `src/services/userService.js`
**Formål:** Simpelt in-memory datalager + forretningslogik.  
**Ansvar:**
- `addUser(name, email)` → opretter brugerobjekt
- `listUsers()` → returnerer kopi af liste
> Kan senere udskiftes med fil/DB uden at ændre controllers.

---

### `src/middleware/logger.js`
**Formål:** Request/response-logging.  
**Ansvar:**
- Måler svartid og logger fx:  
  `POST /users/submit -> 201 (12ms)`

---

### `src/middleware/validateUser.js`
**Formål:** Inputvalidering til `POST /users/submit`.  
**Ansvar:**
- Tjekker at `name` og `email` findes + simpelt email-check
- Ved fejl: 400 `{ "error": "Ugyldigt input" }`
- Ellers `next()`

---

### `src/middleware/notFound.js`
**Formål:** Ukendte ruter.  
**Ansvar:**
- 404 med `public/404.html`

---

### `src/middleware/errorHandler.js`
**Formål:** Central fejlhåndtering.  
**Ansvar:**
- Logger fejlbeskeder server-side
- Returnerer 500 `{ "error": "Intern serverfejl" }`

---

### `public/404.html`
**Formål:** Simpel 404-side til ukendte ruter.

---

### `public/sample.txt`
**Formål:** Eksempelfil til download via `GET /users/download`.

---

## HTTP-endpoints

| Metode | Sti               | Beskrivelse                    | Body/Query               | Response |
|:------:|-------------------|--------------------------------|--------------------------|---------:|
| GET    | `/`               | Velkomst/healthcheck           | –                        | 200 tekst/HTML |
| POST   | `/users/submit`   | Opretter bruger                | JSON `{ name, email }`   | 201 JSON / 400 fejl |
| GET    | `/users`          | Returnerer brugerliste         | –                        | 200 JSON |
| GET    | `/users/download` | Downloader `public/sample.txt` | –                        | 200 fil |
| ANY    | `*`               | Ukendt rute                    | –                        | 404 HTML |
| –      | –                 | Fejl i pipeline                | –                        | 500 JSON |

---

## Request-flow step for step

> Nedenfor gennemgår vi den **fælles pipeline** og derefter hver route.

### Fælles pipeline (alle requests)

1. Klient sender HTTP-request til **http://localhost:3000/**
2. **Express** modtager request
3. Global middleware (i nævnte rækkefølge):
    - `express.json()` parser JSON-body (relevant for POST/PUT/PATCH)
    - `express.static('public')` for statiske filer
    - `logger` starter tidtagning
4. **Routing** matcher sti/metode og kalder route-handler → controller → service
5. Svar sendes → `logger` afslutter og logger status + tid
6. Ingen match? → `notFound` (404)
7. Fejl undervejs? → `errorHandler` (500)

---

### GET `/`

**Flow**
- Router `index.js` matcher → `homeController.getHome`
- Controller returnerer **200** med tekst/HTML

**Test med curl**
```bash
curl -i http://localhost:3000/
```

---

### POST `/users/submit`

**Flow**
1. `express.json()` parser `req.body`
2. `users.js` matcher route
3. **`validateUser`**:
    - mangler felter → **400** `{ "error": "Ugyldigt input" }`
    - ellers `next()`
4. **`submitController.submitData`**:
    - (Demo) `name === "boom"` → kast fejl → **500** via `errorHandler`
    - ellers `userService.addUser(...)` → **201** med oprettet bruger

**Test med curl**
```bash
# Gyldig
curl -i -X POST http://localhost:3000/users/submit   -H "Content-Type: application/json"   -d '{"name":"Leia","email":"leia@rebels.org"}'

# Ugyldig (mangler email)
curl -i -X POST http://localhost:3000/users/submit   -H "Content-Type: application/json"   -d '{"name":"Han"}'

# Bevidst fejl (trigger 500)
curl -i -X POST http://localhost:3000/users/submit   -H "Content-Type: application/json"   -d '{"name":"boom","email":"x@y.z"}'
```

---

### GET `/users`

**Flow**
- `users.js` matcher → `submitController.getUsers`
- **200** med JSON-liste (vokser efter flere POSTs)

**Test med curl**
```bash
curl -i http://localhost:3000/users
```

---

### GET `/users/download`

**Flow**
- `users.js` matcher → `submitController.downloadFile`
- Finder fil og returnerer **200** som download
- Evt. fejl → `next(err)` → **500** via `errorHandler`

**Test med curl**
```bash
curl -OJ http://localhost:3000/users/download
```

---

## Sekvensdiagrammer

> GitHub understøtter Mermaid. Diagrammerne giver et hurtigt overblik over flowet.

### Overblik (request lifecycle)


https://github.com/krollchristensen/uv4/blob/master/Overblik%20(request%20lifecycle).png

### POST `/users/submit`
https://github.com/krollchristensen/uv4/blob/master/POST%20userssubmit.png


## Statuskoder og fejlhåndtering

- **200 OK** – succesfulde GET
- **201 Created** – succesfuld oprettelse via POST
- **400 Bad Request** – validering fejlede
- **404 Not Found** – ukendt rute
- **500 Internal Server Error** – uventet fejl (central handler)

> **Tip:** Log detaljeret server-side, men returnér en **generisk** fejlbesked til klienten.

---

## Test med Postman

- [ ] Opret en **Collection** med:
    - `GET /`
    - `POST /users/submit` (gyldig + ugyldig body)
    - `GET /users`
- [ ] Gem **Examples** (succes + fejl) pr. endpoint
- [ ] (Valgfrit) Brug **Pre-request Script**/**Tests** til simple asserter

---

## Fejlfinding

- **`req.body` er tomt ved POST**  
  → Tjek at `app.use(express.json())` er registreret **før** ruter i `server.js`.

- **`GET /users/download` fejler**  
  → Tjek at `public/sample.txt` findes, og sti i `downloadFile` er korrekt.

- **Route matcher ikke**  
  → Bekræft at:  
  `app.use('/users', usersRoutes)` er i `server.js`, og at `module.exports = router` står i routerfilerne.

- **Ingen logs**  
  → Tjek at `app.use(logger)` er registreret **før** ruterne.

---

## Udvidelser

- Persistér data (JSON-fil/SQLite/MongoDB) i stedet for RAM
- Skema-validering (zod/joi) frem for simpel `includes('@')`
- Rate limiting, CORS og request-ID i logger
- Server-renderede views (EJS) eller SPA (React)
- `.env` konfiguration med `dotenv` (fx `PORT`)

---

## Licens

MIT (eller vælg en anden)

---

**Ressourcer**
- Node.js: http://nodejs.org/
- Express: http://expressjs.com/
- GitHub Markdown syntaks: http://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax
