import { z } from "zod";

export function abonementValidationSchema(t) {
  return z.object({
    quantity: z.number({ message: t("zod.required") }),
    duration: z.number({ message: t("zod.required") }),
    activationDate: z
      .string({ message: t("zod.required") })
      .regex(
        /^\d{4}-\d{2}-\d{2}$/,
        "Неверный формат даты (ожидается YYYY-MM-DD)"
      ),
    abonementType: z.string({ message: t("zod.required") }),
  });
}
