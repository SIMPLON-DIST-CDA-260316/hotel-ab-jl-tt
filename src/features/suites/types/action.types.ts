export type ActionErrors = Partial<Record<string, string[]>> & {
  _form?: string[];
};

export type ActionResult = {
  success: false;
  errors: ActionErrors;
};