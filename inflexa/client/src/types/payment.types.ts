export type PaymentStatus = 'pending' | 'completed' | 'failed';

export type PaymentProvider = 'stripe' | 'paystack';

export interface IPayment {
  id: number;
  order_id: number;
  provider: PaymentProvider;
  stripe_payment_intent_id: string | null;
  paystack_reference: string | null;
  amount: number | string;
  currency: string;
  currency_symbol?: string;
  payment_method: string;
  status: PaymentStatus;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentIntentResponse {
  clientSecret: string;
  payment: IPayment;
}

export interface PaystackInitResponse {
  authorization_url: string;
  reference: string;
  payment: IPayment;
}

export interface PaystackVerifyResponse {
  verified: boolean;
  payment: IPayment;
  order: import('@/types/order.types').IOrder | null;
}
