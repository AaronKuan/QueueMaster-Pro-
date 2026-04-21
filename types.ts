export enum OrderStatus {
  PREPARING = 'PREPARING',
  READY = 'READY',
  COMPLETED = 'COMPLETED'
}

export interface Order {
  id: string;
  number: string;
  type?: string; // e.g., Takeout (1) vs Eat-in (0), or generic type
  status: OrderStatus;
  updatedAt: number;
}

export interface ScanResult {
  raw: string;
  number: string;
  type?: string;
  explicitStatus?: string; // If the barcode explicitly includes a status code
  timestamp: number;
}