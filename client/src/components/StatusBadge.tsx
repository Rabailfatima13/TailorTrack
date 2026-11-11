import type { OrderStatus } from "../types";

const colors: Record<OrderStatus, string> = {
  Pending: "bg-slate-100 text-slate-600",
  "In progress": "bg-powder-100 text-powder-600",
  Ready: "bg-blush-100 text-blush-600",
  Delivered: "bg-green-50 text-green-600",
};

function StatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`rounded-full px-2.5 py-1 text-xs ${colors[status]}`}>{status}</span>;
}

export default StatusBadge;
