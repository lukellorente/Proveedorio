# Guía técnica y de configuración

Detalles de configuración, secretos y operación del stack. Para una visión general del proyecto, consulta el [README](../README.md).

## Variables de entorno (.env)

Parte de `.env.example` (`cp .env.example .env`). Mínimo recomendado para local:

| Variable | Descripción |
| --- | --- |
| `SPRING_DATASOURCE_URL` | `jdbc:mariadb://mariadb-local:3306/inventariodb?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC` |
| `SPRING_DATASOURCE_USERNAME` | Usuario de base de datos (`inventario`) |
| `SPRING_DATASOURCE_PASSWORD` | Contraseña de base de datos |
| `APP_SECURITY_SECRET_KEY` | Clave AES (16, 24 o 32 caracteres) |
| `JWT_SECRET_KEY` | Clave de firma JWT (mínimo 32 caracteres) |
| `VAULT_DEV_ROOT_TOKEN_ID` | Token root de Vault en modo dev |
| `VAULT_TOKEN` | Token con el que el backend lee de Vault |
| `GF_SECURITY_ADMIN_USER` | Usuario admin de Grafana |
| `GF_SECURITY_ADMIN_PASSWORD` | Contraseña admin de Grafana |

Opcionales (valores inyectados en el build del frontend):

- `VITE_GRAFANA_DASHBOARD_URL`
- `VITE_PROMETHEUS_DASHBOARD_URL`

## Vault y secretos

El backend lee sus secretos desde Vault (`spring.config.import=vault://`). Flujo:

1. `.env` define `SPRING_DATASOURCE_PASSWORD`, `APP_SECURITY_SECRET_KEY` y `JWT_SECRET_KEY`.
2. El contenedor `vault-init` escribe esos secretos en `secret/inventario`.
3. El backend arranca con `VAULT_TOKEN` y los consume desde Vault.

> Vault corre en modo dev, pensado solo para laboratorio/local.

## Servicios y puertos

| Servicio | URL |
| --- | --- |
| Frontend | http://localhost:8081 |
| Backend (health) | http://localhost:8080/actuator/health |
| Grafana | http://localhost:3000 |
| Prometheus | http://localhost:9090 |
| Vault | http://localhost:8200 |
| APIs simuladas de proveedores | http://localhost:3001 – 3004 |

## Logs y datos

- Logs de backend: `logs/backend/`
- Logs de frontend: `logs/frontend/`
- MariaDB y Grafana usan volúmenes Docker: `mariadb_data`, `grafana_data`

## Reverse proxy (producción)

La app usa la base relativa `/api/v1`. En un proxy reverso:

- `/` → frontend
- `/api` → backend

Para el despliegue completo (Proxmox, proxy, DB externa) consulta [infra/despliegue.md](../infra/despliegue.md) y [infra/deploy-proxmox.md](../infra/deploy-proxmox.md).

## Mapeo de campos de proveedores

Cómo se traducen los JSON de cada proveedor al modelo interno: [backend/PROVIDER_FIELD_MAPPING_GUIDE.md](../backend/PROVIDER_FIELD_MAPPING_GUIDE.md).

## CI/CD

Workflows de GitHub Actions por carpeta (build, tests y publicación de imágenes en GHCR):

- `backend/.github/workflows/ci.yml` y `docker-publish.yml`
- `frontend/.github/workflows/ci.yml` y `docker-publish.yml`

## Comandos útiles

```bash
docker compose ps
docker compose logs -f backend
docker compose logs -f frontend
docker compose down
```
