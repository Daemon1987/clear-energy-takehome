import type { Order, PendingAction, TripStop } from '../types/api';
import type { OrderCardProps } from '../components/OrderCard';
import type { Tone } from '../components/theme';

/**
 * Adapters: map each API shape onto the neutral OrderCard interface.
 * They live in shared (not in the apps) so the three apps present data
 * consistently and per-app concerns never leak into the card component.
 */

const ORDER_STATUS: Record<Order['status'], { label: string; tone: Tone }> = {
  placed: { label: 'Placed', tone: 'info' },
  assigned: { label: 'Assigned', tone: 'info' },
  out_for_delivery: { label: 'Out for delivery', tone: 'warning' },
  delivered: { label: 'Delivered', tone: 'success' },
  cancelled: { label: 'Cancelled', tone: 'danger' },
  returned: { label: 'Returned', tone: 'neutral' },
};

const STOP_STATUS: Record<TripStop['status'], { label: string; tone: Tone }> = {
  pending: { label: 'Pending', tone: 'neutral' },
  active: { label: 'Active', tone: 'info' },
  done: { label: 'Done', tone: 'success' },
  skipped: { label: 'Skipped', tone: 'danger' },
};

const PRIORITY: Record<PendingAction['priority'], { label: string; tone: Tone }> = {
  low: { label: 'Low', tone: 'neutral' },
  med: { label: 'Medium', tone: 'info' },
  high: { label: 'High', tone: 'warning' },
  breached: { label: 'SLA breached', tone: 'danger' },
};

const ACTION_LABEL: Record<NonNullable<PendingAction['action']>, string> = {
  approve: 'Approve', route: 'Route', decide: 'Decide',
  assign: 'Assign', remind: 'Remind', review: 'Review',
};

function shortDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

/** Customer App — customer + status + amount. */
export function orderToCard(order: Order): OrderCardProps {
  return {
    title: order.sku.name,
    subtitle: order.address,
    meta: `${order.id} · ${order.customerName} · ${shortDate(order.placedAt)}`,
    amountPaise: order.amountPaise,
    statusChip: ORDER_STATUS[order.status],
    accessoryChip:
      order.status === 'out_for_delivery' && order.eta
        ? { label: `ETA ${new Date(order.eta).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}`, tone: 'info' }
        : undefined,
    testID: `order-${order.id}`,
  };
}

/** Driver App — address-first + ETA badge, highlight the active stop. */
export function tripStopToCard(stop: TripStop): OrderCardProps {
  return {
    title: stop.customerName,
    subtitle: stop.address,
    meta: `${stop.orderId}${stop.sku ? ` · ${stop.sku}` : ''} · ${stop.distanceKm} km`,
    statusChip: STOP_STATUS[stop.status],
    accessoryChip:
      stop.etaMin != null ? { label: `ETA ${stop.etaMin} min`, tone: 'info' } : undefined,
    highlighted: stop.status === 'active',
    testID: `stop-${stop.orderId}`,
  };
}

/** Admin Mobile — priority chip + action affordance. */
export function pendingActionToCard(item: PendingAction): OrderCardProps {
  const sla = item.slaMinutes != null ? ` · SLA ${item.slaMinutes}m` : '';
  return {
    title: item.summary,
    meta: `${item.id} · ${item.category.replace(/_/g, ' ')} · waiting ${item.ageMinutes}m${sla}`,
    statusChip: PRIORITY[item.priority],
    accessoryChip: item.action
      ? { label: ACTION_LABEL[item.action], tone: 'success' }
      : undefined,
    testID: `action-${item.id}`,
  };
}
