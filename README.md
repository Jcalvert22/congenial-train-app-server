# All-Around Athlete MVC SPA

Rebuilt from scratch for **CIS 486 · Spring 2026** to meet the full-stack MVC SPA requirements. The project ships a web-based routine planner that stores data in MongoDB, exposes a RESTful Express API, and renders a Bootstrap + jQuery single-page experience.

## 🧱 Architecture & Stack

- **Frontend (View / SPA):** Normalize.css, Bootstrap 5, jQuery, jQuery UI, custom CSS in `styles/main.css`, single-page interactions powered by AJAX.
- **Controller Layer:** Express routers + controllers in `src/controllers` orchestrate CRUD operations.
- **Model Layer:** MongoDB via Mongoose models in `src/models` with validation rules.
- **Server:** Node.js 20, Express middlewares (helmet, cors, morgan), dotenv config, SPA fallback route.
- **Tooling:** nodemon for dev hot reload, GitHub Actions CI, Render dev deployment config, Dockerfile + GCP notes for production.

## ✨ Features

- SPA interface that demonstrates **create, read, update, delete** directly against the REST API using POST, GET, PUT, DELETE.
- MVC directory layout with separated models, controllers, routes, middleware, and utilities.
- Persistent MongoDB storage (connection string provided via `MONGODB_URI`).
- Health endpoint at `/health` and structured error handling.
- Authorship + self-describing UI copy baked into the page header and footer.
- Deployment scaffolding for Render (dev) and GCP (prod) plus CI/CD workflow.

## 🚀 Getting Started

1. **Install dependencies**
	 ```bash
	 npm install
	 ```
2. **Environment**
	 - Copy `.env.example` to `.env` and fill in:
		 ```ini
		 PORT=3000
		 MONGODB_URI=mongodb://127.0.0.1:27017/allaroundathlete_dev
		 ```
3. **MongoDB**
	 - Run a local Mongo instance (Docker example):
		 ```bash
		 docker run --name mongo -p 27017:27017 -d mongo:7
		 ```
4. **Development server**
	 ```bash
	 npm run dev
	 ```
5. **Production build**
	 ```bash
	 npm start
	 ```

## 📡 REST API

| Method | Endpoint           | Description              |
| ------ | ------------------ | ------------------------ |
| GET    | `/api/routines`    | List routines            |
| POST   | `/api/routines`    | Create routine           |
| PUT    | `/api/routines/:id`| Update routine           |
| DELETE | `/api/routines/:id`| Delete routine           |

Payload example:

```json
{
	"title": "Upper Push Flow",
	"focusArea": "Chest",
	"equipment": "Dumbbells",
	"intensity": "Steady",
	"sessionsPerWeek": 3,
	"notes": "Slow tempo and breathe." 
}
```

## 🧪 Testing & CI/CD

- `npm test` runs Node's native test runner over files in `tests/` (see `tests/health.test.js`).
- `.github/workflows/ci.yml` installs dependencies, runs lint placeholder + tests on pushes/PRs targeting `main`.

## ☁️ Deployment

| Target    | Location                | Notes |
| --------- | ----------------------- | ----- |
| Dev       | `render.yaml`           | Deploy via Render web service (Node). |
| Prod      | `Dockerfile`, `infra/gcp-deployment.md` | Container for Cloud Run / GCE with static IP + domain mapping instructions. |

### Render

1. Create a new **Render Web Service** from this repo.
2. Set build command `npm install` and start command `npm run start` (already captured in `render.yaml`).
3. Add `MONGODB_URI` as an environment variable.

### GCP + Static External IP

- Build + push the Docker image using Cloud Build.
- Deploy to Cloud Run (or GCE) with `gcloud run deploy ...` using the reserved static IP detailed in `infra/gcp-deployment.md`.
- Map `spa.yourdomain.com` through Cloud DNS to the static IP.

## 📁 Project Layout

```
src/
	app.js             Express config + SPA fallback
	server.js          Entry point with Mongo connection
	config/db.js       Mongoose connection helper
	controllers/       MVC controller layer
	models/            Mongoose schemas
	routes/            REST routers
	middleware/        Error + notFound handlers
public/
	index.html         Bootstrap + jQuery SPA
	scripts/app.js     Front-end logic with CRUD calls
styles/main.css      Custom theme layered on Bootstrap
render.yaml          Render PaaS definition
Dockerfile           Production container (GCP)
infra/gcp-deployment.md  Static IP + DNS guide
```

## 👤 Authorship & License

- Authored by **Jace Calvert** for the CIS 486 DevOps/MVC assignment.
- Licensed under the MIT License (see `package.json`).

---

Questions, issues, or grading clarifications? Open an issue or leave PR feedback on GitHub.