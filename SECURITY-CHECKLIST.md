# Security Checklist — Pre-Deployment

> Este checklist debe ejecutarse automáticamente en CI/CD (`.github/workflows/security-check.yml`)
> y también manualmente antes de cada deploy a producción.

---

## 1. Authentication & Authorization

- [ ] JWT tokens expiran en 15 minutos (access) y 7 días (refresh)
- [ ] Refresh tokens se rotan en cada uso
- [ ] JWT `jti` se agrega a blacklist en logout
- [ ] Todas las rutas protegidas requieren token válido
- [ ] RBAC validado en servidor para cada endpoint
- [ ] Multi-tenancy aislado por `orgId` y `workspaceId`

## 2. Input Validation

- [ ] Todos los inputs validados con Zod en servidor
- [ ] Prepared statements / Drizzle ORM — sin SQL concatenado
- [ ] Tamaño máximo de payload definido para cada endpoint
- [ ] Sanitización de HTML en entradas de usuario

## 3. Data Protection

- [ ] Secrets cifrados con AES-256-GCM
- [ ] PII identificado y manejado según política
- [ ] TLS 1.3 habilitado, TLS 1.0/1.1 deshabilitado
- [ ] HSTS con `max-age=63072000; includeSubDomains; preload`
- [ ] Encryption key válida (64 hex chars)

## 4. HTTP Security Headers

- [ ] Content-Security-Policy presente y restrictiva
- [ ] X-Content-Type-Options: nosniff
- [ ] X-Frame-Options: DENY
- [ ] Referrer-Policy: strict-origin-when-cross-origin
- [ ] Permissions-Policy restrictiva
- [ ] `poweredByHeader: false` en Next.js

## 5. Rate Limiting

- [ ] Auth endpoints limitados (5/min)
- [ ] API general limitada (100/min read, 30/min write)
- [ ] Webhooks limitados (200/min)
- [ ] AI Copilot limitado (20/min)
- [ ] API Keys limitadas por key
- [ ] Sliding window implementado con Redis
- [ ] Headers de rate limit en respuestas

## 6. CORS

- [ ] CORS_ORIGINS definido y específico
- [ ] Sin origen comodín (`*`) con credentials
- [ ] Métodos HTTP mínimos necesarios

## 7. Webhook Security

- [ ] HMAC-SHA256 signature verification
- [ ] Replay attack prevention (webhook ID tracking)
- [ ] Payload size limit (256 KB)
- [ ] Timestamp validation (5 min tolerance)

## 8. API Keys

- [ ] Keys generadas con criptografía segura (32+ bytes random)
- [ ] Solo hash SHA-256 almacenado en DB
- [ ] Scopes implementados (read/write/admin)
- [ ] Revocación funcional
- [ ] Rate limiting por key

## 9. WebSocket

- [ ] Autenticación JWT en handshake
- [ ] Aislamiento por orgId/workspaceId
- [ ] Rate limiting por conexión
- [ ] Heartbeat con ping/pong

## 10. AI Copilot

- [ ] API calls desde servidor (nunca desde browser)
- [ ] PII redactado antes de enviar a OpenAI/Anthropic
- [ ] Output validado con Zod antes de mostrar al usuario

## 11. Dependency Security

- [ ] `pnpm audit` pasa sin critical/high vulnerabilities
- [ ] Dependabot configurado (weekly)
- [ ] SBOM generado y almacenado

## 12. Logging & Monitoring

- [ ] Sin PII en logs
- [ ] Logs de autenticación (éxito/fallo)
- [ ] Logs de autorización (permisos denegados)
- [ ] Logs de rate limiting excedido
- [ ] Sentry configurado con PII stripping

## 13. Environment

- [ ] `NODE_ENV=production`
- [ ] `NEXT_PUBLIC_APP_URL` usa HTTPS
- [ ] `JWT_ACCESS_SECRET` y `JWT_REFRESH_SECRET` únicos y fuertes
- [ ] `ENCRYPTION_KEY` de 64 hex chars
- [ ] Variables secretas no expuestas al client-side

## 14. Infrastructure

- [ ] Base de datos no expuesta públicamente
- [ ] Redis requiere autenticación
- [ ] Puertos de admin no expuestos
- [ ] Contenedores no corren como root

## 15. Compliance

- [ ] `security.txt` accesible en `/.well-known/security.txt`
- [ ] Changelog registra cambios de seguridad
- [ ] Política de seguridad documentada en SECURITY.md
