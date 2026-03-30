import * as orderModel from '../models/orderModel';
import { toCsvHeader, toCsvRows } from '../utils/csvExporter';

const EXPORT_BATCH_SIZE = 500;

export async function exportOrdersCsv(): Promise<string> {
  const total = await orderModel.countAll();

  if (total === 0) {
    return 'No orders to export.';
  }

  const chunks: string[] = [];
  let headerWritten = false;
  let offset = 0;

  while (offset < total) {
    const rows = await orderModel.findAllForExport(EXPORT_BATCH_SIZE, offset);

    if (rows.length === 0) break;

    if (!headerWritten) {
      chunks.push(toCsvHeader(rows[0]));
      headerWritten = true;
    }

    chunks.push(toCsvRows(rows));
    offset += rows.length;
  }

  return chunks.join('\n');
}
