/**
 * Single source of truth for API types, derived from openapi.yaml.
 * Imported by all three apps — never duplicated.
 */

export type OrderStatus =
  | 'placed'
  | 'assigned'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export interface Sku {
  code: string;
  name: string;
  qty?: number;
}

export interface Order {
  id: string;
  customerId?: string;
  customerName: string;
  address: string;
  /** Integer paise (₹1,180.00 = 118000). Format on the client via formatPaise. */
  amountPaise: number;
  sku: Sku;
  status: OrderStatus;
  /** ISO 8601 UTC */
  placedAt: string;
  eta?: string | null;
}

export type TripStopStatus = 'pending' | 'active' | 'done' | 'skipped';

export interface TripStop {
  seq: number;
  orderId: string;
  driverId?: string;
  customerName: string;
  sku?: string;
  address: string;
  distanceKm: number;
  status: TripStopStatus;
  etaMin?: number | null;
}

export type PendingActionCategory =
  | 'mi_empty'
  | 'mi_full'
  | 'cash'
  | 'prior_delivery'
  | 'unassigned'
  | 'verification'
  | 'branch_assign'
  | 'kyc';

export type Priority = 'low' | 'med' | 'high' | 'breached';

export type PendingActionKind =
  | 'approve'
  | 'route'
  | 'decide'
  | 'assign'
  | 'remind'
  | 'review';

export interface PendingAction {
  id: string;
  adminId?: string;
  category: PendingActionCategory;
  summary: string;
  priority: Priority;
  ageMinutes: number;
  slaMinutes?: number;
  action?: PendingActionKind;
}
