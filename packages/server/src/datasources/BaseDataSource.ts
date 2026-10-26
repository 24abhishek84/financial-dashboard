interface BaseDataSourceRequestInit {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}

interface BaseDataSourceResponse {
  ok: boolean;
  status: number;
  statusText: string;
  json(): Promise<unknown>;
  text(): Promise<string>;
}

declare const fetch: (
  input: string,
  init?: BaseDataSourceRequestInit,
) => Promise<BaseDataSourceResponse>;

export class BaseDataSource {
  protected baseURL: string;
  protected token?: string;
  protected userId?: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  setContext(token?: string, userId?: string) {
    this.token = token;
    this.userId = userId;
  }

  protected getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    if (this.userId) {
      headers['X-User-Id'] = this.userId;
    }
    return headers;
  }

  protected async get<T>(endpoint: string): Promise<T> {
    console.log(`[DataSource] GET ${this.baseURL}${endpoint}`);
    const result = await this.request<T>(endpoint, { method: 'GET' });
    console.log(`[DataSource] GET ${endpoint} success`);
    return result;
  }

  protected async post<T>(endpoint: string, body: unknown): Promise<T> {
    console.log(`[DataSource] POST ${this.baseURL}${endpoint}`, 'body:', JSON.stringify(body));
    const result = await this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    console.log(`[DataSource] POST ${endpoint} success`);
    return result;
  }

  protected async patch<T>(endpoint: string, body: unknown): Promise<T> {
    console.log(`[DataSource] PATCH ${this.baseURL}${endpoint}`, 'body:', JSON.stringify(body));
    const result = await this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    console.log(`[DataSource] PATCH ${endpoint} success`);
    return result;
  }

  protected async put<T>(endpoint: string, body: unknown): Promise<T> {
    console.log(`[DataSource] PUT ${this.baseURL}${endpoint}`, 'body:', JSON.stringify(body));
    const result = await this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
    console.log(`[DataSource] PUT ${endpoint} success`);
    return result;
  }

  protected async delete(endpoint: string): Promise<void> {
    console.log(`[DataSource] DELETE ${this.baseURL}${endpoint}`);
    await this.request(endpoint, { method: 'DELETE' });
    console.log(`[DataSource] DELETE ${endpoint} success`);
  }

  private async request<T>(
    endpoint: string,
    options: BaseDataSourceRequestInit = {},
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      let errorDetails = '';
      try {
        const bodyText = await response.text();
        try {
          const bodyJson = JSON.parse(bodyText);
          errorDetails = JSON.stringify(bodyJson);
        } catch {
          errorDetails = bodyText;
        }
      } catch {
        errorDetails = 'Could not read response body';
      }
      console.error(`API Error at ${url}:`, { status: response.status, statusText: response.statusText, details: errorDetails });
      throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorDetails}`);
    }

    if (options.method === 'DELETE') {
      return undefined as T;
    }

    const result = (await response.json()) as T;
    console.log(`[DataSource] Response from ${url}:`, result);
    return result;
  }
}
