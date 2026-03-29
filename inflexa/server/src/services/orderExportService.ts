import * as orderModel from '../models/orderModel';
import { toCsv } from '../utils/csvExporter';

export async function exportOrdersCsv(): Promise<string> {
  const rows = await orderModel.findAllForExport();

  if (rows.length === 0) {
    return 'No orders to export.';
  }

  return toCsv(rows);
}
