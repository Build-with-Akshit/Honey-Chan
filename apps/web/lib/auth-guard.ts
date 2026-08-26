/**
 * Honey Chain — Server-Side Role-Based Auth Guard
 * Validates JWT session and checks user role before allowing API access.
 * 
 * Usage in route handlers:
 *   const { user, errorResponse } = await requireAuth(["BEEKEEPER", "ADMIN"]);
 *   if (errorResponse) return errorResponse;
 *   // user is now typed and validated
 */

import { getSession } from "./auth";
import { NextResponse } from "next/server";

export interface AuthenticatedUser {
  id: number;
  email: string;
  name: string;
  role: string;
  phone: string | null;
  walletAddress: string | null;
  isVerified: boolean;
}

interface AuthResult {
  user: AuthenticatedUser | null;
  errorResponse: NextResponse | null;
}

/**
 * Require authentication and optionally restrict to specific roles.
 * 
 * @param allowedRoles - Array of role strings. If empty/undefined, any authenticated user is allowed.
 * @returns { user, errorResponse } - If errorResponse is non-null, return it immediately from the route.
 */
export async function requireAuth(allowedRoles?: string[]): Promise<AuthResult> {
  const sessionUser = await getSession();

  if (!sessionUser) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { error: "Authentication required. Please log in." },
        { status: 401 }
      ),
    };
  }

  // If roles are specified, check that user has one of the allowed roles
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(sessionUser.role)) {
      return {
        user: null,
        errorResponse: NextResponse.json(
          { error: `Access denied. Required role: ${allowedRoles.join(" or ")}. Your role: ${sessionUser.role}.` },
          { status: 403 }
        ),
      };
    }
  }

  return {
    user: sessionUser as AuthenticatedUser,
    errorResponse: null,
  };
}
