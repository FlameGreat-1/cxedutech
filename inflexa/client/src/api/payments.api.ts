import apiClient from './client';
import type { ApiResponse } from '@/types/api.types';
import type {
  IPayment,
  CreatePaymentIntentResponse,
  PaystackInitResponse,
  PaystackVerifyResponse,
} from '@/types/payment.types';

// -- Stripe --

export async function createStripeIntent(orderId: number): Promise<CreatePaymentIntentResponse> {
  const res = await apiClient.post<ApiResponse<CreatePaymentIntentResponse>>(
    '/payments/stripe/create-intent',
    { order_id: orderId }
  );
  return res.data.data;
}

export async function createGuestStripeIntent(orderId: number): Promise<CreatePaymentIntentResponse> {
  const res = await apiClient.post<ApiResponse<CreatePaymentIntentResponse>>(
    '/payments/stripe/guest/create-intent',
    { order_id: orderId }
  );
  return res.data.data;
}

// -- Paystack --

export async function initializePaystack(orderId: number): Promise<PaystackInitResponse> {
  const res = await apiClient.post<ApiResponse<PaystackInitResponse>>(
    '/payments/paystack/initialize',
    { order_id: orderId }
  );
  return res.data.data;
}

export async function initializeGuestPaystack(orderId: number): Promise<PaystackInitResponse> {
  const res = await apiClient.post<ApiResponse<PaystackInitResponse>>(
    '/payments/paystack/guest/initialize',
    { order_id: orderId }
  );
  return res.data.data;
}

export async function verifyPaystack(reference: string): Promise<PaystackVerifyResponse> {
  const res = await apiClient.get<ApiResponse<PaystackVerifyResponse>>(
    `/payments/paystack/verify/${encodeURIComponent(reference)}`
  );
  return res.data.data;
}

// -- Gateway Status --

export interface GatewayStatus {
  stripe: { enabled: boolean; publicKey: string };
  paystack: { enabled: boolean; publicKey: string };
}

export async function getGatewayStatus(): Promise<GatewayStatus> {
  const res = await apiClient.get<ApiResponse<GatewayStatus>>('/payments/gateways/status');
  return res.data.data;
}

// -- Shared --

export async function getPayment(paymentId: number): Promise<IPayment> {
  const res = await apiClient.get<ApiResponse<IPayment>>(`/payments/${paymentId}`);
  return res.data.data;
}
