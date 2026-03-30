export type PaymentStatus = 'pending' | 'completed' | 'failed';

export type PaymentProvider = 'stripe' | 'paystack';

export interface IPayment {
  id: number;
  order_id: number;
  provider: PaymentProvider;
  stripe_payment_intent_id: string | null;
  paystack_reference: string | null;
  amount: number;
  currency: string;
  payment_method: string;
  status: PaymentStatus;
  created_at: Date;
  updated_at: Date;
}

export interface CreatePaymentIntentDTO {
  order_id: number;
  currency?: string;
}

export interface CreatePaymentRecord {
  order_id: number;
  provider: PaymentProvider;
  stripe_payment_intent_id: string | null;
  paystack_reference: string | null;
  amount: number;
  currency: string;
  payment_method: string;
  status: PaymentStatus;
}
