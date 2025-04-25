import { z } from "zod";

export function searchValidationSchema(t) {
  return z.object({
    search: z
      .string({ message: t("zod.required") })
      .min(2, t("zod.tooSmall"))
      .max(100, t("zod.tooBig"))
      .regex(/^[a-zA-Zа-яА-ЯёЁ0-9\-\.\+\ ]+$/, t("zod.searchString")),
  });
}
