import { z } from "zod";

export function userSignInValidationSchema(t) {
  return z.object({
    branch: z.coerce.number({ message: t("zod.required") }),
    email: z
      .string({ message: t("zod.required") })
      .min(3, { message: t("zod.tooSmall") })
      .max(150, { message: t("zod.tooBig") })
      .email({ message: t("zod.email") }),
    password: z
      .string({ message: t("zod.required") })
      .min(8, { message: t("zod.tooSmall") })
      .max(150, { message: t("zod.tooBig") }),
  });
}

export function userSignUpValidationSchema(t) {
  return z
    .object({
      branch: z.coerce.number({ message: t("zod.required") }),
      email: z
        .string({ message: t("zod.required") })
        .min(3, { message: t("zod.tooSmall") })
        .max(150, { message: t("zod.tooBig") })
        .email({ message: t("zod.email") }),
      password: z
        .string({ message: t("zod.required") })
        .min(8, { message: t("zod.tooSmall") })
        .max(150, { message: t("zod.tooBig") }),
      passwordConfirm: z.string({ message: t("zod.required") }),
      surname: z
        .string({ message: t("zod.required") })
        .min(2, { message: t("zod.tooSmall") })
        .max(150, { message: t("zod.tooBig") }),
      name: z
        .string({ message: t("zod.required") })
        .min(2, { message: t("zod.tooSmall") })
        .max(150, { message: t("zod.tooBig") }),
      patronymic: z
        .string({ message: t("zod.required") })
        .min(2, { message: t("zod.tooSmall") })
        .max(150, { message: t("zod.tooBig") }),
    })
    .refine(
      (data) =>
        data.password === data.passwordConfirm && data.passwordConfirm !== "",
      {
        message: t("zod.notMatch"),
        path: ["passwordConfirm"],
      }
    )
    .refine(
      (data) =>
        data.password === data.passwordConfirm && data.passwordConfirm !== "",
      {
        message: t("zod.notMatch"),
        path: ["password"],
      }
    );
}
