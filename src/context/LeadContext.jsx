/**
 * @fileoverview LeadContext.jsx — Global state management for CRM lead records.
 *
 * BREAKING CHANGE FROM PREVIOUS VERSION:
 *  - localStorage persistence has been REMOVED. Lead data now lives on the
 *    Express / MongoDB backend and is fetched via `leadService.js`.
 *  - The `useLocalStorage` hook is no longer imported.
 *  - All CRUD operations are now asynchronous (they call the API and update
 *    React state only when the server confirms success).
 *
 * State shape:
 *  - leads      → array of Lead objects from the server
 *  - activities → kept in-memory (derived from backend data; generated locally
 *                 for now to avoid breaking existing UI components)
 *  - isLoading  → true while any API call is in-flight
 *  - pagination → { page, totalPages, total } from the last getLeads response
 *
 * Lead object shape (mirrors MongoDB document):
 * @typedef {Object} Lead
 * @property {string}  _id          - MongoDB ObjectId string (backend primary key)
 * @property {string}  id           - Alias for _id — set during normalisation so
 *                                    existing components using lead.id still work
 * @property {string}  name         - Full name of the lead contact
 * @property {string}  company      - Company / organisation name
 * @property {string}  email        - Contact email address
 * @property {string}  phone        - Contact phone number
 * @property {number}  value        - Estimated deal value in USD
 * @property {'New'|'Contacted'|'Meeting Scheduled'|'Proposal Sent'|'Won'|'Lost'} status
 * @property {'Website'|'Referral'|'LinkedIn'|'Cold Call'|'Email Campaign'|'Other'} source
 * @property {string}  owner        - Team member responsible for this lead
 * @property {string}  lastContacted - ISO 8601 date-time of last contact
 * @property {string}  createdAt    - ISO 8601 date-time when the lead was created
 * @property {string}  [notes]      - Optional free-text notes
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import * as leadService from '../services/leadService';

// ─── Context Definition ───────────────────────────────────────────────────────

/** @type {React.Context<object|undefined>} */
const LeadContext = createContext(undefined);

// ─── Helper ───────────────────────────────────────────────────────────────────

/**
 * Normalises a lead object returned from the API so that existing UI components
 * that access `lead.id` continue to work without changes.
 *
 * MongoDB returns `_id` as the primary key. We add a convenience `id` alias
 * that mirrors `_id` so the entire component tree stays backward-compatible.
 *
 * @param {object} lead - Raw lead object from the API response
 * @returns {Lead}
 */
function normaliseLead(lead) {
  return {
    ...lead,
    // Provide `id` as a string alias for `_id` for backward compatibility
    id: lead._id ?? lead.id,
  };
}

/**
 * Extracts the first meaningful error message from an Axios error response.
 * Handles the common backend patterns:
 *  - { message: "..." }
 *  - { errors: [{ msg: "..." }] }
 *  - Plain string body
 *
 * @param {import('axios').AxiosError} error
 * @returns {string}
 */
function extractErrorMessage(error) {
  const data = error?.response?.data;
  if (!data) return error.message || 'An unexpected error occurred.';
  if (typeof data === 'string') return data;
  if (data.message) return data.message;
  if (Array.isArray(data.errors) && data.errors[0]?.msg) return data.errors[0].msg;
  return 'An unexpected error occurred.';
}

// ─── Provider ─────────────────────────────────────────────────────────────────

/**
 * LeadProvider supplies the lead data store and all CRUD operations to the
 * component tree via context. Data is now fetched from the Express API;
 * there is no localStorage persistence for leads.
 *
 * @param {{ children: React.ReactNode }} props
 * @returns {React.JSX.Element}
 */
