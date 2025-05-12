import { z } from "zod";

export function relativeAddValidationSchema(t) {
  return z.object({
    surname: z
      .string({ message: t("zod.required") })
      .min(1, { message: t("zod.tooSmall") })
      .max(150, { message: t("zod.tooBig") })
      .regex(/^[a-zA-Zа-яА-ЯёЁ\s]+$/, { message: t("zod.onlyLetters") }),
    name: z
      .string({ message: t("zod.required") })
      .min(1, { message: t("zod.tooSmall") })
      .max(150, { message: t("zod.tooBig") })
      .regex(/^[a-zA-Zа-яА-ЯёЁ\s]+$/, { message: t("zod.onlyLetters") }),
    patronymic: z
      .string({ message: t("zod.required") })
      .min(1, { message: t("zod.tooSmall") })
      .max(150, { message: t("zod.tooBig") })
      .regex(/^[a-zA-Zа-яА-ЯёЁ\s]+$/, { message: t("zod.onlyLetters") }),
    relativeTypeId: z.number({ message: t("zod.required") }),
    telephone: z
      .string({ message: t("zod.required") })
      .min(18, { message: t("zod.tooSmall") }),
  });
}
