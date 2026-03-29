export type PaymentStatus = 'pending' | 'completed' | 'failed';

export interface IPayment {
  id: number;
  order_id: number;
  stripe_payment_intent_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  status: PaymentStatus;
  created_at: Date;
}

export interface CreatePaymentIntentDTO {
  order_id: number;
  currency?: string;
}
