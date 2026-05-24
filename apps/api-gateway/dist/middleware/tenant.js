export function attachTenant(req, _res, next) {
    req.tenantId = req.auth?.tenantId ?? req.header("x-tenant-id") ?? undefined;
    next();
}
