import { useState, useEffect, useCallback, useRef } from 'react';
import { SCANNER_TIMEOUT_MS } from '../constants';
import { ScanResult } from '../types';

interface UseBarcodeScannerProps {
  onScan: (result: ScanResult) => void;
}

export const useBarcodeScanner = ({ onScan }: UseBarcodeScannerProps) => {
  const [buffer, setBuffer] = useState<string>('');
  const [lastAction, setLastAction] = useState<string>('Waiting for input...');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const processBuffer = useCallback((input: string) => {
    // 1. Full-width comma fix
    const cleanedInput = input.replace(/，/g, ',');
    
    // 2. Parse Format: Number or Number,Type or Number,Type,Status
    const parts = cleanedInput.split(',');
    const number = parts[0]?.trim();
    const type = parts[1]?.trim();
    const explicitStatus = parts[2]?.trim();

    if (number) {
      const result: ScanResult = {
        raw: cleanedInput,
        number,
        type: type || undefined,
        explicitStatus: explicitStatus || undefined,
        timestamp: Date.now()
      };
      
      setLastAction(`Processed: ${number} ${type ? `(T:${type})` : ''} ${explicitStatus ? `(S:${explicitStatus})` : ''}`);
      onScan(result);
    } else {
      setLastAction('Invalid Input: Empty Number');
    }
    
    setBuffer('');
  }, [onScan]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore non-character keys except Enter
      if (e.key.length > 1 && e.key !== 'Enter') return;

      // Clear previous timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (e.key === 'Enter') {
        // If buffer is not empty, process it
        if (buffer.length > 0) {
          processBuffer(buffer);
        }
      } else {
        // Append to buffer
        setBuffer((prev) => prev + e.key);
        
        // Set debounce timeout to clear buffer if input is too slow (manual typing vs scanner)
        timeoutRef.current = setTimeout(() => {
          setBuffer('');
          // Optional: Log cleared buffer for debugging
          // console.log('Buffer cleared due to timeout');
        }, SCANNER_TIMEOUT_MS);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [buffer, processBuffer]);

  return { buffer, lastAction };
};