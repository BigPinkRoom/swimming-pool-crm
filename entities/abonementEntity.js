import { transformKeysToSnakeCase } from "~/helpers/CamelToSnakeCase";
import { transformKeysToCamelCase } from "~/helpers/snakeToCamelCase";
import { removeSpaces } from "~/helpers/removeSpaces";

export default class AbonementEntity {
  constructor({ context } = {}) {
    this.context = context;
  }

  createFamilyModelRequest({ clients, relatives, abonements }) {
    const telephonesWithoutSpaces = removeSpaces(relatives);

    return {
      clients: transformKeysToSnakeCase(clients),
      relatives: transformKeysToSnakeCase(relatives),
      abonements: transformKeysToSnakeCase(abonements),
    };
  }

  createAddFamilyFormData({ clients, relatives, abonements }) {
    const formData = new FormData();

    formData.append("clients", JSON.stringify(clients));
    formData.append("relatives", JSON.stringify(relatives));
    if (abonements) {
      formData.append("abonements", JSON.stringify(abonements));
    }

    return formData;
  }

  createFamilyModelResponse(rawFullAbonement) {
    const processedFullAbonement = transformKeysToCamelCase(rawFullAbonement);

    return processedFullAbonement;
  }
}
