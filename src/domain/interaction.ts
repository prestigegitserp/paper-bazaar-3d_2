export type Interaction =
  | { kind: 'vendor'; vendorId: string; label: string }
  | { kind: 'products'; vendorId: string; label: string }
  | { kind: 'product'; vendorId: string; productId: string; label: string }
  | { kind: 'document'; vendorId: string; documentId: string; label: string }
