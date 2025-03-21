import { z } from "zod";

export function userSignInValidationSchema(t) {
  return z.object({
    email: z
      .string({ message: t("zod.required") })
      .min(3, { message: t("zod.tooSmall") })
      .max(150, { message: t("zod.tooBig") })
      .email({ message: t("zod.email") }),
    password: z
      .string({ message: t("zod.required") })
      .min(8, { message: t("zod.tooSmall") })
      .max(150, { message: t("zod.tooBig") }),
    branch: z.coerce.number({ required_error: "Branch is required" }),
  });
}