export function LeadProvider({ children }) {
  /** @type {[Lead[], Function]} */
  const [leads, setLeads] = useState([]);

  /**
   * In-memory activity log — keeps the activity feed UI working without a
   * dedicated backend endpoint. Activities are generated locally when CRUD
   * operations succeed (mirroring the previous localStorage implementation).
   *
   * @type {[object[], Function]}
   */
  const [activities, setActivities] = useState([]);

  /** True while any API call is in-flight. */
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Pagination metadata from the most recent `fetchLeads` call.
   * @type {[{ page: number, totalPages: number, total: number }, Function]}
   */
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  // ─── Activity Logger ────────────────────────────────────────────────────────

  /**
   * Appends a new entry to the in-memory activity log (capped at 50 entries).
   *
   * @param {string} leadId
   * @param {string} leadName
   * @param {'lead_created'|'status_change'|'note_added'|'value_updated'} type
   * @param {string} content
   */
  const logActivity = useCallback((leadId, leadName, type, content) => {
    const newActivity = {
      id: `act-${crypto.randomUUID ? crypto.randomUUID() : Date.now()}`,
      leadId,
      leadName,
      type,
      content,
      timestamp: new Date().toISOString(),
    };
    setActivities((prev) => [newActivity, ...prev].slice(0, 50));
  }, []);

  // ─── CRUD Operations ────────────────────────────────────────────────────────

  /**
   * Fetches leads from the backend API with optional filter/pagination params.
   *
   * Updates `leads`, `pagination`, and `isLoading`.
   * Shows an error toast if the request fails.
   *
   * @param {{ status?: string, search?: string, page?: number, source?: string }} [params]
   * @returns {Promise<void>}
   */
  const fetchLeads = useCallback(async (params = {}) => {
    setIsLoading(true);
    try {
      const data = await leadService.getLeads(params);

      // Normalise all leads so that `lead.id` works for legacy components
      // Backend returns { data: [], pagination } — fall back to .leads then raw array
      const rawLeads = data.data ?? data.leads ?? data;
      const normalisedLeads = Array.isArray(rawLeads) ? rawLeads.map(normaliseLead) : [];
      setLeads(normalisedLeads);

      // Update pagination only when the backend provides it
      if (data.pagination) {
        setPagination(data.pagination);
      }
    } catch (error) {
      toast.error(extractErrorMessage(error) || 'Failed to load leads.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Creates a new lead via the API and prepends it to the local `leads` array.
   *
   * Shows a success toast on completion and an error toast on failure.
   *
   * @param {object} leadData - Lead fields to submit (excluding id/timestamps)
   * @returns {Promise<void>}
   */
  const addLead = useCallback(async (leadData) => {
    setIsLoading(true);
    try {
      const data = await leadService.createLead(leadData);
      const newLead = normaliseLead(data.lead ?? data);

      // Prepend so the new lead appears at the top of the list
      setLeads((prev) => [newLead, ...prev]);

      logActivity(
        newLead.id,
        newLead.name,
        'lead_created',
        `Lead added with deal value $${Number(newLead.value).toLocaleString()}`
      );

      toast.success('Lead created successfully!', {
        style: {
          border: '1px solid #22C55E',
          padding: '12px',
          color: 'var(--text-main)',
          background: 'var(--bg-surface)',
        },
        iconTheme: { primary: '#22C55E', secondary: '#FFF' },
      });
    } catch (error) {
      toast.error(extractErrorMessage(error) || 'Failed to create lead.');
    } finally {
      setIsLoading(false);
    }
  }, [logActivity]);

  /**
   * Updates an existing lead via the API and merges the returned data into
   * the local `leads` array.
   *
   * @param {string} id          - Lead ID to update
   * @param {object} updatedFields - Partial or full lead data
   * @returns {Promise<void>}
   */
  const updateLead = useCallback(async (id, updatedFields) => {
    setIsLoading(true);
    try {
      const data = await leadService.updateLead(id, updatedFields);
      const updatedLead = normaliseLead(data.lead ?? data);

      setLeads((prev) =>
        prev.map((lead) => (lead.id === id ? updatedLead : lead))
      );

      // Log discrete change events (mirrors previous localStorage behaviour)
      const oldLead = leads.find((l) => l.id === id);
      if (oldLead) {
        if (updatedFields.status && updatedFields.status !== oldLead.status) {
          logActivity(id, oldLead.name, 'status_change',
            `Status updated from ${oldLead.status} to ${updatedFields.status}`);
        }
        if (updatedFields.value !== undefined && Number(updatedFields.value) !== oldLead.value) {
          logActivity(id, oldLead.name, 'value_updated',
            `Deal value updated from $${oldLead.value?.toLocaleString()} to $${Number(updatedFields.value).toLocaleString()}`);
        }
        if (updatedFields.notes !== undefined && updatedFields.notes !== oldLead.notes) {
          logActivity(id, oldLead.name, 'note_added',
            `Notes updated: "${String(updatedFields.notes).slice(0, 30)}${updatedFields.notes.length > 30 ? '...' : ''}"`);
        }
      }

      toast.success('Lead details updated.', {
        style: {
          border: '1px solid #22C55E',
          padding: '12px',
          color: 'var(--text-main)',
          background: 'var(--bg-surface)',
        },
        iconTheme: { primary: '#22C55E', secondary: '#FFF' },
      });
    } catch (error) {
      toast.error(extractErrorMessage(error) || 'Failed to update lead.');
    } finally {
      setIsLoading(false);
    }
  }, [leads, logActivity]);

  /**
   * Permanently deletes a lead via the API and removes it from local state.
   *
   * @param {string} id - Lead ID to delete
   * @returns {Promise<void>}
   */
  const deleteLead = useCallback(async (id) => {
    setIsLoading(true);
    try {
      const leadToDelete = leads.find((l) => l.id === id);
      await leadService.deleteLead(id);

      setLeads((prev) => prev.filter((lead) => lead.id !== id));

      if (leadToDelete) {
        logActivity(id, leadToDelete.name, 'status_change', 'Lead removed from database');
      }

      toast.error('Lead record deleted.', {
        style: {
          border: '1px solid #EF4444',
          padding: '12px',
          color: 'var(--text-main)',
          background: 'var(--bg-surface)',
        },
        iconTheme: { primary: '#EF4444', secondary: '#FFF' },
      });
    } catch (error) {
      toast.error(extractErrorMessage(error) || 'Failed to delete lead.');
    } finally {
      setIsLoading(false);
    }
  }, [leads, logActivity]);

  /**
   * Returns a single lead by its ID from the current in-memory store.
   * Does NOT make a network request — use `fetchLeads` to refresh data first.
   *
   * @param {string} id
   * @returns {Lead|undefined}
   */
  const getLeadById = useCallback((id) => {
    return leads.find((lead) => lead.id === id);
  }, [leads]);

  // ─── Context Value ─────────────────────────────────────────────────────────

  return (
    <LeadContext.Provider
      value={{
        leads,
        activities,
        isLoading,
        pagination,
        fetchLeads,
        addLead,
        updateLead,
        deleteLead,
        getLeadById,
      }}
    >
      {children}
    </LeadContext.Provider>
  );
}

// ─── Custom Hook ──────────────────────────────────────────────────────────────

/**
 * Custom hook to consume LeadContext.
 *
 * Must be called from within a `<LeadProvider>` component tree.
 * Throws a descriptive error outside the provider boundary.
 *
 * @returns {{
 *   leads: Lead[],
 *   activities: object[],
 *   isLoading: boolean,
 *   pagination: object,
 *   fetchLeads: Function,
 *   addLead: Function,
 *   updateLead: Function,
 *   deleteLead: Function,
 *   getLeadById: Function,
 * }}
 *
 * @throws {Error} When called outside of a `<LeadProvider>`
 */
export function useLeads() {
  const context = useContext(LeadContext);
  if (context === undefined) {
    throw new Error(
      '[useLeads] This hook must be called inside a <LeadProvider> component. ' +
      'Wrap your application (or the relevant subtree) with <LeadProvider> to fix this error.'
    );
  }
  return context;
}

export { LeadContext };
