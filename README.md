# Trip Pulse

Trip Pulse is a Django web application for creating and managing travel posts with images. It is designed as a production-ready backend project with containerized services, reverse proxying, secure HTTPS, and automated CI/CD deployment.

This project demonstrates a complete deployment workflow using Docker, Nginx, PostgreSQL, and GitHub Actions, deployed to a Google Cloud VM.

## Features

- User authentication (register, login, logout)
- Create, edit, and delete travel posts
- Upload and display post images
- Django admin panel for content management
- PostgreSQL database integration
- Static and media file handling
- Dockerized multi-service architecture
- Nginx reverse proxy for app traffic
- HTTPS via Let's Encrypt SSL certificates
- Automated lint, test, build, and deploy pipeline with GitHub Actions

## Technologies Used

### Backend
- Django 5
- Gunicorn
- PostgreSQL

### Infrastructure
- Docker
- Docker Compose
- Nginx
- Google Cloud Platform (VM)

### CI/CD
- GitHub Actions
- Docker Hub
- SSH deployment (`appleboy/ssh-action`)

### Testing and Code Quality
- pytest
- flake8
- black

### Security
- Let's Encrypt SSL
- UFW firewall

## Project Architecture

```text
User Browser
   |
   v
Nginx (Reverse Proxy)
   |
   v
Gunicorn
   |
   v
Django Application
   |
   v
PostgreSQL Database
```

Docker services:

- `web` -> Django + Gunicorn
- `db` -> PostgreSQL
- `nginx` -> Reverse proxy + static/media serving

## Local Setup Instructions

### 1. Clone repository

```bash
git clone https://github.com/<your-username>/trip-pulse.git
cd trip-pulse
```

### 2. Create and activate virtual environment

```bash
python -m venv venv
source venv/bin/activate
```

Windows (PowerShell):

```powershell
venv\Scripts\Activate.ps1
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Create local environment file

Create `.env.local` (or `.env` depending on your settings module usage):

```env
DEBUG=True
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=127.0.0.1,localhost
CSRF_TRUSTED_ORIGINS=http://127.0.0.1:8000,http://localhost:8000

DB_NAME=trip_pulse
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
```

### 5. Run migrations

```bash
python manage.py migrate
```

### 6. Create admin user

```bash
python manage.py createsuperuser
```

### 7. Start development server

```bash
python manage.py runserver
```

Open:

- App: <http://127.0.0.1:8000>
- Admin: <http://127.0.0.1:8000/admin>

## Docker Setup (Local)

```bash
docker compose up --build
```

Useful commands:

```bash
docker compose ps
docker compose down
```

## Deployment Instructions

Production deployment target: Google Cloud VM (Ubuntu).

### 1. Prepare VM

```bash
sudo apt update
sudo apt install -y docker.io docker-compose-plugin certbot
```

### 2. Clone repository on server

```bash
git clone https://github.com/<your-username>/trip-pulse.git
cd trip-pulse
```

### 3. Create production environment file

Create `.env.prod`:

```env
DEBUG=False
SECRET_KEY=your-strong-secret-key
ALLOWED_HOSTS=trip-pulse.uz,www.trip-pulse.uz
CSRF_TRUSTED_ORIGINS=https://trip-pulse.uz,https://www.trip-pulse.uz

DB_NAME=trip_pulse
DB_USER=postgres
DB_PASSWORD=strongpassword
DB_HOST=db
DB_PORT=5432
```

### 4. Start production containers

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
docker compose ps
```

### 5. Configure SSL certificates

```bash
sudo certbot certonly --standalone -d trip-pulse.uz -d www.trip-pulse.uz
```

Certificates path:

```text
/etc/letsencrypt/live/trip-pulse.uz/
```

These certs are mounted into the Nginx container to enable HTTPS.

## CI/CD Deployment Pipeline

On every push to `main`, `.github/workflows/deploy.yml` runs:

1. Checkout source code
2. Install Python dependencies
3. Run `black --check .`
4. Run `flake8 .`
5. Run `pytest` with PostgreSQL service
6. Build and push Docker image to Docker Hub
7. Connect to VM over SSH
8. Execute `deploy.sh` on server

## Environment Variables

| Variable | Required | Example | Description |
|---|---|---|---|
| `DEBUG` | Yes | `False` | Enables/disables Django debug mode |
| `SECRET_KEY` | Yes | `django-insecure-...` | Django cryptographic secret |
| `ALLOWED_HOSTS` | Yes | `trip-pulse.uz,www.trip-pulse.uz` | Comma-separated allowed hostnames |
| `CSRF_TRUSTED_ORIGINS` | Yes (prod) | `https://trip-pulse.uz` | Trusted origins for CSRF protection |
| `DB_NAME` | Yes | `trip_pulse` | PostgreSQL database name |
| `DB_USER` | Yes | `postgres` | PostgreSQL username |
| `DB_PASSWORD` | Yes | `strongpassword` | PostgreSQL password |
| `DB_HOST` | Yes | `db` | Database host (`db` in Docker, `localhost` local) |
| `DB_PORT` | Yes | `5432` | PostgreSQL port |

## Security Notes

- UFW firewall should allow only `22`, `80`, and `443`
- HTTPS is enabled via Let's Encrypt certificates
- Sensitive values are stored in `.env` files and GitHub Secrets
- Debug mode is disabled in production

## Screenshots of Running Application

Add your screenshots under `docs/screenshots/` and update these links:

- Home page: `docs/screenshots/home.png`
- Create post page: `docs/screenshots/create-post.png`
- Django admin: `docs/screenshots/admin.png`
- Running containers (`docker compose ps`): `docs/screenshots/containers.png`

Example markdown:

```md
![Home Page](docs/screenshots/home.png)
![Create Post](docs/screenshots/create-post.png)
![Django Admin](docs/screenshots/admin.png)
![Docker Containers](docs/screenshots/containers.png)
```

## Future Improvements

- Add user profile pages
- Implement comments and likes
- Improve UI/UX design
- Add automated database backups
- Integrate cloud storage for media files
- Add monitoring and logging stack

## Author

Dilshodbek Axmadov  
Westminster International University in Tashkent
