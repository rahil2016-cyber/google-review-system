export type UserRole = "SUPER_ADMIN" | "BUSINESS_ADMIN" | "BRANCH_MANAGER" | "STAFF";

export type JwtClaims = {
  sub: string;
  tenantId: string;
  role: UserRole;
  exp: number;
};

export type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
};

export type ReviewDto = {
  id: string;
  tenantId: string;
  branchId?: string;
  customerId?: string;
  rating: number;
  reviewText?: string;
  source: "GOOGLE" | "MANUAL" | "QR" | "NFC" | "WHATSAPP";
  createdAt: string;
};
