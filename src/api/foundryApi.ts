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

  /** List all connected Foundry clients (worlds).
   *  Response shape: array of clients OR { data: [...] } OR { clients: [...] }
   */
  async getClients(): Promise<FoundryClient[]> {
    const resp = await fetch(`${this.baseUrl}/clients`, {
      headers: this.headers,
    });
    if (!resp.ok) throw new Error(`Failed to list clients: ${resp.status}`);
    const body = await resp.json();
    if (Array.isArray(body)) return body as FoundryClient[];
    if (Array.isArray(body?.data)) return body.data as FoundryClient[];
    if (Array.isArray(body?.clients)) return body.clients as FoundryClient[];
    return [];
  }

  /** Get all player-character actors from the connected world using the
   *  /structure endpoint (does not require Quick Insert module).
   *  Response: { data: { folders: {...}, entities: {...} } }
   */
  async getActors(): Promise<PF2eCharacter[]> {
    const params = new URLSearchParams({
      clientId: this.config.clientId,
      types: 'Actor',
      includeEntityData: 'true',
      recursive: 'true',
    });
    const resp = await fetch(`${this.baseUrl}/structure?${params}`, {
      headers: this.headers,
    });
    if (!resp.ok) throw new Error(`Failed to list actors: ${resp.status}`);
    const body = await resp.json();
    // entities may be an array or a plain-object keyed by uuid/name
    const rawEntities = body?.data?.entities ?? body?.entities ?? [];
    const entities: PF2eCharacter[] = Array.isArray(rawEntities)
      ? rawEntities
      : (Object.keys(rawEntities) as string[]).map((k) => (rawEntities as Record<string, PF2eCharacter>)[k]);
    return entities.filter((a) => a.type === 'character');
  }

  /** Get a single actor/entity by UUID.
   *  Response: { data: { ...actor } }
   */
  async getActor(uuid: string): Promise<PF2eCharacter> {
    const params = new URLSearchParams({
      clientId: this.config.clientId,
      uuid,
    });
    const resp = await fetch(`${this.baseUrl}/get?${params}`, {
      headers: this.headers,
    });
    if (!resp.ok) throw new Error(`Failed to get actor: ${resp.status}`);
    const body = await resp.json();
    // Unwrap relay envelope: { data: { ...actor } }
    return (body?.data ?? body) as PF2eCharacter;
  }

  /** Update an actor's data.
   *  Body must be { data: { ...updates } } per the relay schema.
   */
  async updateActor(uuid: string, updates: Record<string, unknown>): Promise<void> {
    const params = new URLSearchParams({
      clientId: this.config.clientId,
      uuid,
    });
    const resp = await fetch(`${this.baseUrl}/update?${params}`, {
      method: 'PUT',
      headers: this.headers,
      body: JSON.stringify({ data: updates }),
    });
    if (!resp.ok) throw new Error(`Failed to update actor: ${resp.status}`);
  }

  /** Perform a dice roll.
   *  Response: { data: { roll: { formula, total, isCritical, isFumble, dice } } }
   */
  async roll(formula: string, label?: string): Promise<RollResult> {
    const params = new URLSearchParams({ clientId: this.config.clientId });
    const resp = await fetch(`${this.baseUrl}/roll?${params}`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ formula, flavor: label }),
    });
    if (!resp.ok) throw new Error(`Failed to roll dice: ${resp.status}`);
    const body = await resp.json();
    // Unwrap relay envelope: { data: { roll: { ... } } }
    return (body?.data?.roll ?? body?.data ?? body) as RollResult;
  }

  /** Increase an attribute.
   *  clientId + uuid are query params; attribute + amount are body params.
   */
  async increaseAttribute(uuid: string, attribute: string, amount: number): Promise<void> {
    const params = new URLSearchParams({ clientId: this.config.clientId, uuid });
    const resp = await fetch(`${this.baseUrl}/increase?${params}`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ attribute, amount }),
    });
    if (!resp.ok) throw new Error(`Failed to increase attribute: ${resp.status}`);
  }

  /** Decrease an attribute.
   *  clientId + uuid are query params; attribute + amount are body params.
   */
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
