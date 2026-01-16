import { PaymentValidationRequestDTO, PaymentResponseDTO } from '../types/payment.types';

const API_BASE = '/api/payments';

export async function validatePayment(
  data: PaymentValidationRequestDTO,
  token: string
): Promise<PaymentResponseDTO> {
  const res = await fetch(`${API_BASE}/validate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || 'Payment validation failed');
  }

  return res.json();
}

export async function validatePaymentWithRetry(
  data: PaymentValidationRequestDTO,
  token: string,
  maxRetries: number = 3
): Promise<PaymentResponseDTO> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await validatePayment(data, token);
    } catch (err: unknown) {
      const error = err as { message?: string };
      if (error.message?.includes('Transaction not found') && attempt < maxRetries - 1) {
        await new Promise(res => setTimeout(res, (attempt + 1) * 10000));
        continue;
      }
      throw err;
    }
  }
  throw new Error('Max retries reached for payment validation');
}

export async function getPaymentHistory(
  bookingId: number,
  token: string
): Promise<PaymentResponseDTO[]> {
  const res = await fetch(`${API_BASE}/booking/${bookingId}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || 'Failed to fetch payment history');
  }

  return res.json();
}
