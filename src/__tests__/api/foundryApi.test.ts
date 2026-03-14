/**
 * Unit tests for FoundryApiService.
 * fetch is replaced with a jest mock — no network calls are made.
 */

import { foundryApi } from '../../api/foundryApi';
import { AppConfig } from '../../types';

const config: AppConfig = {
  apiKey: 'test-api-key',
  relayUrl: 'https://relay.example.com',
  clientId: 'client-abc',
  actorUuid: 'Actor.xyz',
};

describe('FoundryApiService', () => {
  let mockFetch: jest.Mock;

  beforeEach(() => {
    mockFetch = jest.fn();
    global.fetch = mockFetch;
    foundryApi.setConfig(config);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  function mockResponse(body: unknown, status = 200) {
    mockFetch.mockResolvedValueOnce({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(body),
    });
  }

  // ── getClients ─────────────────────────────────────────────────────────────

  describe('getClients()', () => {
    it('returns array response directly', async () => {
      const clients = [{ id: '1', name: 'World 1' }];
      mockResponse(clients);
      const result = await foundryApi.getClients();
      expect(result).toEqual(clients);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://relay.example.com/clients',
        expect.objectContaining({ headers: expect.objectContaining({ 'x-api-key': 'test-api-key' }) })
      );
    });

    it('unwraps { data: [...] } envelope', async () => {
      const clients = [{ id: '2', name: 'World 2' }];
      mockResponse({ data: clients });
      expect(await foundryApi.getClients()).toEqual(clients);
    });

    it('unwraps { clients: [...] } envelope', async () => {
      const clients = [{ id: '3', name: 'World 3' }];
      mockResponse({ clients });
      expect(await foundryApi.getClients()).toEqual(clients);
    });

    it('returns empty array for unknown shape', async () => {
      mockResponse({ unknown: true });
      expect(await foundryApi.getClients()).toEqual([]);
    });

    it('throws on HTTP error', async () => {
      mockResponse({}, 401);
      await expect(foundryApi.getClients()).rejects.toThrow('Failed to list clients: 401');
    });
  });

  // ── getActors ──────────────────────────────────────────────────────────────

  describe('getActors()', () => {
    it('filters to only "character" type actors from entities array', async () => {
      const entities = [
        { _id: '1', name: 'Hero', type: 'character' },
        { _id: '2', name: 'Goblin', type: 'npc' },
      ];
      mockResponse({ data: { folders: {}, entities } });
      const result = await foundryApi.getActors();
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Hero');
    });

    it('handles entities as a plain object keyed by uuid', async () => {
      const entities = {
        'Actor.abc': { _id: 'abc', name: 'Char', type: 'character' },
        'Actor.def': { _id: 'def', name: 'NPC', type: 'npc' },
      };
      mockResponse({ data: { folders: {}, entities } });
      const result = await foundryApi.getActors();
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Char');
    });

    it('handles actors nested under entities.actors (relay v13 format)', async () => {
      const actors = [
        { _id: '1', name: 'Fighter', type: 'character' },
        { _id: '2', name: 'The Party', type: 'party' },
      ];
      mockResponse({ data: { folders: {}, entities: { actors } } });
      const result = await foundryApi.getActors();
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Fighter');
    });

    it('calls /structure with correct query params', async () => {
      mockResponse({ data: { entities: [] } });
      await foundryApi.getActors();
      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain('/structure');
      expect(url).toContain('types=Actor');
      expect(url).toContain('includeEntityData=true');
      expect(url).toContain('recursive=true');
      expect(url).toContain('clientId=client-abc');
    });

    it('returns empty array when entities is empty', async () => {
      mockResponse({ data: { entities: [] } });
      expect(await foundryApi.getActors()).toEqual([]);
    });

    it('throws on HTTP error', async () => {
      mockResponse({}, 404);
      await expect(foundryApi.getActors()).rejects.toThrow('Failed to list actors: 404');
    });
  });

  // ── getActor ───────────────────────────────────────────────────────────────

  describe('getActor(uuid)', () => {
    const actor = { _id: 'xyz', name: 'Valeros', type: 'character' };

    it('unwraps { data: {...} } envelope', async () => {
      mockResponse({ data: actor });
      const result = await foundryApi.getActor('Actor.xyz');
      expect(result).toEqual(actor);
    });

    it('returns raw body when no envelope', async () => {
      mockResponse(actor);
      const result = await foundryApi.getActor('Actor.xyz');
      expect(result).toEqual(actor);
    });

    it('calls GET /get with uuid and clientId params', async () => {
      mockResponse({ data: actor });
      await foundryApi.getActor('Actor.xyz');
      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain('/get');
      expect(url).toContain('uuid=Actor.xyz');
      expect(url).toContain('clientId=client-abc');
    });

    it('throws on HTTP error', async () => {
      mockResponse({}, 500);
      await expect(foundryApi.getActor('Actor.xyz')).rejects.toThrow('Failed to get actor: 500');
    });
  });

  // ── updateActor ────────────────────────────────────────────────────────────

  describe('updateActor(uuid, updates)', () => {
    it('sends PUT request with { data: updates } body', async () => {
      mockResponse({ success: true });
      await foundryApi.updateActor('Actor.xyz', { 'system.attributes.hp.value': 42 });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/update'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ data: { 'system.attributes.hp.value': 42 } }),
        })
      );
    });

    it('includes uuid and clientId as query params', async () => {
      mockResponse({ success: true });
      await foundryApi.updateActor('Actor.xyz', {});
      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain('uuid=Actor.xyz');
      expect(url).toContain('clientId=client-abc');
    });

    it('throws on HTTP error', async () => {
      mockResponse({}, 400);
      await expect(foundryApi.updateActor('Actor.xyz', {})).rejects.toThrow('Failed to update actor: 400');
    });
  });

  // ── roll ───────────────────────────────────────────────────────────────────

  describe('roll(formula, label?)', () => {
    const rollData = {
      formula: '1d20+5',
      total: 18,
      isCritical: false,
      isFumble: false,
      dice: [],
    };

    it('unwraps { data: { roll: {...} } } envelope', async () => {
      mockResponse({ data: { roll: rollData } });
      const result = await foundryApi.roll('1d20+5', 'Stealth');
      expect(result).toEqual(rollData);
    });

    it('sends formula and flavor in POST body', async () => {
      mockResponse({ data: { roll: rollData } });
      await foundryApi.roll('1d20+5', 'Stealth');
      const call = mockFetch.mock.calls[0];
      const body = JSON.parse(call[1].body as string);
      expect(body.formula).toBe('1d20+5');
      expect(body.flavor).toBe('Stealth');
    });

    it('sends roll without label (undefined flavor)', async () => {
      mockResponse({ data: { roll: rollData } });
      await foundryApi.roll('1d6');
      const body = JSON.parse(mockFetch.mock.calls[0][1].body as string);
      expect(body.formula).toBe('1d6');
      expect(body.flavor).toBeUndefined();
    });

    it('throws on HTTP error', async () => {
      mockResponse({}, 408);
      await expect(foundryApi.roll('1d20')).rejects.toThrow('Failed to roll dice: 408');
    });
  });

  // ── increaseAttribute ──────────────────────────────────────────────────────

  describe('increaseAttribute(uuid, attribute, amount)', () => {
    it('sends POST /increase with correct params', async () => {
      mockResponse({ success: true });
      await foundryApi.increaseAttribute('Actor.xyz', 'system.attributes.hp.value', 5);
      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toContain('/increase');
      expect(url).toContain('uuid=Actor.xyz');
      expect(url).toContain('clientId=client-abc');
      expect(opts.method).toBe('POST');
      const body = JSON.parse(opts.body as string);
      expect(body.attribute).toBe('system.attributes.hp.value');
      expect(body.amount).toBe(5);
    });

    it('throws on HTTP error', async () => {
      mockResponse({}, 500);
      await expect(foundryApi.increaseAttribute('Actor.xyz', 'hp', 1)).rejects.toThrow(
        'Failed to increase attribute: 500'
      );
    });
  });

  // ── decreaseAttribute ──────────────────────────────────────────────────────

  describe('decreaseAttribute(uuid, attribute, amount)', () => {
    it('sends POST /decrease with correct params', async () => {
      mockResponse({ success: true });
      await foundryApi.decreaseAttribute('Actor.xyz', 'system.attributes.hp.value', 3);
      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toContain('/decrease');
      expect(url).toContain('uuid=Actor.xyz');
      expect(url).toContain('clientId=client-abc');
      expect(opts.method).toBe('POST');
      const body = JSON.parse(opts.body as string);
      expect(body.attribute).toBe('system.attributes.hp.value');
      expect(body.amount).toBe(3);
    });

    it('throws on HTTP error', async () => {
      mockResponse({}, 503);
      await expect(foundryApi.decreaseAttribute('Actor.xyz', 'hp', 1)).rejects.toThrow(
        'Failed to decrease attribute: 503'
      );
    });
  });

  // ── setConfig / baseUrl ────────────────────────────────────────────────────

  describe('setConfig()', () => {
    it('trims trailing slash from relayUrl', async () => {
      foundryApi.setConfig({ ...config, relayUrl: 'https://relay.example.com/' });
      mockResponse([]);
      await foundryApi.getClients();
      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toBe('https://relay.example.com/clients');
    });

    it('sends x-api-key header from config', async () => {
      foundryApi.setConfig({ ...config, apiKey: 'secret-123' });
      mockResponse([]);
      await foundryApi.getClients();
      const headers = mockFetch.mock.calls[0][1].headers as Record<string, string>;
      expect(headers['x-api-key']).toBe('secret-123');
    });
  });
});

