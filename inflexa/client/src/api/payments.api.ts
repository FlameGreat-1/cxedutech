import apiClient from './client';
import type { ApiResponse } from '@/types/api.types';
import type { IPayment, CreatePaymentIntentResponse } from '@/types/payment.types';

export async function createIntent(orderId: number): Promise<CreatePaymentIntentResponse> {
  const res = await apiClient.post<ApiResponse<CreatePaymentIntentResponse>>(
    '/payments/create-intent',
    { order_id: orderId }
  );
  return res.data.data;
}

export async function createGuestIntent(orderId: number): Promise<CreatePaymentIntentResponse> {
  const res = await apiClient.post<ApiResponse<CreatePaymentIntentResponse>>(
    '/payments/guest/create-intent',
    { order_id: orderId }
  );
  return res.data.data;
}

export async function getPayment(paymentId: number): Promise<IPayment> {
  const res = await apiClient.get<ApiResponse<IPayment>>(`/payments/${paymentId}`);
  return res.data.data;
}
