import { AppConfig, FoundryClient, PF2eCharacter, RollResult } from '../types';

class FoundryApiService {
  private config: AppConfig = {
    apiKey: '',
    relayUrl: 'https://foundryvtt-rest-api-relay.fly.dev',
    clientId: '',
    actorUuid: '',
  };

  setConfig(config: AppConfig) {
    this.config = config;
  }

  private get headers(): Record<string, string> {
    return {
      'x-api-key': this.config.apiKey,
      'Content-Type': 'application/json',
    };
  }

  private get baseUrl(): string {
    return this.config.relayUrl.replace(/\/$/, '');
  }

  /** List all connected Foundry clients (worlds) */
  async getClients(): Promise<FoundryClient[]> {
    const resp = await fetch(`${this.baseUrl}/clients`, {
      headers: this.headers,
    });
    if (!resp.ok) throw new Error(`Failed to list clients: ${resp.status}`);
    const data = await resp.json();
    // Response may be an array or { clients: [...] }
    if (Array.isArray(data)) return data as FoundryClient[];
    if (data.clients) return data.clients as FoundryClient[];
    return [];
  }

  /** Get all actors (characters) from the connected world */
  async getActors(): Promise<PF2eCharacter[]> {
    const params = new URLSearchParams({
      clientId: this.config.clientId,
      entityType: 'Actor',
    });
    const resp = await fetch(`${this.baseUrl}/search?${params}`, {
      headers: this.headers,
    });
    if (!resp.ok) throw new Error(`Failed to search actors: ${resp.status}`);
    const data = await resp.json();
    // Filter to PC characters only
    const results: PF2eCharacter[] = Array.isArray(data) ? data : (data.results ?? data.data ?? []);
    return results.filter((a) => a.type === 'character');
  }

  /** Get a single actor/entity by UUID */
  async getActor(uuid: string): Promise<PF2eCharacter> {
    const params = new URLSearchParams({
      clientId: this.config.clientId,
      uuid,
    });
    const resp = await fetch(`${this.baseUrl}/get?${params}`, {
      headers: this.headers,
    });
    if (!resp.ok) throw new Error(`Failed to get actor: ${resp.status}`);
    const data = await resp.json();
    return data as PF2eCharacter;
  }

  /** Update an actor's data */
  async updateActor(uuid: string, updates: Record<string, unknown>): Promise<void> {
    const params = new URLSearchParams({
      clientId: this.config.clientId,
      uuid,
    });
    const resp = await fetch(`${this.baseUrl}/update?${params}`, {
      method: 'PUT',
      headers: this.headers,
      body: JSON.stringify(updates),
    });
    if (!resp.ok) throw new Error(`Failed to update actor: ${resp.status}`);
  }

  /** Perform a dice roll */
  async roll(formula: string, label?: string): Promise<RollResult> {
    const params = new URLSearchParams({ clientId: this.config.clientId });
    const resp = await fetch(`${this.baseUrl}/roll?${params}`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ formula, flavor: label }),
    });
    if (!resp.ok) throw new Error(`Failed to roll dice: ${resp.status}`);
    return resp.json() as Promise<RollResult>;
  }

  /** Increase an attribute */
  async increaseAttribute(uuid: string, attribute: string, amount: number): Promise<void> {
    const params = new URLSearchParams({ clientId: this.config.clientId, uuid });
    const resp = await fetch(`${this.baseUrl}/increase?${params}`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ attribute, amount }),
    });
    if (!resp.ok) throw new Error(`Failed to increase attribute: ${resp.status}`);
  }

  /** Decrease an attribute */
  async decreaseAttribute(uuid: string, attribute: string, amount: number): Promise<void> {
    const params = new URLSearchParams({ clientId: this.config.clientId, uuid });
    const resp = await fetch(`${this.baseUrl}/decrease?${params}`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ attribute, amount }),
    });
    if (!resp.ok) throw new Error(`Failed to decrease attribute: ${resp.status}`);
  }
}

export const foundryApi = new FoundryApiService();
export default foundryApi;
