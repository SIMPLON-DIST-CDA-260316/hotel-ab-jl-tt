export type ActionErrors = Partial<Record<string, string[]>> & {
  _form?: string[];
};

export type ActionError = {
  success: false;
  errors: ActionErrors;
};