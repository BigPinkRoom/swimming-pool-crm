import { z } from "zod";

export function clientAddValidationSchema(t) {
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
    birthday: z
      .string({ message: t("zod.required") })
      .regex(/^\d{2}\.\d{2}\.\d{4}$/, {
        message: t("zod.dateFormat"),
      }),
  });
}
