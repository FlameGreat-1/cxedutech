export type PaymentStatus = 'pending' | 'completed' | 'failed';

export interface IPayment {
  id: number;
  order_id: number;
  stripe_payment_intent_id: string;
  amount: number | string;
  currency: string;
  currency_symbol?: string;
  payment_method: string;
  status: PaymentStatus;
  created_at: string;
}

export interface CreatePaymentIntentResponse {
  clientSecret: string;
  payment: IPayment;
}
