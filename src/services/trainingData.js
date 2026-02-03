/**
 * Training Data API Service
 * 
 * Handles CRUD operations for training data management.
 */

import { adminAuthService } from './adminAuth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class TrainingDataService {
    /**
     * Fetch all training examples
     */
    async fetchAll(limit = 1000) {
        const response = await fetch(`${API_BASE_URL}/api/training/examples?limit=${limit}`, {
            method: 'GET',
            headers: {
                ...adminAuthService.getAuthHeader(),
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to fetch training data');
        }

        return await response.json();
    }

    /**
     * Create a new training example
     */
    async create(question, sql) {
        const response = await fetch(`${API_BASE_URL}/api/training/examples`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...adminAuthService.getAuthHeader(),
            },
            body: JSON.stringify({ question, sql }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to create training example');
        }

        return await response.json();
    }

    /**
     * Update an existing training example
     */
    async update(id, question, sql) {
        const response = await fetch(`${API_BASE_URL}/api/training/examples/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...adminAuthService.getAuthHeader(),
            },
            body: JSON.stringify({ question, sql }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to update training example');
        }

        return await response.json();
    }

    /**
     * Delete a training example
     */
    async delete(id) {
        const response = await fetch(`${API_BASE_URL}/api/training/examples/${id}`, {
            method: 'DELETE',
            headers: {
                ...adminAuthService.getAuthHeader(),
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to delete training example');
        }

        return await response.json();
    }

    /**
     * Export training data to JSON file
     */
    async export() {
        const response = await fetch(`${API_BASE_URL}/api/training/export`, {
            method: 'POST',
            headers: {
                ...adminAuthService.getAuthHeader(),
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to export training data');
        }

        return await response.json();
    }

    /**
     * Validate SQL syntax
     */
    async validate(sql) {
        const response = await fetch(`${API_BASE_URL}/api/training/validate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...adminAuthService.getAuthHeader(),
            },
            body: JSON.stringify({ question: 'dummy', sql }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to validate SQL');
        }

        return await response.json();
    }
}

export const trainingDataService = new TrainingDataService();
