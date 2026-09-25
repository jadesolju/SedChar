export interface AITelemetryPayload {
  operation: 'parse' | 'enhance' | 'local_parse';
  modelRequested?: string;
  modelUsed?: string;
  fallbackTriggered?: boolean;
  promptTokensEst?: number;
  completionTokensEst?: number;
  durationMs?: number;
  inputLength?: number;
  outputLength?: number;
  success: boolean;
  error?: string;
}

export function estimateTokenCount(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / 2.5);
}

export function logAITelemetry(data: AITelemetryPayload): void {
  const timestamp = new Date().toISOString();
  console.log(`[AI-TELEMETRY] ${timestamp} | op=${data.operation} | model=${data.modelUsed || 'none'} | fallback=${data.fallbackTriggered ? 'YES' : 'NO'} | dur=${data.durationMs || 0}ms | inChars=${data.inputLength || 0} | outChars=${data.outputLength || 0} | estTokensIn=${data.promptTokensEst || 0} | estTokensOut=${data.completionTokensEst || 0} | status=${data.success ? 'OK' : 'ERROR'}`);
}
