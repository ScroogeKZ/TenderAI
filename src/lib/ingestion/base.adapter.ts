import { Tender, SourceType, AdapterType } from '../types/tender';

export interface IngestionResult {
  source: SourceType;
  adapterType: AdapterType;
  itemsFetched: number;
  itemsNormalized: number;
  durationMs: number;
  status: 'SUCCESS' | 'WARN' | 'ERROR';
  message: string;
  tenders: Tender[];
}

export abstract class BaseTenderAdapter {
  protected abstract sourceType: SourceType;
  protected abstract adapterType: AdapterType;

  /**
   * Fetch raw data from API or web scraper
   */
  abstract fetchRawData(): Promise<any[]>;

  /**
   * Normalize raw data to unified Tender structure
   */
  abstract normalize(rawData: any[]): Tender[];

  /**
   * Execute full ingestion pipeline with rate limiting, logging and error handling
   */
  async run(): Promise<IngestionResult> {
    const startTime = Date.now();
    try {
      // Simulate rate limiting delay
      await new Promise((resolve) => setTimeout(resolve, 300));
      
      const raw = await this.fetchRawData();
      const normalized = this.normalize(raw);
      const durationMs = Date.now() - startTime;

      return {
        source: this.sourceType,
        adapterType: this.adapterType,
        itemsFetched: raw.length,
        itemsNormalized: normalized.length,
        durationMs,
        status: 'SUCCESS',
        message: `Успешно обработано ${normalized.length} лотов из ${this.sourceType}`,
        tenders: normalized,
      };
    } catch (error: any) {
      const durationMs = Date.now() - startTime;
      return {
        source: this.sourceType,
        adapterType: this.adapterType,
        itemsFetched: 0,
        itemsNormalized: 0,
        durationMs,
        status: 'ERROR',
        message: `Сбой при получении данных: ${error?.message || 'Неизвестная ошибка'}`,
        tenders: [],
      };
    }
  }
}
