export const STORAGE_KEY = 'queuemaster_pro_orders';
export const SCANNER_TIMEOUT_MS = 500;

// Mapping specific codes in barcode to status if provided explicitly
// e.g., "101,1,2" -> Order 101, Type 1, Status READY
export const STATUS_CODE_MAP: Record<string, string> = {
  '1': 'PREPARING',
  '2': 'READY',
  '3': 'COMPLETED'
};