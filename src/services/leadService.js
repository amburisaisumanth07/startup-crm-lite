/**
 * @fileoverview leadService.js — Lead management API calls for the CRM.
 *
 * All functions use the shared `api` Axios instance so:
 *  - The JWT token is injected automatically on every request.
 *  - 401 responses redirect to /login automatically.
 *  - Network errors show a global toast notification.
 *
 * Functions return `response.data` directly (unwrapped from the Axios envelope)
 * so LeadContext consumers receive clean data objects.
 *
 * Expected backend routes:
 *   GET    /api/leads                  → { leads, pagination }
 *   POST   /api/leads                  → { lead }
 *   PUT    /api/leads/:id              → { lead }
 *   PATCH  /api/leads/:id/status       → { lead }
 *   DELETE /api/leads/:id              → { message }
 *   GET    /api/leads/stats/summary    → { stats }
 *   GET    /api/leads/stats/monthly    → { monthly }
 */

import api from './api';

// ─── Service Functions ────────────────────────────────────────────────────────

/**
 * Fetches a paginated, filtered list of leads.
 *
 * The backend accepts optional query parameters via the `params` object.
 * Axios serialises the params object into query string format automatically.
 *
 * @param {{ status?: string, search?: string, page?: number, limit?: number, source?: string, sortBy?: string }} [params]
 *   - Optional filter/pagination parameters. All fields are optional.
 * @returns {Promise<{ leads: Lead[], pagination: { page: number, totalPages: number, total: number } }>}
 *
 * @example
 *   const data = await getLeads({ status: 'Won', page: 2 });
 */
export async function getLeads(params = {}) {
  const response = await api.get('/api/leads', { params });
  return response.data;
}

/**
 * Creates a new lead record.
 *
 * @param {object} leadData - The full lead payload (name, company, email, etc.)
 * @returns {Promise<{ lead: Lead }>}
 *
 * @throws Will throw if the backend returns 400 validation errors.
 */
export async function createLead(leadData) {
  const response = await api.post('/api/leads', leadData);
  return response.data;
}

/**
 * Replaces/updates an existing lead record by its ID.
 *
 * @param {string} id - The unique identifier of the lead to update
 * @param {object} leadData - Partial or full lead payload with updated fields
 * @returns {Promise<{ lead: Lead }>}
 *
 * @throws Will throw if the lead is not found (404) or validation fails (400).
 */
export async function updateLead(id, leadData) {
  const response = await api.put(`/api/leads/${id}`, leadData);
  return response.data;
}

/**
 * Updates only the `status` field of a lead (lightweight PATCH).
 *
 * Using PATCH instead of PUT avoids sending the entire lead payload just
 * to change one field — important for the Kanban-style status drag-and-drop.
 *
 * @param {string} id     - The unique identifier of the lead
 * @param {string} status - The new status value (e.g. 'Won', 'Lost', 'New')
 * @returns {Promise<{ lead: Lead }>}
 */
export async function updateLeadStatus(id, status) {
  const response = await api.patch(`/api/leads/${id}/status`, { status });
  return response.data;
}

/**
 * Permanently deletes a lead record.
 *
 * @param {string} id - The unique identifier of the lead to delete
 * @returns {Promise<{ message: string }>}
 *
 * @throws Will throw if the lead is not found (404).
 */
export async function deleteLead(id) {
  const response = await api.delete(`/api/leads/${id}`);
  return response.data;
}

/**
 * Retrieves aggregated pipeline statistics (totals per status, total value, etc.)
 *
 * Used by the Dashboard to populate KPI cards and the Analytics page.
 *
 * @returns {Promise<object>} Stats object — shape depends on backend implementation
 */
export async function getLeadStats() {
  const response = await api.get('/api/leads/stats');
  return response.data;
}

/**
 * Retrieves monthly lead creation and deal-closure time-series data.
 *
 * Used by the Analytics page to render trend charts.
 *
 * @returns {Promise<object[]>} Array of monthly data points
 */
export async function getMonthlyStats() {
  const response = await api.get('/api/leads/monthly-stats');
  return response.data;
}
