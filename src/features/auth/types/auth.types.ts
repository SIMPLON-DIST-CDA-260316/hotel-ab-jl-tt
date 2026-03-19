export type Role = "admin" | "manager" | "client";

export type AuthActionState<T = void> =
  | { status: "idle" }
  | {
      status: "error";
      fieldErrors?: T extends void ? never : Partial<Record<keyof T, string>>;
      formError?: string;
    }
  | { status: "success" };

export interface RegisterFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginFormValues {
  email: string;
  password: string;
}
