import { createApplication, listApplications } from '../services/application.service.js';
export function create(body) { const entry = createApplication(body); return { ok: true, id: entry.id }; }
export function list() { return listApplications(); }
